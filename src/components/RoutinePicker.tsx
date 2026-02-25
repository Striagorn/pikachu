'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, ChevronRight, Loader2 } from 'lucide-react'
import { startWorkoutSession } from '@/app/dashboard/actions'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface RoutinePickerProps {
    workouts: { id: string; name: string; description?: string }[]
}

const MAX_VISIBLE = 3

function RoutineRow({ workout, loading, onStart }: { 
    workout: { id: string; name: string; description?: string }
    loading: string | null
    onStart: (id: string) => void 
}) {
    return (
        <button
            onClick={() => onStart(workout.id)}
            disabled={loading !== null}
            className="flex items-center gap-3 w-full px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-white/[0.03] active:bg-slate-100 dark:active:bg-white/[0.05] transition-colors disabled:opacity-50"
        >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <Dumbbell className="h-5 w-5 text-purple-600 dark:text-purple-400" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-slate-900 dark:text-white truncate">{workout.name}</p>
                {workout.description && (
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{workout.description}</p>
                )}
            </div>
            {loading === workout.id ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
            ) : (
                <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
            )}
        </button>
    )
}

export function RoutinePicker({ workouts }: RoutinePickerProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const router = useRouter()

    async function handleStart(workoutId: string) {
        setLoading(workoutId)
        try {
            const formData = new FormData()
            formData.append('workoutId', workoutId)
            const result = await startWorkoutSession(formData)
            if (result.error) {
                alert(result.error)
                setLoading(null)
                return
            }
            // Do not setLoading(null) on success to keep the spinner alive until page changes
            setDialogOpen(false)
            router.push(`/dashboard/workout/${result.id}`)
        } catch {
            alert('Error al iniciar la sesión')
            setLoading(null)
        }
    }

    if (workouts.length === 0) return null

    const visibleWorkouts = workouts.slice(0, MAX_VISIBLE)
    const hasMore = workouts.length > MAX_VISIBLE

    return (
        <div>
            <h3 className="font-semibold text-xl text-slate-900 dark:text-white px-2 mb-3">
                Elegir otra rutina
            </h3>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] overflow-hidden border border-slate-100 dark:border-slate-800/50 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/50">
                {visibleWorkouts.map((w) => (
                    <RoutineRow key={w.id} workout={w} loading={loading} onStart={handleStart} />
                ))}

                {/* "Ver todas" button when there are more routines */}
                {hasMore && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <button className="w-full px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                                Ver todas ({workouts.length} rutinas)
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md max-h-[85vh] p-0 gap-0 overflow-hidden">
                            <DialogHeader className="px-5 pt-5 pb-3">
                                <DialogTitle className="text-lg font-bold">Todas las rutinas</DialogTitle>
                            </DialogHeader>
                            <div className="overflow-y-auto max-h-[60vh] divide-y divide-slate-100 dark:divide-slate-800/50">
                                {workouts.map((w) => (
                                    <RoutineRow key={w.id} workout={w} loading={loading} onStart={handleStart} />
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}
