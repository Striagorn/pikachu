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

    // 3. Create Subscription
    // Check if there is an active subscription? For now, we allow multiple or assume replacing.
    // Let's just archive previous active ones? Or simple stack.
    // MVP: Just insert new one.

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
