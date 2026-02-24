'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MainPaddingWrapperProps {
    children: React.ReactNode
    isTrainer: boolean
}

export function MainPaddingWrapper({ children, isTrainer }: MainPaddingWrapperProps) {
    const pathname = usePathname()
    const isDashboard = pathname === '/dashboard'

    return (
        <main className={cn(
            "flex-1 w-full pb-24 px-4 overflow-x-hidden transition-[padding] duration-300 ease-in-out",
            isDashboard ? "pt-6" : "pt-20",
            // Trainer desktop: left padding starts at 64px (collapsed sidebar width) + breathing room
            // Client: no desktop shifts — pure mobile layout at any viewport width
            isTrainer && "md:pb-8 md:pt-10 md:px-8",
        )}
            style={isTrainer ? {
                // On desktop, track the sidebar width CSS var (64px collapsed, 240px expanded)
                // On mobile sidebar is hidden, so no left padding override needed
            } : undefined}
        >
            {/* Trainer desktop: inline style for left paddig to follow sidebar var */}
            {isTrainer && (
                <style>{`
                    @media (min-width: 768px) {
                        [data-role="trainer"] main {
                            padding-left: calc(var(--sidebar-w, 240px) + 2rem);
                        }
                    }
                `}</style>
            )}
            {children}
        </main>
    )
}
