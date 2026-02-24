'use client'

import { usePathname, useRouter } from "next/navigation"
import { Bell, ArrowLeft } from "lucide-react"

interface MobileTopBarProps {
  userName: string
  userImage?: string
}

export function MobileTopBar({ userName }: MobileTopBarProps) {
  const pathname = usePathname()
  const router = useRouter()

  // On the main dashboard, don't render any bar — the page content has its own header
  const isDashboard = pathname === '/dashboard'

  const getTitle = () => {
    if (pathname.includes('/clients')) return 'Clientes'
    if (pathname.includes('/workouts')) return 'Rutinas'
    if (pathname.includes('/plans')) return 'Planes'
    if (pathname.includes('/profile')) return 'Mi Perfil'
    if (pathname.includes('/history')) return 'Historial'
    if (pathname.includes('/workout/')) return 'Entrenamiento'
    return 'TrainerApp'
  }

  // Show back button on any page that isn't the root dashboard
  const hasBack = pathname !== '/dashboard'

  if (isDashboard) {
    // On dashboard: just a minimal, transparent floating bell (no greeting)
    return (
      <div className="fixed top-0 right-0 z-50 p-4 md:hidden pointer-events-none">
        <button className="h-9 w-9 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center justify-center pointer-events-auto text-slate-500 hover:text-slate-700 transition">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // On sub-pages: clean iOS-style navigation bar
  return (
    <div className="fixed top-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto">
          {/* Left: Back or empty */}
          <div className="w-16">
            {hasBack && (
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 text-primary font-medium text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Atrás</span>
              </button>
            )}
          </div>

          {/* Center: Page Title */}
          <h2 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
            {getTitle()}
          </h2>

          {/* Right: Bell */}
          <div className="w-16 flex justify-end">
            <button className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

