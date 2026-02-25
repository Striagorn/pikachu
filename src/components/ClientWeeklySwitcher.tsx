'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayCircle, CheckCircle2, Calendar } from "lucide-react"
import Link from 'next/link'
import { startWorkoutSession } from '@/app/dashboard/actions'

interface ClientWeeklySwitcherProps {
    weekSchedule: any[]
    todaysWorkout: any
    todayDow: number
}

export function ClientWeeklySwitcher({ weekSchedule, todaysWorkout, todayDow }: ClientWeeklySwitcherProps) {
    const [selectedDow, setSelectedDow] = useState<number>(todayDow)
    const router = useRouter()
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    const minSwipeDistance = 50 

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null) 
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe || isRightSwipe) {
            let newDow = selectedDow
            if (isLeftSwipe) {
                // Swipe left -> Next day
                newDow = (selectedDow + 1) % 7
            } else {
                // Swipe right -> Previous day
                newDow = (selectedDow - 1 + 7) % 7
            }
            setSelectedDow(newDow)
        }
    }

    // Find if the selected day has a workout in the schedule
    const scheduledForSelectedDay = weekSchedule.find(s => s.day_of_week === selectedDow)

    // Determine what workout to show based on selected day
    // If selected day is TODAY, we show todaysWorkout because it has live status (e.g. 'in_progress' or 'completed' or 'scheduled')
    // If selected day is NOT TODAY, we show the scheduled workout if it exists.
    let displayWorkout: any = null

    if (selectedDow === todayDow) {
        displayWorkout = todaysWorkout
    } else if (scheduledForSelectedDay?.workout) {
        // Build a mock 'todaysWorkout' object for future/past days
        const w = scheduledForSelectedDay.workout
        displayWorkout = {
            id: null, // Can't resume a future/past workout directly without creating a log
            status: 'scheduled',
            workout: w,
            workout_id: Array.isArray(w) ? w[0]?.id : w?.id
        }
    }

    const handleStartWorkout = async (formData: FormData) => {
        const result = await startWorkoutSession(formData)
        if (result?.id) {
            router.push(`/dashboard/workout/${result.id}`)
        } else if (result?.error) {
            alert(result.error)
        }
    }

    return (
        <div className="space-y-6">
            {/* ═══ WEEK PREVIEW / SWITCHER ═══ */}
            <div className="px-4">
                <div className="flex items-center justify-between gap-1.5 shrink-0 overflow-x-auto pb-2 mb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {['D','L','M','X','J','V','S'].map((label, i) => {
                        const hasWorkout = weekSchedule.some((s: any) => s.day_of_week === i)
                        const isToday = i === todayDow
                        const isSelected = i === selectedDow
                        
                        return (
                            <button 
                                key={i} 
                                onClick={() => setSelectedDow(i)}
                                className={`flex flex-col items-center gap-1.5 min-w-[3rem] py-2 rounded-2xl transition-all snap-center ${
                                    isSelected 
                                    ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 scale-105' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-primary' : isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                    {label}
                                </span>
                                <div className={`w-8 h-1.5 rounded-full transition-all ${
                                    hasWorkout && isToday ? 'bg-primary shadow-sm shadow-primary/30' :
                                    hasWorkout && isSelected ? 'bg-indigo-400 dark:bg-indigo-500' :
                                    hasWorkout ? 'bg-violet-300 dark:bg-violet-700' :
                                    'bg-slate-100 dark:bg-slate-800/50'
                                }`} />
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ═══ SELECTED WORKOUT CARD ═══ */}
            <div 
                className="px-2 transition-all duration-300"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {displayWorkout ? (
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                        <div className="flex items-start justify-between mb-4 pl-2">
                            <div>
                                <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">
                                    {selectedDow === todayDow 
                                        ? (displayWorkout.status === 'scheduled' ? 'Programada para Hoy' : 'Siguiente Sesión') 
                                        : 'Rutina Programada'
                                    }
                                </span>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                                    {Array.isArray(displayWorkout.workout) ? displayWorkout.workout[0]?.name : displayWorkout.workout?.name}
                                </h2>
                                <p className="text-slate-500 text-sm mt-1">
                                    {Array.isArray(displayWorkout.workout) 
                                        ? (Array.isArray(displayWorkout.workout[0]?.trainer) ? displayWorkout.workout[0]?.trainer[0]?.full_name : displayWorkout.workout[0]?.trainer?.full_name) 
                                        : (Array.isArray(displayWorkout.workout?.trainer) ? displayWorkout.workout?.trainer[0]?.full_name : displayWorkout.workout?.trainer?.full_name)}
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${displayWorkout.status === 'scheduled' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' : 'bg-primary/10 text-primary'}`}>
                                {displayWorkout.status === 'scheduled' ? <Calendar className="w-8 h-8" /> : <PlayCircle className="w-8 h-8" />}
                            </div>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 pl-2 line-clamp-2">
                            {Array.isArray(displayWorkout.workout) ? displayWorkout.workout[0]?.description : displayWorkout.workout?.description}
                        </p>

                        {/* Show Start/Resume button if it's today's workout. If it's another day, maybe allow them to start it anyway, or just view it. 
                            Let's allow them to start it if they want. */}
                        {displayWorkout.status === 'completed' ? (
                            <div className="pl-2">
                                <div className="w-full h-14 flex items-center justify-center gap-2 text-base font-bold rounded-xl bg-green-500/10 text-green-600 border border-green-500/20">
                                    <CheckCircle2 className="w-5 h-5" />
                                    ¡Rutina Completada!
                                </div>
                            </div>
                        ) : selectedDow === todayDow && displayWorkout.id ? (
                            <Link href={`/dashboard/workout/${displayWorkout.id}`} className="block pl-2">
                                <Button className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]">
                                    Continuar Rutina
                                </Button>
                            </Link>
                        ) : (
                            <div className="pl-2">
                                <form action={handleStartWorkout}>
                                    <input type="hidden" name="workoutId" value={displayWorkout.workout_id || ''} />
                                    <Button type="submit" className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]">
                                        Comenzar {selectedDow !== todayDow ? 'Adelantada' : 'Rutina'}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[24px] border-dashed border-2 border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
                        <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">¡Día libre!</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-[200px]">
                            {selectedDow === todayDow ? 'No tienes rutinas programadas hoy. ¡Disfruta tu descanso!' : 'No hay rutinas asignadas para este día.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
