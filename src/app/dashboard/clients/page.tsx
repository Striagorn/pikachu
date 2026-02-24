import { getClients, getClientSchedule } from './actions'
import { getWorkouts } from '../workouts/actions'
import { getPlans } from '../plans/actions'
import { createClient } from '@/utils/supabase/server'
import { ClientList } from '@/components/ClientList'

export default async function ClientsPage() {
    const clients = await getClients()
    const workouts = await getWorkouts()
    const plans = await getPlans()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const inviteLink = user
        ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/join/${user.id}`
        : ''

    // Fetch schedules for all clients
    const schedules: Record<string, any[]> = {}
    for (const client of clients) {
        const clientId = (client as any).id
        if (clientId) {
            schedules[clientId] = await getClientSchedule(clientId)
        }
    }

    return (
        <ClientList
            clients={clients}
            workouts={workouts}
            plans={plans}
            schedules={schedules}
            inviteLink={inviteLink}
        />
    )
}
