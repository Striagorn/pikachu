'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, Users, Dumbbell, CreditCard,
    LogOut, ChevronRight, PanelLeft, User
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: '/dashboard/clients', icon: Users, label: 'Clientes', exact: false },
    { href: '/dashboard/workouts', icon: Dumbbell, label: 'Rutinas', exact: false },
    { href: '/dashboard/plans', icon: CreditCard, label: 'Planes', exact: false },
    { href: '/dashboard/profile', icon: User, label: 'Perfil', exact: false },
]

const COLLAPSED_W = '64px'
const EXPANDED_W = '240px'

export function CollapsibleSidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        document.documentElement.style.setProperty('--sidebar-w', collapsed ? COLLAPSED_W : EXPANDED_W)
    }, [collapsed])

    useEffect(() => {
        document.documentElement.style.setProperty('--sidebar-w', EXPANDED_W)
    }, [])

    return (
        <aside className={cn(
            "hidden md:flex flex-col fixed inset-y-0 z-50 transition-all duration-300 ease-in-out",
            "bg-white/90 dark:bg-black/80 backdrop-blur-2xl",
            "border-r border-black/[0.06] dark:border-white/[0.06]",
            collapsed ? "w-16" : "w-60"
        )}>
            {/* Logo + Toggle */}
            <div className={cn(
                "flex items-center border-b border-black/[0.06] dark:border-white/[0.06] h-14 shrink-0",
                collapsed ? "justify-center px-0" : "justify-between px-4"
            )}>
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm shadow-blue-500/30">
                            <span className="text-white font-black text-xs tracking-tight">T</span>
                        </div>
                        <span className="font-semibold text-[15px] text-gray-900 dark:text-white tracking-tight">
                            TrainerApp
                        </span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(c => !c)}
                    title={collapsed ? "Expandir" : "Colapsar"}
                    className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center transition-all",
                        "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                        "hover:bg-black/[0.05] dark:hover:bg-white/[0.05]",
                        "active:scale-95"
                    )}
                >
                    <PanelLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
                </button>
            </div>

            {/* Nav Section */}
            {!collapsed && (
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-4 pt-5 pb-1">
                    Menú
                </p>
            )}
            <nav className={cn("flex-1 py-2 overflow-y-auto space-y-0.5", collapsed ? "px-2" : "px-2")}>
                {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
                    const isActive = exact ? pathname === href : pathname.startsWith(href)
                    return (
                        <Link
                            key={href}
                            href={href}
                            title={collapsed ? label : undefined}
                            className={cn(
                                "flex items-center rounded-xl transition-all duration-150 group",
                                collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-2.5 px-3 py-2",
                                isActive
                                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <Icon
                                className={cn("shrink-0 transition-all", collapsed ? "h-5 w-5" : "h-4 w-4")}
                                strokeWidth={isActive ? 2.5 : 1.8}
                            />
                            {!collapsed && (
                                <span className={cn(
                                    "text-[14px] font-medium flex-1",
                                    isActive && "font-semibold"
                                )}>
                                    {label}
                                </span>
                            )}
                            {!collapsed && isActive && (
                                <ChevronRight className="h-3.5 w-3.5 text-blue-400 dark:text-blue-500" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Sign out */}
            <div className={cn(
                "border-t border-black/[0.06] dark:border-white/[0.06] py-3",
                collapsed ? "px-2" : "px-2"
            )}>
                <form action="/auth/signout" method="post">
                    <button
                        title={collapsed ? "Cerrar sesión" : undefined}
                        className={cn(
                            "flex items-center rounded-xl transition-all duration-150 w-full",
                            "text-red-500/80 hover:text-red-600 hover:bg-red-50/60 dark:hover:bg-red-950/20",
                            collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-2.5 px-3 py-2"
                        )}
                    >
                        <LogOut className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} strokeWidth={1.8} />
                        {!collapsed && <span className="text-[14px] font-medium">Cerrar sesión</span>}
                    </button>
                </form>
            </div>
        </aside>
    )
}
