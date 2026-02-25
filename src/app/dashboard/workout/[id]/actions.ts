'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getWorkoutSession(logId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Get the Log + Workout Details
    const { data: log, error } = await supabase
        .from('workout_logs')
        .select(`
            id,
            status,
            date,
            workout:workouts (
                id,
                name,
                description
            )
        `)
        .eq('id', logId)
        .eq('client_id', user.id)
        .single()

    if (error || !log) return null

    const workoutData = Array.isArray(log.workout) ? log.workout[0] : log.workout

    // Get the Template Exercises — ONLY for this workout
    const { data: exercises } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('workout_id', workoutData.id)
        .order('order_index', { ascending: true })

    // Get existing logs for this session to show what's done
    const { data: exerciseLogs } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('log_id', logId)

    // Get the Previous Session for History (excluding current log so re-entry works)
    const { data: lastLog } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('client_id', user.id)
        .eq('workout_id', workoutData.id)
        .eq('status', 'completed')
        .neq('id', logId)
        .order('date', { ascending: false })
        .limit(1)
        .single()

    let previousLogs: any[] = []
    if (lastLog) {
         const { data: prev } = await supabase
            .from('exercise_logs')
            .select('*')
            .eq('log_id', lastLog.id)
         previousLogs = prev || []
    }

    // Get Personal Records (all-time max weight per exercise)
    const exerciseNames = (exercises || []).map((e: any) => e.exercise_name)
    let personalRecords: Record<string, number> = {}
    if (exerciseNames.length > 0) {
        const { data: prData } = await supabase
            .from('exercise_logs')
            .select('exercise_name, weight, workout_logs!inner(client_id)')
            .eq('workout_logs.client_id', user.id)
            .in('exercise_name', exerciseNames)
        
        if (prData) {
            for (const row of prData) {
                const name = row.exercise_name
                if (!personalRecords[name] || row.weight > personalRecords[name]) {
                    personalRecords[name] = row.weight
                }
            }
        }
    }

    return {
        log: { ...log, workout: workoutData },
        exercises: exercises || [],
        history: exerciseLogs || [],
        previousLogs,
        personalRecords
    }
}

export async function logSet(formData: FormData) {
    const logId = formData.get('logId') as string
    const exerciseName = formData.get('exerciseName') as string
    const setNumber = parseInt(formData.get('setNumber') as string)
    const weight = parseFloat(formData.get('weight') as string)
    const reps = parseInt(formData.get('reps') as string)

    const supabase = await createClient()
    
    // Check if update or insert
    // For MVP, simplistic "upsert" based on logic or just insert. 
    // To allow "toggling", we might want to check if it exists.
    
    const { error } = await supabase
        .from('exercise_logs')
        .upsert({
            log_id: logId,
            exercise_name: exerciseName,
            set_number: setNumber,
            weight,
            reps
        }, { onConflict: 'log_id, exercise_name, set_number'})

    if (error) {
        console.error('Error logging set:', error)
        return { error: 'Failed' }
    }

    revalidatePath(`/dashboard/workout/${logId}`)
    return { success: true }
}

export async function deleteSet(formData: FormData) {
    const logId = formData.get('logId') as string
    const exerciseName = formData.get('exerciseName') as string
    const setNumber = parseInt(formData.get('setNumber') as string)

    const supabase = await createClient()

    const { error } = await supabase
        .from('exercise_logs')
        .delete()
        .match({
            log_id: logId,
            exercise_name: exerciseName,
            set_number: setNumber
        })

    if (error) {
        console.error('Error deleting set:', error)
        return { error: 'Failed' }
    }

    revalidatePath(`/dashboard/workout/${logId}`)
    return { success: true }
}

export async function finishWorkout(formData: FormData) {
    const logId = formData.get('logId') as string
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    // 1. Get current log status to prevent double deduction
    const { data: currentLog } = await supabase
        .from('workout_logs')
        .select('status, client_id')
        .eq('id', logId)
        .single()
    
    if (currentLog?.status === 'completed') {
        redirect('/dashboard')
        return
    }

    // 2. Find active subscription to deduct credit
    const { data: subscription } = await supabase
        .from('client_subscriptions')
        .select('id, credits_remaining')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .gt('credits_remaining', 0)
        .gte('end_date', new Date().toISOString())
        .order('end_date', { ascending: true }) // Deduct from the one expiring first
        .limit(1)
        .single()
    
    // 3. Deduct credit if subscription exists
    if (subscription) {
        await supabase
            .from('client_subscriptions')
            .update({ credits_remaining: subscription.credits_remaining - 1 })
            .eq('id', subscription.id)
    }

    const rpe = formData.get('rpe')
    const notes = formData.get('notes')

    // 4. Mark workout as completed + Save feedback
    await supabase
        .from('workout_logs')
        .update({ 
            status: 'completed',
            rpe: rpe ? parseInt(rpe as string) : null,
            notes: notes as string
        })
        .eq('id', logId)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/workout/' + logId)
    redirect('/dashboard')
}

export async function getExerciseHistory(exerciseName: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []

    // Fetch last 10 logs for this exercise, joined with workout date
    const { data, error } = await supabase
        .from('exercise_logs')
        .select(`
            *,
            workout_log:workout_logs (
                date,
                workout:workouts (name)
            )
        `)
        .eq('exercise_name', exerciseName)
        .order('created_at', { ascending: false })
        .limit(20) // Last 20 sets should cover a few sessions
    
    if (error) {
        console.error('Error fetching history:', error)
        return []
    }

    // Group by Date/Session
    const historyBySession = data.reduce((acc: any, log: any) => {
        const date = new Date(log.workout_log.date).toLocaleDateString()
        if (!acc[date]) {
            acc[date] = {
                date,
                workoutName: log.workout_log.workout?.name || 'Entrenamiento',
                sets: []
            }
        }
        acc[date].sets.push(log)
        return acc
    }, {})

    return Object.values(historyBySession)
}
