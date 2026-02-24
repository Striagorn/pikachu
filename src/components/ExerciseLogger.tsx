'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Plus, Timer, Trash2, CheckCircle2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { logSet } from '../app/dashboard/workout/[id]/actions'
import { toast } from "sonner"
import { successHaptic } from "@/utils/haptics"
import { VideoDialog } from "@/components/VideoDialog"
import { ExerciseHistorySheet } from "@/components/ExerciseHistorySheet"

interface ExerciseLoggerProps {
    logId: string
    exercise: any
    history: any[] // Current session logs
    previousLogs: any[] // Last session logs
    onCompleted?: () => void // Callback to advance carousel
}

export function ExerciseLogger({ logId, exercise, history, previousLogs, onCompleted }: ExerciseLoggerProps) {
    // Sort history by set_number to ensure correct order
    const sortedHistory = [...history].sort((a, b) => a.set_number - b.set_number)
    
    // Max planned sets from the workout plan (defaults to 10 if not set)
    const maxSets: number = Number(exercise.sets) || 10

    // Logic to find first available set number (filling gaps)
    function getNextSetNumber(currentSets: any[]) {
        const existingNumbers = new Set(currentSets.map(s => s.set_number))
        let i = 1
        while (existingNumbers.has(i)) {
            i++
        }
        return i
    }

    const [sets, setSets] = useState<any[]>(sortedHistory)
    const [currentSet, setCurrentSet] = useState(getNextSetNumber(sortedHistory))
    const [weight, setWeight] = useState(exercise.target_weight ? exercise.target_weight.replace(/\D/g,'') : '')
    const [reps, setReps] = useState(exercise.reps.split('-')[0])
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setCurrentSet(getNextSetNumber(sets))
    }, [sets])
    
    // Find previous performance for the current set
    const prevSetLog = previousLogs.find(p => p.exercise_name === exercise.exercise_name && p.set_number === currentSet)

    // ✅ All planned sets completed
    const isExerciseComplete = sets.length >= maxSets

    async function handleSaveSet() {
        setIsSaving(true)
        
        const newSet = {
            log_id: logId,
            exercise_name: exercise.exercise_name,
            set_number: currentSet,
            weight: Number(weight),
            reps: Number(reps)
        }

        const optimisticSets = [...sets, newSet].sort((a, b) => a.set_number - b.set_number)
        setSets(optimisticSets)
        
        try {
            const formData = new FormData()
            formData.append('logId', logId)
            formData.append('exerciseName', exercise.exercise_name)
            formData.append('setNumber', newSet.set_number.toString())
            formData.append('weight', newSet.weight.toString())
            formData.append('reps', newSet.reps.toString())

            const result = await logSet(formData)
            if (result.error) throw new Error(result.error)
            
            toast.success(`Set ${newSet.set_number} guardado`)
            successHaptic()
        } catch (error) {
            toast.error("Error al guardar")
            setSets(sets) 
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDeleteSet(setNumber: number) {
        const previousSets = [...sets]
        setSets(sets.filter(s => s.set_number !== setNumber))
        
        try {
            const formData = new FormData()
            formData.append('logId', logId)
            formData.append('exerciseName', exercise.exercise_name)
            formData.append('setNumber', setNumber.toString())

            const { deleteSet } = await import('../app/dashboard/workout/[id]/actions')
            const result = await deleteSet(formData)
            
            if (result.error) throw new Error(result.error)
            toast.success("Set eliminado")
        } catch (error) {
            toast.error("Error al eliminar")
            setSets(previousSets)
        }
    }

    return (
        <div className="space-y-4">
            {/* Header - Apple Style */}
            <div className="flex flex-col gap-3 mb-4 px-1">
                {/* Title and Image Row */}
                <div className="flex gap-4 w-full">
                    {/* Exercise Image Thumbnail */}
                    {exercise.image_url && (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <img 
                               src={exercise.image_url} 
                               alt={exercise.exercise_name}
                               className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    
                    {/* Title Block */}
                    <div className="flex-1">
                        <h3 className="text-[22px] md:text-2xl font-bold text-slate-900 dark:text-white capitalize leading-tight break-words">
                            {exercise.exercise_name}
                        </h3>
                        
                        {/* Meta tags */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs text-slate-500 dark:text-slate-400 font-medium">
                                <Timer className="w-3 h-3" /> {exercise.rest_seconds}s
                            </span>
                            {exercise.target_weight && (
                                <span className="text-xs font-semibold text-primary bg-primary/8 dark:bg-primary/15 px-2 py-0.5 rounded-md">
                                    Meta: {exercise.target_weight}
                                </span>
                            )}
                            {/* Progress indicator */}
                            <span className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1",
                                isExerciseComplete
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            )}>
                                {isExerciseComplete && <Check className="w-3 h-3" strokeWidth={3} />}
                                {sets.length}/{maxSets} series
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 self-start flex-shrink-0 ml-2">
                    <ExerciseHistorySheet exerciseName={exercise.exercise_name} />
                    {exercise.video_url && (
                       <div className="flex-shrink-0">
                           <VideoDialog videoUrl={exercise.video_url} title={exercise.exercise_name} />
                       </div>
                    )}
                </div>
            </div>

            {/* Trainer Notes Banner */}
            {exercise.trainer_notes && (
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/15 border border-amber-200/60 dark:border-amber-700/30 rounded-2xl px-4 py-3">
                    <MessageSquare className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[13px] text-amber-800 dark:text-amber-300 font-medium leading-snug">
                        {exercise.trainer_notes}
                    </p>
                </div>
            )}

            {/* Completed Sets Table */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[18px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-3 py-2.5 bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                    <div className="col-span-2">Set</div>
                    <div className="col-span-4">Anterior</div>
                    <div className="col-span-4">Actual</div>
                    <div className="col-span-2"></div>
                </div>

                {sets.length === 0 && (
                    <div className="p-6 text-center text-slate-300 dark:text-slate-600 text-sm">
                        — sin series aún —
                    </div>
                )}

                {sets.map((set) => (
                    <div key={set.set_number} className="grid grid-cols-12 gap-2 px-3 py-1.5 items-center border-b border-purple-50 dark:border-purple-900/10 last:border-0 bg-purple-50/50 dark:bg-purple-950/10 group">
                        
                        {/* Set Number */}
                        <div className="col-span-2 flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-black flex items-center justify-center">
                                {set.set_number}
                            </div>
                        </div>

                        {/* Previous Data */}
                        <div className="col-span-4 text-center text-xs text-slate-400 font-medium">
                            { previousLogs.find(p => p.set_number === set.set_number)?.weight ? (
                                <span>{previousLogs.find(p => p.set_number === set.set_number)?.weight}kg × {previousLogs.find(p => p.set_number === set.set_number)?.reps}</span>
                            ) : <span className="text-slate-200 dark:text-slate-700">—</span>}
                        </div>

                        {/* Current Log */}
                        <div className="col-span-4 text-center">
                             <span className="font-black text-slate-900 dark:text-white text-base">{set.weight}</span>
                             <span className="text-xs text-slate-400 mx-0.5">kg</span>
                             <span className="text-slate-300 mx-1">×</span>
                             <span className="font-black text-slate-900 dark:text-white text-base">{set.reps}</span>
                        </div>

                        {/* Trash — only visible on hover/group-hover */}
                        <div className="col-span-2 flex justify-center">
                             <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-purple-300 dark:text-purple-700 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                                onClick={() => handleDeleteSet(set.set_number)}
                             >
                                <Trash2 className="w-3.5 h-3.5" />
                             </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ✅ Completion state — shown when all planned sets are done */}
            {isExerciseComplete ? (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/40 overflow-hidden">
                    <div className="flex items-center gap-2.5 py-4 px-4">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-green-800 dark:text-green-300">¡Ejercicio completado!</p>
                            <p className="text-xs text-green-600 dark:text-green-500">{maxSets} series guardadas · Buen trabajo 💪</p>
                        </div>
                    </div>
                    {onCompleted && (
                        <button
                            onClick={onCompleted}
                            className="w-full py-3 text-sm font-bold text-green-700 dark:text-green-300 bg-green-100/60 dark:bg-green-900/40 hover:bg-green-100 dark:hover:bg-green-900/60 border-t border-green-100 dark:border-green-800/40 transition-colors active:scale-[0.99]"
                        >
                            Siguiente ejercicio →
                        </button>
                    )}
                </div>
            ) : (
                /* Active set input */
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">
                                {currentSet}
                            </span>
                            Serie Actual
                        </span>
                        {prevSetLog && (
                            <span className="text-xs text-purple-500 font-semibold bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">
                                Ant: {prevSetLog.weight}kg × {prevSetLog.reps}
                            </span>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-[20px] border-2 border-primary/20 dark:border-primary/30 shadow-lg shadow-primary/5 flex gap-2">
                        <div className="flex-1 relative">
                            <label className="absolute top-2 left-0 w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-wider z-10 pointer-events-none">Peso (kg)</label>
                            <Input 
                                type="number" 
                                value={weight} 
                                onChange={(e) => setWeight(e.target.value)}
                                className="h-16 pt-4 text-2xl text-center font-black bg-slate-50 dark:bg-black border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <label className="absolute top-2 left-0 w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-wider z-10 pointer-events-none">Reps</label>
                            <Input 
                                type="number" 
                                value={reps} 
                                onChange={(e) => setReps(e.target.value)}
                                className="h-16 pt-4 text-2xl text-center font-black bg-slate-50 dark:bg-black border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30"
                                placeholder="0"
                            />
                        </div>
                        <Button 
                            className="h-16 w-16 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 flex-shrink-0 transition-all active:scale-95"
                            onClick={handleSaveSet}
                            disabled={isSaving}
                        >
                            {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Check className="w-7 h-7" strokeWidth={3} />}
                        </Button>
                    </div>
                </div>
            )}


        </div>
    )
}
