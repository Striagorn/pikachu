'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPlans() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('trainer_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching plans:', error)
    return []
  }

  return data
}

export async function createPlan(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const session_credits = parseInt(formData.get('session_credits') as string)
  const validity_days = parseInt(formData.get('validity_days') as string)
  const price = parseFloat(formData.get('price') as string)

  if (!name || !session_credits || !validity_days) {
    return { error: 'Faltan campos requeridos' }
  }

  const { error } = await supabase
    .from('plans')
    .insert({
      trainer_id: user.id,
      name,
      description,
      session_credits,
      validity_days,
      price: isNaN(price) ? 0 : price
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/plans')
  return { success: true }
}

export async function archivePlan(planId: string) {
    const supabase = await createClient()
    
    // Check auth implicitly handled by RLS but good to check user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const { error } = await supabase
        .from('plans')
        .update({ is_active: false })
        .eq('id', planId)
        .eq('trainer_id', user.id) // Safety check

    if (error) return { error: error.message }

    revalidatePath('/dashboard/plans')
    return { success: true }
}
