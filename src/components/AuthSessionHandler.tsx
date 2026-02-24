'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

/**
 * Listens for Supabase auth errors on the client side.
 * When a stale/already-used refresh token is detected,
 * it signs out and redirects to /login to break the error loop.
 */
export function AuthSessionHandler() {
    const router = useRouter()

    useEffect(() => {
        const supabase = createClient()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // TOKEN_REFRESHED fires on success. If event is SIGNED_OUT without
            // user action, it's likely a token rotation failure — redirect to login.
            if (event === 'SIGNED_OUT' && !session) {
                router.replace('/login')
                return
            }
        })

        // Also catch unhandled promise rejections from Supabase's auto-refresh
        const handleAuthError = async () => {
            try {
                const { error } = await supabase.auth.getUser()
                if (error) {
                    const isStaleToken =
                        error.message?.includes('Already Used') ||
                        error.message?.includes('Invalid Refresh Token') ||
                        error.message?.includes('Refresh Token Not Found')

                    if (isStaleToken) {
                        await supabase.auth.signOut()
                        // Clear all sb- cookies by expiring them
                        document.cookie.split(';').forEach(c => {
                            const name = c.trim().split('=')[0]
                            if (name.startsWith('sb-')) {
                                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                            }
                        })
                        router.replace('/login')
                    }
                }
            } catch {
                // Ignore — if getUser itself throws, the onAuthStateChange handler above will react
            }
        }

        handleAuthError()

        return () => subscription.unsubscribe()
    }, [router])

    return null
}
