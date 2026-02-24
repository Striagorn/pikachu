'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Deletes the currently authenticated user's account and all associated data.
 * Calls the `delete_user_account()` PostgreSQL function which runs with SECURITY DEFINER
 * to handle cascading deletion including auth.users.
 */
export async function deleteAccount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autenticado' }
    }

    // Call the database function that handles cascading deletion
    const { error } = await supabase.rpc('delete_user_account')

    if (error) {
        console.error('Error deleting account:', error)
        return { error: 'No se pudo eliminar la cuenta. Intenta de nuevo.' }
    }

    // Sign out and redirect to login
    await supabase.auth.signOut()
    redirect('/login')
}
