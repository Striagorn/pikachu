'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getClientTodaysWorkout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Check for existing in-progress workout log first
  const { data: existingLog } = await supabase
    .from('workout_logs')
    .select(`
      id,
      status,
      created_at,
      workout:workouts (
        id,
        name,
        description,
        trainer:profiles (
            full_name
        )
      )
    `)
    .eq('client_id', user.id)
    .eq('status', 'in-progress')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // 1.5. Check if there is already a COMPLETED workout log for today
  const today = new Date()
  const offset = today.getTimezoneOffset() * 60000
  const localToday = new Date(today.getTime() - offset)
  const todayStr = localToday.toISOString().split('T')[0] // YYYY-MM-DD local
  const dayOfWeek = localToday.getDay() // 0=Sun...6=Sat local

  const { data: completedLogToday } = await supabase
    .from('workout_logs')
    .select(`
      id,
      status,
      created_at,
      workout:workouts (
        id,
        name,
        description,
        trainer:profiles (
            full_name
        )
      )
    `)
    .eq('client_id', user.id)
    .eq('status', 'completed')
    .ilike('date', `${todayStr}%`) // The 'date' column in workout_logs stores the Date string, or we can use created_at starting with todayStr
    .limit(1)
    .single()

  if (completedLogToday) return completedLogToday

  // 2. Check workout_schedule for today
  // Check specific_date first
  const { data: specificEntry } = await supabase
    .from('workout_schedule')
    .select('workout_id, workout:workouts(id, name, description, trainer:profiles(full_name))')
    .eq('client_id', user.id)
    .eq('is_recurring', false)
    .eq('specific_date', todayStr)
    .limit(1)
    .single()

  const scheduledWorkout = specificEntry?.workout

  // If no specific, check recurring
  if (!scheduledWorkout) {
    const { data: recurringEntry } = await supabase
      .from('workout_schedule')
      .select('workout_id, workout:workouts(id, name, description, trainer:profiles(full_name))')
      .eq('client_id', user.id)
      .eq('is_recurring', true)
      .eq('day_of_week', dayOfWeek)
      .limit(1)
      .single()

    if (!recurringEntry?.workout) return null

    // Return as a "scheduled" indicator (no log yet)
    return {
      id: null, // no log yet — will be created when client starts
      status: 'scheduled',
      created_at: localToday.toISOString(),
      workout: recurringEntry.workout,
      workout_id: recurringEntry.workout_id,
    }
  }

  return {
    id: null,
    status: 'scheduled',
    created_at: localToday.toISOString(),
    workout: scheduledWorkout,
    workout_id: specificEntry.workout_id,
  }
}

/**
 * Get the client's weekly schedule for the mini preview and day switcher
 */
export async function getClientWeekSchedule() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('workout_schedule')
    .select('day_of_week, is_recurring, workout:workouts(id, name, description, trainer:profiles(full_name))')
    .eq('client_id', user.id)
    .eq('is_recurring', true)
    .order('day_of_week', { ascending: true })

  return data || []
}

/**
 * Calculate current training streak (consecutive days with completed workouts)
 */
export async function getStreak() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { streak: 0, total: 0 }

  // Get all completed workout dates, ordered desc
  const { data } = await supabase
    .from('workout_logs')
    .select('date')
    .eq('client_id', user.id)
    .eq('status', 'completed')
    .order('date', { ascending: false })

  if (!data || data.length === 0) return { streak: 0, total: data?.length || 0 }

  // Get unique dates (assuming d.date is YYYY-MM-DD or ISO string)
  const uniqueDates = [...new Set(data.map(d => d.date.split('T')[0]))]
    .sort((a, b) => b.localeCompare(a))

  // Count consecutive days from today/yesterday (using local timezone)
  const today = new Date()
  const offset = today.getTimezoneOffset() * 60000
  const localToday = new Date(today.getTime() - offset)
  const todayStr = localToday.toISOString().split('T')[0]

  const yesterday = new Date(today.getTime() - 86400000)
  const localYesterday = new Date(yesterday.getTime() - offset)
  const yesterdayStr = localYesterday.toISOString().split('T')[0]

  // Streak must start from today or yesterday
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return { streak: 0, total: uniqueDates.length }
  }

  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1] + 'T00:00:00')
    const curr = new Date(uniqueDates[i] + 'T00:00:00')
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000)
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return { streak, total: uniqueDates.length }
}

export async function getClientHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('workout_logs')
    .select(`
      id,
      status,
      created_at,
      date,
      rpe,
      workout:workouts (
        name,
        trainer:profiles (full_name)
      ),
      exercise_logs (
        id,
        exercise_name,
        set_number,
        weight,
        reps
      )
    `)
    .eq('client_id', user.id)
    .eq('status', 'completed')
    .order('date', { ascending: false })
    .limit(5)

  return data || []
}

export async function getClientSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('client_subscriptions')
    .select(`
        *,
        plan:plans (name)
    `)
    .eq('client_id', user.id)
    .eq('status', 'active')
    .gt('credits_remaining', 0)
    .gte('end_date', new Date().toISOString())
    .order('end_date', { ascending: true })
    .limit(1)
    .single()

  return data
}

export async function getTrainerStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    // 1. Sessions Today (count workout_logs for today)
    // We use a range to be safe with timestamps
    const { count: sessionsToday } = await supabase
        .from('workout_logs')
        .select('id', { count: 'exact', head: true })
        .gte('date', `${today}T00:00:00`)
        .lte('date', `${today}T23:59:59`)
    
    // 2. Plans expiring soon (active, end_date < 7 days)
    const { count: expiringPlans } = await supabase
        .from('client_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('trainer_id', user.id)
        .eq('status', 'active')
        .lte('end_date', nextWeek.toISOString())
        .gt('end_date', new Date().toISOString())

    // 3. Active Clients Count
    const { count: activeClients } = await supabase
        .from('clients_trainers')
        .select('id', { count: 'exact', head: true })
        .eq('trainer_id', user.id)
        .eq('status', 'active')

    return {
        sessionsToday: sessionsToday || 0,
        expiringPlans: expiringPlans || 0,
        activeClients: activeClients || 0
    }
}

export async function getTodayActivity() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const today = new Date().toISOString().split('T')[0]

    // Get today's workout logs for this trainer's clients
    const { data } = await supabase
        .from('workout_logs')
        .select(`
            id,
            status,
            finished_at,
            client:profiles!client_id (full_name),
            workout:workouts!workout_id (name, trainer_id)
        `)
        .gte('date', `${today}T00:00:00`)
        .lte('date', `${today}T23:59:59`)
        .order('date', { ascending: false })

    if (!data) return []

    // Filter to only this trainer's workouts
    return data
        .filter((log: any) => {
            const workout = Array.isArray(log.workout) ? log.workout[0] : log.workout
            return workout?.trainer_id === user.id
        })
        .map((log: any) => ({
            id: log.id,
            status: log.status,
            clientName: Array.isArray(log.client) ? log.client[0]?.full_name : log.client?.full_name,
            workoutName: Array.isArray(log.workout) ? log.workout[0]?.name : log.workout?.name,
            finishedAt: log.finished_at
        }))
}

export async function getWeeklyProgress() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { count: 0, goal: 3 }

    const now = new Date()
    // Simple week start (Monday) calculation to avoid extra deps if possible, 
    // but consistent with ISO.
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const startOfWeek = new Date(now.setDate(diff))
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const { count } = await supabase
        .from('workout_logs')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'completed')
        .gte('date', startOfWeek.toISOString())
        .lte('date', endOfWeek.toISOString())

    return { count: count || 0, goal: 3 } // Hardcoded goal for MVP
}

export async function getWeeklyHistory() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []

    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    
    const { data } = await supabase
        .from('workout_logs')
        .select('date')
        .eq('client_id', user.id)
        .eq('status', 'completed')
        .gte('date', fourWeeksAgo.toISOString())
        .order('date', { ascending: true })

    if (!data) return []

    // Group by week
    const weeks: Record<string, number> = {}
    const now = new Date()
    
    // Initialize last 4 weeks
    for (let i = 0; i < 4; i++) {
        const d = new Date()
        d.setDate(d.getDate() - (i * 7))
        const weekNum = getWeekNumber(d)
        weeks[weekNum] = 0
    }

    data.forEach((log: any) => {
        const weekNum = getWeekNumber(new Date(log.date))
        if (weeks[weekNum] !== undefined) {
             weeks[weekNum]++
        }
    })

    // Convert to array sorted by week (oldest to newest)
    return Object.entries(weeks)
        .map(([week, count]) => ({ week, count, goal: 3 }))
        .reverse()
}

// Helper to get ISO week number (1-53) and Year
function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
}

/**
 * Gets all workouts available to the client (created by their trainer).
 * Used for the routine picker so clients can start any routine, not just today's.
 */
export async function getAvailableWorkouts() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Find trainer(s) linked to this client
    const { data: relations } = await supabase
        .from('clients_trainers')
        .select('trainer_id')
        .eq('client_id', user.id)
        .eq('status', 'active')

    if (!relations || relations.length === 0) return []

    const trainerIds = relations.map(r => r.trainer_id)

    // Get all workouts from those trainers
    const { data: workouts } = await supabase
        .from('workouts')
        .select('id, name, description')
        .in('trainer_id', trainerIds)
        .order('name', { ascending: true })

    return workouts || []
}

/**
 * Creates a new workout_log (in-progress) so the client can start any routine.
 */
export async function startWorkoutSession(formData: FormData) {
    const workoutId = formData.get('workoutId') as string
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No autorizado')

    const today = new Date().toISOString().split('T')[0]

    const { data: newLog, error } = await supabase
        .from('workout_logs')
        .insert({
            client_id: user.id,
            workout_id: workoutId,
            date: today,
            status: 'in-progress'
        })
        .select('id')
        .single()

    if (error) {
        console.error('Error creating session:', error)
        return { error: 'No se pudo crear la sesión' }
    }

    return { id: newLog.id }
}

