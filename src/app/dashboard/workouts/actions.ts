'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createWorkout(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const { data, error } = await supabase
        .from('workouts')
        .insert({
            name,
            description,
            trainer_id: user.id
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating workout:', error)
        return { error: 'Failed to create workout' } // In real app, handle form errors better
    }

    redirect(`/dashboard/workouts/${data.id}/edit`)
}

export async function getWorkouts() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []

    const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return []
    return data
}

export async function getWorkout(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .eq('trainer_id', user.id)
        .single()

    if (error) return null
    return data
}

export async function getWorkoutExercises(workoutId: string) {
    const supabase = await createClient()
    
    // We don't strictly need to check trainer_id here because of RLS, 
    // but good to be safe/consistent if we wanted to optimization.
    // simpler to just select.
    
    const { data, error } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('workout_id', workoutId)
        .order('created_at', { ascending: true }) // assuming we add created_at or just order by insertion

    if (error) return []
    // If we want to order by a specific index we'd need that column. 
    // For MVP, created_at (implicitly or explicitly) is fine. 
    // Supabase returns rows in insertion order usually but not guaranteed.
    // Let's rely on default sort for now or add an order_index.
    return data
}

export async function addExercise(
    workoutId: string, 
    name: string, 
    sets: number, 
    reps: string, 
    rest: number, 
    videoUrl?: string, 
    targetWeight?: string,
    supersetGroup?: number | null,
    trainerNotes?: string
) {
    const supabase = await createClient()

    // Get the next order_index
    const { data: existing } = await supabase
        .from('workout_exercises')
        .select('order_index')
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: false })
        .limit(1)
    
    const nextOrder = (existing?.[0]?.order_index ?? -1) + 1
    
    await supabase.from('workout_exercises').insert({
        workout_id: workoutId,
        exercise_name: name,
        sets,
        reps,
        rest_seconds: rest,
        video_url: videoUrl,
        target_weight: targetWeight,
        superset_group: supersetGroup ?? null,
        order_index: nextOrder,
        trainer_notes: trainerNotes || null
    })
}

export async function deleteExercise(id: string) {
    const supabase = await createClient()
    await supabase.from('workout_exercises').delete().eq('id', id)
}

/**
 * Gets distinct exercise names the trainer has used before — for autocomplete.
 */
export async function getExerciseCatalog() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get distinct exercise names from all workouts by this trainer
    const { data, error } = await supabase
        .from('workout_exercises')
        .select('exercise_name, video_url, image_url, workout_id')
        .order('exercise_name', { ascending: true })

    if (error || !data) return []

    // Deduplicate by exercise_name, keeping the latest video/image
    const catalog = new Map<string, { name: string; video_url?: string; image_url?: string }>()
    for (const row of data) {
        if (!catalog.has(row.exercise_name)) {
            catalog.set(row.exercise_name, {
                name: row.exercise_name,
                video_url: row.video_url || undefined,
                image_url: row.image_url || undefined
            })
        }
    }

    return Array.from(catalog.values())
}

// ═══ DUPLICATE WORKOUT ═══
export async function duplicateWorkout(workoutId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // 1. Get original workout
    const { data: original } = await supabase
        .from('workouts')
        .select('name, description')
        .eq('id', workoutId)
        .single()

    if (!original) return { error: 'Rutina no encontrada' }

    // 2. Create copy
    const { data: newWorkout, error: createError } = await supabase
        .from('workouts')
        .insert({
            name: `${original.name} (copia)`,
            description: original.description,
            trainer_id: user.id
        })
        .select()
        .single()

    if (createError || !newWorkout) return { error: 'Error al duplicar' }

    // 3. Copy all exercises
    const { data: exercises } = await supabase
        .from('workout_exercises')
        .select('exercise_name, sets, reps, rest_seconds, video_url, image_url, target_weight, superset_group, order_index, trainer_notes')
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true })

    if (exercises && exercises.length > 0) {
        const copies = exercises.map(ex => ({
            ...ex,
            workout_id: newWorkout.id
        }))
        await supabase.from('workout_exercises').insert(copies)
    }

    redirect(`/dashboard/workouts/${newWorkout.id}/edit`)
}

// ═══ REORDER EXERCISES ═══
export async function reorderExercise(exerciseId: string, direction: 'up' | 'down') {
    const supabase = await createClient()

    // Get the exercise
    const { data: exercise } = await supabase
        .from('workout_exercises')
        .select('id, workout_id, order_index')
        .eq('id', exerciseId)
        .single()

    if (!exercise) return

    // Get all exercises for this workout ordered
    const { data: all } = await supabase
        .from('workout_exercises')
        .select('id, order_index')
        .eq('workout_id', exercise.workout_id)
        .order('order_index', { ascending: true })

    if (!all || all.length < 2) return

    const currentIndex = all.findIndex(e => e.id === exerciseId)
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (swapIndex < 0 || swapIndex >= all.length) return

    const current = all[currentIndex]
    const swap = all[swapIndex]

    // Swap order_index values
    await supabase.from('workout_exercises').update({ order_index: swap.order_index }).eq('id', current.id)
    await supabase.from('workout_exercises').update({ order_index: current.order_index }).eq('id', swap.id)
}

// ═══ UPDATE TRAINER NOTES ═══
export async function updateTrainerNotes(exerciseId: string, notes: string) {
    const supabase = await createClient()
    await supabase.from('workout_exercises').update({ trainer_notes: notes || null }).eq('id', exerciseId)
}

