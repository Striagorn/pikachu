'use server'

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function getProfileStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 1. Get Client Info & Subscription
    const { data: client } = await supabase
        .from('clients')
        .select(`
            *,
            subscriptions (
                status,
                current_period_end,
                plan:plans (name)
            )
        `)
        .eq('user_id', user.id)
        .single()

    // 2. Get Total Workouts Completed
    const { count: totalWorkouts } = await supabase
        .from('workout_logs')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'completed')

    // 3. Calculate Streak (Simplified: consecutive weeks with at least 1 workout)
    // For MVP, just returning total workouts and maybe "Member Since"
    
    return {
        client,
        totalWorkouts: totalWorkouts || 0,
        memberSince: client?.created_at || new Date().toISOString()
    }
}

export async function getConsistencyData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get finished workouts in last 12 weeks
    const { data: logs } = await supabase
        .from('workout_logs')
        .select('finished_at')
        .eq('client_id', user.id)
        .eq('status', 'completed')
        .not('finished_at', 'is', null)
        .order('finished_at', { ascending: true })

    // Group by week
    const weeks: Record<string, number> = {}
    
    // Initialize last 8 weeks with 0
    const today = new Date()
    for (let i = 7; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - (d.getDay() - 1) - (i * 7)) // Start of that week (Monday)
        const weekKey = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        weeks[weekKey] = 0
    }
    
    // Increment counts for existing logs
    // logs might be empty, that's fine
    logs?.forEach(log => {
        const date = new Date(log.finished_at)
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay() + 1) // Monday
        const weekKey = startOfWeek.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        
        // Only count if it falls within our tracked weeks
        if (weeks[weekKey] !== undefined) {
            weeks[weekKey]++
        }
    })

    return Object.entries(weeks).map(([name, count]) => ({ name, count }))
}

export async function getStrengthProgress(exerciseName: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get query for specific exercise logs
    // We need to join workout_logs to filter by client_id, and workout_log_entries for the exercise
    // But Supabase simple generic query:
    
    // 1. Get Log IDs for user
    const { data: userLogs } = await supabase
        .from('workout_logs')
        .select('id, finished_at')
        .eq('client_id', user.id)
        .eq('status', 'completed')
        .order('finished_at', { ascending: true })
        .limit(20) // Last 20 workouts

    if (!userLogs || userLogs.length === 0) return []

    const logIds = userLogs.map(l => l.id)

    // 2. Get Entries for these logs and specific exercise
    const { data: entries } = await supabase
        .from('workout_log_entries')
        .select('log_id, weight, reps')
        .in('log_id', logIds)
        .eq('exercise_name', exerciseName)

    if (!entries) return []

    // 3. Map back to date and find max weight per date
    const progress = userLogs.map(log => {
        const logEntries = entries.filter(e => e.log_id === log.id)
        if (logEntries.length === 0) return null

        const maxWeight = Math.max(...logEntries.map(e => e.weight))
        // Estimate 1RM? Epley: w * (1 + r/30). Let's just use Max Weight for now.
        
        return {
            date: new Date(log.finished_at).toLocaleDateString('es-ES', {day: 'numeric', month: 'short'}),
            weight: maxWeight
        }
    }).filter(Boolean)

    return progress
}
