'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Calendar } from "lucide-react"

interface WorkoutSummaryDialogProps {
  log: any
}

export function WorkoutSummaryDialog({ log }: WorkoutSummaryDialogProps) {
  const workoutData = Array.isArray(log.workout) ? log.workout[0] : log.workout
  const trainerData = Array.isArray(workoutData?.trainer) ? workoutData?.trainer[0] : workoutData?.trainer
  const logs = log.exercise_logs || []

  // Group logs by exercise name
  const exercises = logs.reduce((acc: any, curr: any) => {
    if (!acc[curr.exercise_name]) {
      acc[curr.exercise_name] = []
    }
    acc[curr.exercise_name].push(curr)
    return acc
  }, {})

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer text-left">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <h4 className="font-semibold">{workoutData?.name || 'Rutina'}</h4>
                    <p className="text-xs text-muted-foreground">
                        {new Date(log.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} • {trainerData?.full_name || 'Entrenador'}
                    </p>
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Completado
                </div>
            </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto w-[95%] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{workoutData?.name || 'Resumen de Entrenamiento'}</DialogTitle>
          <DialogDescription>
            Completado el {new Date(log.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
            {Object.entries(exercises).map(([name, sets]: [string, any]) => (
                <div key={name} className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-2">{name}</h4>
                    <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-xs text-muted-foreground font-medium mb-1 px-2">
                        <div className="w-8 text-center">Set</div>
                        <div className="text-center">Peso</div>
                        <div className="text-center">Reps</div>
                    </div>
                    {sets.sort((a: any, b: any) => a.set_number - b.set_number).map((set: any) => (
                        <div key={set.id} className="grid grid-cols-[auto_1fr_1fr] gap-2 py-1.5 px-2 border-t items-center text-sm">
                            <div className="w-8 flex justify-center items-center font-bold text-xs bg-slate-100 dark:bg-slate-800 rounded-full h-5 w-5">
                                {set.set_number}
                            </div>
                            <div className="text-center font-semibold">{set.weight}<span className="text-[10px] font-normal text-muted-foreground ml-0.5">kg</span></div>
                            <div className="text-center font-semibold">{set.reps}<span className="text-[10px] font-normal text-muted-foreground ml-0.5">reps</span></div>
                        </div>
                    ))}
                </div>
            ))}
             {Object.keys(exercises).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    No hay detalles registrados para este entrenamiento.
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
