'use client'

import { useState } from 'react'
import { Plus, X, Loader2, Calendar, Repeat, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { addScheduleEntry, deleteScheduleEntry } from '@/app/dashboard/clients/actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface ScheduleEntry {
    id: string
    workout_id: string
    day_of_week: number | null
    specific_date: string | null
    is_recurring: boolean
    workout: { id: string; name: string; description: string | null } | null
}

interface Workout {
    id: string
    name: string
    description?: string
}

interface WeeklyScheduleProps {
    clientId: string
    clientName: string
    schedule: ScheduleEntry[]
    workouts: Workout[]
}

export function WeeklySchedule({ clientId, clientName, schedule, workouts }: WeeklyScheduleProps) {
    const [selectedDay, setSelectedDay] = useState<number | null>(null)
    const [showPicker, setShowPicker] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const router = useRouter()

    // Today's day of week
    const today = new Date().getDay()

    // Group recurring entries by day
    const dayMap = new Map<number, ScheduleEntry>()
    const specificDates: ScheduleEntry[] = []
    for (const entry of schedule) {
        if (entry.is_recurring && entry.day_of_week !== null) {
            dayMap.set(entry.day_of_week, entry)
        } else {
            specificDates.push(entry)
        }
    }

    function handleDayClick(day: number) {
        setSelectedDay(day)
        setShowPicker(true)
    }

    async function handleSelectWorkout(workoutId: string) {
        if (selectedDay === null) return
        setIsAdding(true)
        await addScheduleEntry(clientId, workoutId, selectedDay, null, true)
        setIsAdding(false)
        setShowPicker(false)
        router.refresh()
    }

    async function handleDelete(entryId: string) {
        setDeletingId(entryId)
        await deleteScheduleEntry(entryId)
        setDeletingId(null)
        router.refresh()
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Plan Semanal</h4>
                <Repeat className="h-3 w-3 text-slate-400" />
                <span className="text-[10px] text-slate-400 font-medium">Recurrente</span>
            </div>

            {/* 7-day grid */}
            <div className="grid grid-cols-7 gap-1">
                {DAYS.map((label, dayIndex) => {
                    const entry = dayMap.get(dayIndex)
                    const isToday = dayIndex === today
                    const hasWorkout = !!entry
                    const isDeleting = entry && deletingId === entry.id

                    return (
                        <div key={dayIndex} className="flex flex-col items-center">
                            {/* Day label */}
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider mb-1",
                                isToday ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                            )}>
                                {label}
                            </span>

                            {/* Day cell */}
                            {hasWorkout ? (
                                <div className={cn(
                                    "relative w-full aspect-square rounded-xl flex flex-col items-center justify-center px-1 transition-all group cursor-pointer",
                                    isToday
                                        ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-600"
                                        : "bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800"
                                )}
                                    onClick={() => handleDayClick(dayIndex)}
                                >
                                    <span className="text-[9px] font-bold text-violet-700 dark:text-violet-300 text-center leading-tight truncate w-full">
                                        {entry.workout?.name || '—'}
                                    </span>
                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(entry.id)
                                        }}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                        ) : (
                                            <X className="h-2.5 w-2.5" />
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleDayClick(dayIndex)}
                                    className={cn(
                                        "w-full aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-blue-700 dark:hover:bg-blue-900/10",
                                        isToday
                                            ? "border-blue-300 dark:border-blue-700"
                                            : "border-slate-200 dark:border-slate-700"
                                    )}
                                >
                                    <Plus className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Specific dates section (if any) */}
            {specificDates.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Fechas específicas</span>
                    </div>
                    {specificDates.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/10 rounded-lg px-3 py-1.5 border border-amber-100 dark:border-amber-800/30">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                    {entry.specific_date ? new Date(entry.specific_date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : ''}
                                </span>
                                <span className="text-xs text-amber-600 dark:text-amber-400">
                                    {entry.workout?.name}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDelete(entry.id)}
                                className="text-red-400 hover:text-red-600 transition-colors"
                            >
                                {deletingId === entry.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <X className="h-3 w-3" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Workout Picker Dialog */}
            <Dialog open={showPicker} onOpenChange={setShowPicker}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDay !== null ? DAYS_FULL[selectedDay] : 'Día'}
                        </DialogTitle>
                        <DialogDescription>
                            Elige una rutina para {clientName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {workouts.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">No hay rutinas creadas</p>
                        ) : (
                            workouts.map((w) => (
                                <button
                                    key={w.id}
                                    onClick={() => handleSelectWorkout(w.id)}
                                    disabled={isAdding}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left disabled:opacity-50"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-black text-violet-600 dark:text-violet-400">
                                            {w.name[0]}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">{w.name}</p>
                                        {w.description && (
                                            <p className="text-[11px] text-slate-400 truncate">{w.description}</p>
                                        )}
                                    </div>
                                    {isAdding && (
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-500 ml-auto shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
