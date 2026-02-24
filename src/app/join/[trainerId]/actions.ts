'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function joinTrainer(formData: FormData) {
    const trainerId = formData.get('trainerId') as string
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    if (user.id === trainerId) {
        return redirect('/dashboard?error=SameUser') // Can't invite yourself
    }

    // Insert into clients_trainers
    const { error } = await supabase
        .from('clients_trainers')
        .upsert({
            trainer_id: trainerId,
            client_id: user.id,
            status: 'active'
        })

    if (error) {
        console.error('Error joining trainer:', error)
        return redirect('/dashboard?error=FailedToJoin')
    }

    redirect('/dashboard?success=Joined')
}
