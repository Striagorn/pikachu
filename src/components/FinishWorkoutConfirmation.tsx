'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Trophy } from "lucide-react"
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
  const end = Date.now() + 1500
  const colors = ['#8b5cf6', '#10b981', '#f59e0b']
  ;(function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors })
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  }())
}

function getRpeColor(rpe: number): string {
  if (rpe <= 3) return '#22c55e'
  if (rpe <= 5) return '#84cc16'
  if (rpe <= 7) return '#f59e0b'
  if (rpe <= 9) return '#f97316'
  return '#ef4444'
}

function getRpeLabel(rpe: number): string {
  if (rpe <= 2) return 'Muy fácil'
  if (rpe <= 4) return 'Fácil'
  if (rpe <= 6) return 'Moderado'
  if (rpe <= 8) return 'Difícil'
  if (rpe <= 9) return 'Muy difícil'
  return 'Máximo esfuerzo'
}

export function FinishWorkoutConfirmation({
  logId,
  workoutName,
  exercises,
  history
}: FinishWorkoutConfirmationProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rpe, setRpe] = useState(7)

  const totalSets = history.length
  const totalVolume = history.reduce((acc, curr) => acc + (curr.weight * curr.reps), 0)
  const exercisesCompleted = exercises.filter(ex =>
    history.some(h => h.exercise_name === ex.exercise_name)
  ).length

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    fireConfetti()
    triggerHaptic()
    await finishWorkout(formData)
    await new Promise(r => setTimeout(r, 1200))
    router.push('/dashboard')
  }

  const rpeColor = getRpeColor(rpe)
  const rpePercent = ((rpe - 1) / 9) * 100

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
          <input type="hidden" name="rpe" value={rpe} />

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
                <p className="text-[22px] font-black text-slate-900 dark:text-white">
                  {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}
                </p>
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
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Resumen</h3>
              {exercises.map((exercise) => {
                const isDone = history.some(h => h.exercise_name === exercise.exercise_name)
                return (
                  <div
                    key={exercise.id}
                    className={`p-3 rounded-xl border flex justify-between items-center ${isDone
                      ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-100 dark:bg-slate-800/50 border-transparent opacity-60'
                    }`}
                  >
                    <span className="font-semibold text-sm capitalize">{exercise.exercise_name}</span>
                    {isDone
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      : <div className="h-4 w-4 rounded-full border border-slate-300 flex-shrink-0" />
                    }
                  </div>
                )
              })}
            </div>

            {/* RPE + Notes */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-3">
                {/* Label + live pill */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold">Esfuerzo percibido</label>
                  <span
                    className="text-xs font-black px-2.5 py-1 rounded-lg text-white transition-all duration-300"
                    style={{ backgroundColor: rpeColor }}
                  >
                    {rpe}/10 · {getRpeLabel(rpe)}
                  </span>
                </div>

                {/* Colored slider */}
                <input
                  type="range"
                  name="rpe_display"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={e => setRpe(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${rpeColor} 0%, ${rpeColor} ${rpePercent}%, #e2e8f0 ${rpePercent}%, #e2e8f0 100%)`,
                    accentColor: rpeColor
                  }}
                />

                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                  <span>Muy fácil</span>
                  <span>Moderado</span>
                  <span>Máximo</span>
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

          {/* Footer */}
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
