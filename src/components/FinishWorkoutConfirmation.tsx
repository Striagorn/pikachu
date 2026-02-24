'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Trophy, Dumbbell } from "lucide-react"
import { finishWorkout } from "@/app/dashboard/workout/[id]/actions"
import confetti from 'canvas-confetti'
import { triggerHaptic } from "@/utils/haptics"

interface FinishWorkoutConfirmationProps {
  logId: string
  workoutName: string
  exercises: any[]
  history: any[]
}

function fireConfetti() {
  const end = Date.now() + 1000
  const colors = ['#8b5cf6', '#10b981', '#f59e0b']

  ;(function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }())
}

export function FinishWorkoutConfirmation({ 
  logId, 
  workoutName, 
  exercises, 
  history 
}: FinishWorkoutConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Calculate stats
  const totalSets = history.length
  const totalVolume = history.reduce((acc, curr) => acc + (curr.weight * curr.reps), 0)
  const exercisesCompleted = exercises.filter(ex => 
    history.some(h => h.exercise_name === ex.exercise_name)
  ).length

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    // Fire confetti and haptic ONLY when they confirm finishing
    fireConfetti()
    triggerHaptic()
    // Then submit the form action
    await finishWorkout(formData)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full font-bold text-lg h-12 shadow-lg shadow-primary/20">
            Terminar Entrenamiento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50 dark:bg-slate-900 border-0">
        
        <form action={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <input type="hidden" name="logId" value={logId} />
            
            {/* Header */}
            <div className="bg-primary/10 p-6 flex flex-col items-center justify-center text-center space-y-2 flex-shrink-0">
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-2">
                    <Trophy className="h-6 w-6" />
                </div>
                <DialogTitle className="text-2xl font-bold text-primary">Sesión Completada</DialogTitle>
                <DialogDescription className="text-primary/80">
                    {exercisesCompleted}/{exercises.length} ejercicios completados
                </DialogDescription>
            </div>

            {/* Volume Stats */}
            <div className="bg-white dark:bg-[#1C1C1E] mx-6 -mt-3 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
                    <div className="text-center">
                        <p className="text-[22px] font-black text-slate-900 dark:text-white">{totalSets}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Series</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[22px] font-black text-slate-900 dark:text-white">{totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vol. (kg)</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[22px] font-black text-slate-900 dark:text-white">{exercisesCompleted}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ejercicios</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* Exercise Summary */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Resumen</h3>
                    {exercises.map((exercise) => {
                        const isDone = history.some(h => h.exercise_name === exercise.exercise_name)
                        return (
                            <div key={exercise.id} className={`p-3 rounded-xl border flex justify-between items-center ${isDone ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800' : 'bg-slate-100 dark:bg-slate-800/50 border-transparent opacity-60'}`}>
                                <span className="font-semibold text-sm">{exercise.exercise_name}</span>
                                {isDone ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4 rounded-full border border-slate-300" />}
                            </div>
                        )
                    })}
                </div>

                {/* Feedback Section */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="space-y-3">
                        <label className="text-sm font-bold block">Esfuerzo (RPE 1-10)</label>
                        <input 
                            type="range" 
                            name="rpe" 
                            min="1" 
                            max="10" 
                            defaultValue="7"
                            className="w-full accent-primary h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Muy fácil</span>
                            <span>Moderado</span>
                            <span>Extremo</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold block">Notas de la sesión</label>
                        <textarea 
                            name="notes"
                            placeholder="Ej: Me dolió un poco el hombro, subí peso en sentadilla..."
                            className="w-full min-h-[80px] p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm resize-none focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                 <Button 
                   type="submit" 
                   size="lg" 
                   disabled={isSubmitting}
                   className="w-full text-lg h-12 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                 >
                    {isSubmitting ? 'Guardando...' : 'Confirmar y Guardar'}
                 </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

