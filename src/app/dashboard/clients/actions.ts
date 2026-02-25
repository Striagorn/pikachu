'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getClients() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: clients, error } = await supabase
    .from('clients_trainers')
    .select(`
      status,
      created_at,
      client:profiles!client_id (
        id,
        full_name,
        avatar_url,
        role,
        client_subscriptions:client_subscriptions!client_subscriptions_client_id_fkey (
            id,
            plan_id,
            credits_remaining,
            end_date,
            status,
            trainer_id
        ),
        workout_logs (
            date,
            status
        )
      )
    `)
    .eq('trainer_id', user.id)

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return clients.map((record: any) => {
      const clientProfile = record.client;
      
      // Find active subscription for THIS trainer
      const subs = clientProfile.client_subscriptions || []
      const activeSub = subs.find((s: any) => 
          s.trainer_id === user.id &&
          s.status === 'active' && 
          new Date(s.end_date) > new Date() &&
          s.credits_remaining > 0
      )

      // Find last completed workout
      const logs = clientProfile.workout_logs || []
      const completedLogs = logs.filter((l: any) => l.status === 'completed')
      // Sort desc
      completedLogs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      const lastWorkoutDate = completedLogs.length > 0 ? completedLogs[0].date : null
      
      return {
        ...clientProfile,
        status: record.status,
        joined_at: record.created_at,
        subscription: activeSub,
        last_workout_date: lastWorkoutDate,
        total_completed_workouts: completedLogs.length
      }
  })
}

export async function addClientByEmail(email: string) {
    // Simplified for MVP
    return { success: true, message: "Use the invite link to add clients." }
}

export async function assignWorkout(formData: FormData) {
    const clientId = formData.get('clientId') as string
    const workoutId = formData.get('workoutId') as string
    
    if (!clientId || !workoutId) return { error: "Missing data" }

    const supabase = await createClient()
    
    // Create a new log entry "in-progress" for today
    const { error } = await supabase
        .from('workout_logs')
        .insert({
            client_id: clientId,
            workout_id: workoutId,
            status: 'in-progress',
            date: new Date().toISOString()
        })
    
    if (error) {
        console.error('Error assigning workout:', error)
        return { error: 'Failed to assign workout' }
    }

    revalidatePath('/dashboard/clients')
    return { success: true }
}

export async function assignPlan(clientId: string, planId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: "No autorizado" }

    // 1. Get Plan Details
    const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single()
    
    if (planError || !plan) return { error: "Plan no encontrado" }

    // 2. Calculate End Date
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + plan.validity_days)

    const { error } = await supabase
        .from('client_subscriptions')
        .insert({
            client_id: clientId,
            trainer_id: user.id,
            plan_id: planId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            credits_total: plan.session_credits,
            credits_remaining: plan.session_credits,
            price_paid: plan.price
        })

    if (error) {
        console.error('Error assigning plan:', error)
        return { error: 'Error al asignar plan' }
    }

    revalidatePath('/dashboard/clients')
    return { success: true }
}

// ═══ WORKOUT SCHEDULE ═══

export async function getClientSchedule(clientId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('workout_schedule')
        .select(`
            id,
            workout_id,
            day_of_week,
            specific_date,
            is_recurring,
            created_at,
            workout:workouts (
                id,
                name,
                description
            )
        `)
        .eq('client_id', clientId)
        .eq('trainer_id', user.id)
        .order('day_of_week', { ascending: true })

    if (error) {
        console.error('Error fetching schedule:', error)
        return []
    }
    return data
}

export async function addScheduleEntry(
    clientId: string,
    workoutId: string,
    dayOfWeek: number | null,
    specificDate: string | null,
    isRecurring: boolean
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    // If recurring, remove existing entry for same day_of_week (replace)
    if (isRecurring && dayOfWeek !== null) {
        await supabase
            .from('workout_schedule')
            .delete()
            .eq('client_id', clientId)
            .eq('trainer_id', user.id)
            .eq('day_of_week', dayOfWeek)
            .eq('is_recurring', true)
    }

    const { error } = await supabase
        .from('workout_schedule')
        .insert({
            trainer_id: user.id,
            client_id: clientId,
            workout_id: workoutId,
            day_of_week: isRecurring ? dayOfWeek : null,
            specific_date: !isRecurring ? specificDate : null,
            is_recurring: isRecurring,
        })

    if (error) {
        console.error('Error adding schedule:', error)
        return { error: 'Error al agregar al calendario' }
    }

    revalidatePath('/dashboard/clients')
    return { success: true }
}

export async function deleteScheduleEntry(id: string) {
    const supabase = await createClient()
    await supabase.from('workout_schedule').delete().eq('id', id)
    revalidatePath('/dashboard/clients')
    return { success: true }
}

// ═══ TRAINER FEEDBACK ═══

export async function saveTrainerFeedback(logId: string, feedback: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }
    const { error } = await supabase
        .from('workout_logs')
        .update({ trainer_feedback: feedback })
        .eq('id', logId)
    if (error) return { error: 'Error al guardar feedback' }
    revalidatePath('/dashboard/clients')
    return { success: true }
}

// ═══ CLIENT PROGRESS ═══

export async function getClientProgress(clientId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { recentSessions: [], personalRecords: [] }

    const { data: sessions } = await supabase
        .from('workout_logs')
        .select(`
            id, date, status, rpe, notes, trainer_feedback,
            workout:workouts(name),
            exercise_logs(exercise_name, weight, reps, set_number)
        `)
        .eq('client_id', clientId)
        .eq('status', 'completed')
        .order('date', { ascending: false })
        .limit(10)

    const { data: allLogs } = await supabase
        .from('exercise_logs')
        .select('exercise_name, weight, workout_logs!inner(client_id, date)')
        .eq('workout_logs.client_id', clientId)

    const prMap: Record<string, number> = {}
    const rawHistory: Record<string, { date: string, weight: number }[]> = {}

    if (allLogs) {
        for (const row of allLogs) {
            // Update PR
            if (!prMap[row.exercise_name] || row.weight > prMap[row.exercise_name]) {
                prMap[row.exercise_name] = row.weight
            }

            // Store raw history
            if (!rawHistory[row.exercise_name]) {
                rawHistory[row.exercise_name] = []
            }
            rawHistory[row.exercise_name].push({
                date: (row as any).workout_logs.date,
                weight: row.weight
            })
        }
    }

    // Map history to ExerciseHistoryChart format: [{ date: 'localeStr', sets: [{ weight: val }] }]
    const historyMap: Record<string, any[]> = {}
    for (const ex in rawHistory) {
        // Find max weight per date
        const dateMax: Record<string, number> = {}
        for (const log of rawHistory[ex]) {
            if (!dateMax[log.date] || log.weight > dateMax[log.date]) {
                dateMax[log.date] = log.weight
            }
        }
        
        // Convert to array sorted by date descending like original getExerciseHistory
        // ExerciseHistoryChart expects: { date: string, sets: [{weight: number}] } in reverse chronological order
        historyMap[ex] = Object.entries(dateMax)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, maxWeight]) => {
                // Return in format expected by ExerciseHistoryChart
                return {
                    date: new Date(date).toLocaleDateString('es', { day: 'numeric', month: 'numeric' }),
                    sets: [{ weight: maxWeight }]
                }
            })
    }

    const personalRecords = Object.entries(prMap)
        .map(([exercise, weight]) => ({ 
            exercise, 
            weight,
            history: historyMap[exercise] || []
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 12)

    return { recentSessions: sessions || [], personalRecords }
}

// ═══ WORKOUT TEMPLATES ═══

export async function toggleWorkoutTemplate(workoutId: string, isTemplate: boolean) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('workouts')
        .update({ is_template: isTemplate })
        .eq('id', workoutId)
    if (error) return { error: 'Error al actualizar plantilla' }
    revalidatePath('/dashboard/workouts')
    return { success: true }
}

export async function cloneWorkoutForClient(workoutId: string, clientId: string, newName: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const { data: original } = await supabase
        .from('workouts')
        .select('*, workout_exercises(*)')
        .eq('id', workoutId)
        .single()
    if (!original) return { error: 'Rutina no encontrada' }

    const { data: cloned, error: cloneError } = await supabase
        .from('workouts')
        .insert({ trainer_id: user.id, client_id: clientId, name: newName, description: original.description, is_template: false })
        .select()
        .single()
    if (cloneError || !cloned) return { error: 'Error al clonar rutina' }

    if (original.workout_exercises?.length > 0) {
        const exercises = original.workout_exercises.map((ex: any) => ({
            workout_id: cloned.id, exercise_name: ex.exercise_name, sets: ex.sets, reps: ex.reps,
            rest_seconds: ex.rest_seconds, order_index: ex.order_index, target_weight: ex.target_weight,
            trainer_notes: ex.trainer_notes
        }))
        await supabase.from('workout_exercises').insert(exercises)
    }

    revalidatePath('/dashboard/workouts')
    revalidatePath('/dashboard/clients')
    return { success: true, workoutId: cloned.id }
}
