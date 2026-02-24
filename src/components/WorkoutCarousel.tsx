'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseLogger } from '@/components/ExerciseLogger'
import { cn } from '@/lib/utils'
import { ChevronLeft, Link2 } from 'lucide-react'

interface WorkoutCarouselProps {
    logId: string
    workoutName: string
    exercises: any[]
    history: any[]
    previousLogs: any[]
}

export function WorkoutCarousel({ logId, workoutName, exercises, history, previousLogs }: WorkoutCarouselProps) {
    const router = useRouter()

    // Build slides: group biseries exercises together into a single slide
    const slides = useMemo(() => {
        const result: { type: 'single' | 'superset'; exercises: any[] }[] = []
        const processed = new Set<string>()

        for (const exercise of exercises) {
            if (processed.has(exercise.id)) continue

            if (exercise.superset_group != null) {
                const group = exercises.filter(
                    (e: any) => e.superset_group === exercise.superset_group && !processed.has(e.id)
                )
                group.forEach((e: any) => processed.add(e.id))
                result.push({ type: 'superset', exercises: group })
            } else {
                processed.add(exercise.id)
                result.push({ type: 'single', exercises: [exercise] })
            }
        }
        return result
    }, [exercises])

    const [currentIndex, setCurrentIndex] = useState(0)
    const touchStartX = useRef<number | null>(null)
    const touchStartY = useRef<number | null>(null)
    const isDragging = useRef(false)

    const goTo = useCallback((index: number) => {
        if (index < 0 || index >= slides.length) return
        setCurrentIndex(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [slides.length])

    const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo])
    const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo])

    // Touch swipe handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
        isDragging.current = false
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return
        const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current)
        const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current)
        if (deltaX > deltaY && deltaX > 10) isDragging.current = true
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || !isDragging.current) return
        const deltaX = e.changedTouches[0].clientX - touchStartX.current
        if (deltaX < -60) goNext()
        else if (deltaX > 60) goPrev()
        touchStartX.current = null
        touchStartY.current = null
        isDragging.current = false
    }

    const currentSlide = slides[currentIndex]

    return (
        <div
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Unified header: back button + workout name + progress dots */}
            <div className="sticky top-14 md:top-0 z-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md pt-2 pb-4 -mt-6">
                {/* Back + Workout name row */}
                <div className="flex items-center justify-center relative mb-2 min-h-6">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="hidden md:flex absolute left-0 items-center gap-0.5 text-primary font-medium text-sm active:opacity-60 transition-opacity"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span>Volver</span>
                    </button>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] px-12 text-center line-clamp-1">
                        {workoutName}
                    </p>
                </div>
                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1.5 mb-2 flex-wrap max-w-[280px] mx-auto">
                    {slides.map((slide, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={cn(
                                "transition-all duration-300 rounded-full",
                                i === currentIndex
                                    ? slide.type === 'superset' ? "w-8 h-1.5 bg-purple-500" : "w-6 h-1.5 bg-primary"
                                    : slide.type === 'superset' ? "w-2.5 h-1.5 bg-purple-300 dark:bg-purple-700" : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700"
                            )}
                        />
                    ))}
                </div>
                {/* Slide counter */}
                <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {currentSlide.type === 'superset' ? (
                        <span className="text-purple-600 dark:text-purple-400 font-black">
                            Biserie
                        </span>
                    ) : (
                        <>Ejercicio <span className="text-primary font-black">{currentIndex + 1}</span></>
                    )} de {slides.length}
                </p>
            </div>

            {/* Slide content */}
            <div
                key={currentIndex}
                className="animate-in slide-in-from-right-4 duration-300"
            >
                {currentSlide.type === 'superset' ? (
                    /* ─── BISERIE VIEW ─── */
                    <div className="space-y-0">
                        {/* Biserie banner */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="h-px flex-1 bg-purple-200 dark:bg-purple-800" />
                            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em] bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-700">
                                <Link2 className="w-3 h-3 inline mr-1 -mt-0.5" />
                                Biserie · Alternar ejercicios
                            </span>
                            <div className="h-px flex-1 bg-purple-200 dark:bg-purple-800" />
                        </div>
                        {currentSlide.exercises.map((exercise: any, i: number) => (
                            <div key={exercise.id} className="mb-6">
                                <ExerciseLogger
                                    logId={logId}
                                    exercise={exercise}
                                    history={history.filter((h: any) => h.exercise_name === exercise.exercise_name)}
                                    previousLogs={previousLogs.filter((h: any) => h.exercise_name === exercise.exercise_name)}
                                    onCompleted={
                                        i === currentSlide.exercises.length - 1 && currentIndex < slides.length - 1
                                            ? goNext
                                            : undefined
                                    }
                                />
                                {/* Separator between biserie exercises */}
                                {i < currentSlide.exercises.length - 1 && (
                                    <div className="flex items-center justify-center gap-2 my-4">
                                        <div className="h-px flex-1 bg-purple-100 dark:bg-purple-900" />
                                        <span className="text-[9px] font-bold text-purple-400 uppercase">luego</span>
                                        <div className="h-px flex-1 bg-purple-100 dark:bg-purple-900" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ─── SINGLE EXERCISE VIEW ─── */
                    <div className="pt-4">
                        <ExerciseLogger
                            logId={logId}
                            exercise={currentSlide.exercises[0]}
                            history={history.filter((h: any) => h.exercise_name === currentSlide.exercises[0].exercise_name)}
                            previousLogs={previousLogs.filter((h: any) => h.exercise_name === currentSlide.exercises[0].exercise_name)}
                            onCompleted={currentIndex < slides.length - 1 ? goNext : undefined}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
