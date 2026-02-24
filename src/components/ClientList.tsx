'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, ClipboardList, CreditCard, Share2, ChevronDown, Calendar } from "lucide-react"
import { AssignWorkoutFormWrapper } from '@/components/AssignWorkoutFormWrapper'
import { AssignPlanForm } from '@/components/AssignPlanForm'
import { VictoryCard } from '@/components/VictoryCard'
import { WeeklySchedule } from '@/components/WeeklySchedule'
import { differenceInDays, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

function getRetentionDot(lastDate: string | null) {
    if (!lastDate) return 'bg-gray-300 dark:bg-gray-600'
    const days = differenceInDays(new Date(), new Date(lastDate))
    if (days <= 3) return 'bg-green-500'
    if (days <= 7) return 'bg-amber-400'
    return 'bg-red-500'
}

interface ClientListProps {
    clients: any[]
    workouts: any[]
    plans: any[]
    schedules: Record<string, any[]>
    inviteLink: string
}

export function ClientList({ clients, workouts, plans, schedules, inviteLink }: ClientListProps) {
    const [expandedClient, setExpandedClient] = useState<string | null>(null)

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Clientes
                </h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="flex items-center gap-1.5 text-[15px] font-medium text-blue-500 hover:text-blue-600 transition-colors">
                            <Plus className="h-4 w-4" />
                            Invitar
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invitar a Nuevo Cliente</DialogTitle>
                            <DialogDescription>
                                Comparte este enlace con tu alumno. Al abrirlo, quedará vinculado a tu cuenta automáticamente.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2 py-4">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="link" className="sr-only">Link</Label>
                                <Input id="link" defaultValue={inviteLink} readOnly className="text-xs" />
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-start">
                            <p className="text-xs text-muted-foreground">
                                El cliente debe registrarse o iniciar sesión para aceptar.
                            </p>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {clients.length === 0 ? (
                <div className="bg-white dark:bg-white/[0.06] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] p-10 flex flex-col items-center text-center shadow-sm shadow-black/[0.04]">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                        <Plus className="h-8 w-8 text-blue-500" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white mb-1">
                        No tienes clientes aún
                    </h3>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400 max-w-xs">
                        Invita a tus alumnos para gestionar sus entrenamientos y ver su progreso.
                    </p>
                </div>
            ) : (
                <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">
                        {clients.length} {clients.length === 1 ? 'alumno' : 'alumnos'}
                    </p>
                    <div className="bg-white dark:bg-white/[0.06] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] divide-y divide-black/[0.04] dark:divide-white/[0.04] shadow-sm shadow-black/[0.04]">
                        {clients.map((client: any) => {
                            const dotColor = getRetentionDot(client.last_workout_date)
                            const lastSeen = client.last_workout_date
                                ? formatDistanceToNow(new Date(client.last_workout_date), { locale: es, addSuffix: true })
                                : 'Nunca'
                            const isExpanded = expandedClient === client.id
                            const clientSchedule = schedules[client.id] || []

                            return (
                                <div key={client.id}>
                                    <div className="flex items-center gap-3 px-4 py-3 group hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors">
                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <Avatar className="h-11 w-11 ring-2 ring-black/[0.04] dark:ring-white/[0.06]">
                                                <AvatarImage src={client.avatar_url} />
                                                <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-[15px]">
                                                    {client.full_name?.[0] || 'C'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${dotColor}`} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[15px] font-semibold text-gray-900 dark:text-white truncate">
                                                {client.full_name || 'Sin Nombre'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
                                                    Último: {lastSeen}
                                                </p>
                                                {client.subscription ? (
                                                    <span className="text-[11px] text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
                                                        {client.subscription.credits_remaining} créditos
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full">
                                                        Sin plan
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            {/* Schedule Toggle */}
                                            <button
                                                title="Plan Semanal"
                                                onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                                                className={cn(
                                                    "h-8 w-8 rounded-xl flex items-center justify-center transition-all active:scale-90",
                                                    isExpanded
                                                        ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30"
                                                        : "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                )}
                                            >
                                                <Calendar className="h-4 w-4" strokeWidth={1.8} />
                                            </button>

                                            {/* Assign Workout (immediate) */}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button
                                                        title="Asignar Rutina Hoy"
                                                        className="h-8 w-8 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-90"
                                                    >
                                                        <ClipboardList className="h-4 w-4" strokeWidth={1.8} />
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Asignar Rutina a {client.full_name}</DialogTitle>
                                                        <DialogDescription>Se creará una sesión para hoy con la rutina seleccionada.</DialogDescription>
                                                    </DialogHeader>
                                                    <AssignWorkoutFormWrapper clientId={client.id} workouts={workouts} />
                                                </DialogContent>
                                            </Dialog>

                                            {/* Assign Plan */}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button
                                                        title="Asignar Plan"
                                                        className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-90"
                                                    >
                                                        <CreditCard className="h-4 w-4" strokeWidth={1.8} />
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Asignar Plan a {client.full_name}</DialogTitle>
                                                        <DialogDescription>Selecciona un paquete de sesiones para renovar al cliente.</DialogDescription>
                                                    </DialogHeader>
                                                    <AssignPlanForm clientId={client.id} plans={plans} />
                                                </DialogContent>
                                            </Dialog>

                                            {/* Share Victory */}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button
                                                        title="Compartir Logro"
                                                        className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all active:scale-90"
                                                    >
                                                        <Share2 className="h-4 w-4" strokeWidth={1.8} />
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md flex flex-col items-center">
                                                    <DialogHeader>
                                                        <DialogTitle className="sr-only">Compartir Logro</DialogTitle>
                                                        <DialogDescription className="sr-only">Vista previa del logro del cliente.</DialogDescription>
                                                    </DialogHeader>
                                                    <VictoryCard
                                                        clientName={client.full_name}
                                                        totalWorkouts={client.total_completed_workouts || 0}
                                                        lastWorkoutDate={client.last_workout_date}
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-4">
                                                        Haz una captura de pantalla para compartir en redes sociales.
                                                    </p>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>

                                    {/* Expandable Schedule */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-1 bg-slate-50/50 dark:bg-slate-900/20 animate-in slide-in-from-top-2 duration-200">
                                            <WeeklySchedule
                                                clientId={client.id}
                                                clientName={client.full_name || 'Cliente'}
                                                schedule={clientSchedule}
                                                workouts={workouts}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
