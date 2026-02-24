import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { MobileTopBar } from '@/components/layout/MobileTopBar'
import { MainPaddingWrapper } from '@/components/layout/MainPaddingWrapper'
import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar'


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    const isTrainer = profile?.role === 'trainer'

    return (
        <div
            className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950"
            {...(isTrainer ? { 'data-role': 'trainer' } : {})}
        >
            {/* Mobile top bar — all users */}
            <MobileTopBar userName={profile?.full_name || 'Usuario'} />

            {/* Desktop sidebar — trainers only */}
            {isTrainer && (
                <CollapsibleSidebar />
            )}

            {/* Main content */}
            <MainPaddingWrapper isTrainer={isTrainer}>
                {children}
            </MainPaddingWrapper>

            {/* Mobile bottom nav — all users */}
            <MobileBottomNav role={isTrainer ? 'trainer' : 'client'} />
        </div>
    )
}
