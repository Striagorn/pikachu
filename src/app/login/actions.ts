'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/dashboard' // Default to dashboard
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error)
    return redirect(`/login?message=Could not authenticate user&next=${encodeURIComponent(next)}`)
  }

  return redirect(next)
}

export async function signup(formData: FormData) {
  const origin = (await headers()).get('origin')
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string // 'trainer' or 'client'
  const next = (formData.get('next') as string) || '/dashboard'
  
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      data: {
        full_name: fullName,
        role: role || 'client',
      },
    },
  })

  if (error) {
    console.error('Signup error:', error)
    return redirect(`/login?message=Could not authenticate user&next=${encodeURIComponent(next)}`)
  }

  // If email confirmation is disabled, we get a session immediately.
  // In that case, we can redirect directly to the next page.
  /* 
     NOTE: supabase.auth.signUp does NOT automatically set cookies on the server 
     unless we use the correct flow. However, createClient() uses cookies().
     If the session is returned, we might need to manually set it or trust the client?
     Actually, the SSR client 'exchangeCodeForSession' is usually for the link.
     BUT if auto-confirm is on, we might need to rely on the client-side or implicit flow?
     Wait, 'createServerClient' handles cookie management. 
     If signUp returns a session, does it set the cookie? 
     Documentation says: "If email confirmation is disabled... returns the session."
     The Supabase Next.js helper *should* handle this if we use the middleware/server client correctly.
     Let's try redirecting. If cookies aren't set, they'll just hit login again.
     But since they just signed up, they might need to sign in?
     Actually, the best UX for "Confirm Email OFF" is to just log them in. 
     If signUp returns session, we can probably assume they are "logged in" contextually 
     but possibly not exclusively in the browser cookie if not handled.
     Let's try redirecting to 'next'. If they aren't logged in, 'next' (JoinPage) will redirect them back to Login.
     No harm done.
  */
  
  return redirect('/login?message=Check email to continue sign in process')
}
