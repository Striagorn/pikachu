'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Dumbbell, CreditCard, User, History } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileBottomNavProps {
  role: 'trainer' | 'client'
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname()

  const trainerLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
    { href: "/dashboard/clients", icon: Users, label: "Clientes" },
    { href: "/dashboard/workouts", icon: Dumbbell, label: "Rutinas" },
    { href: "/dashboard/plans", icon: CreditCard, label: "Planes" },
  ]

  const clientLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
    { href: "/dashboard/history", icon: History, label: "Historial" },
    { href: "/dashboard/profile", icon: User, label: "Perfil" },
  ]

  const links = role === 'trainer' ? trainerLinks : clientLinks

  // Hide during active workout — Apple Fitness style
  if (pathname.includes('/workout/')) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <nav className="flex items-center justify-around h-16 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80"
           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 active:scale-95 transition-all duration-150",
                isActive
                  ? "text-primary"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <Icon
                className="h-6 w-6"
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={cn(
                "text-[10px] tracking-wide font-medium",
                isActive && "font-bold"
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
