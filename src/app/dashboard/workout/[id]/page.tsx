import { getWorkoutSession, logSet } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ArrowLeft, Timer, Video, CheckCircle2 } from "lucide-react"
import Link from 'next/link'
import { WorkoutCarousel } from "@/components/WorkoutCarousel"
import { VideoDialog } from "@/components/VideoDialog"
import { FinishWorkoutConfirmation } from "@/components/FinishWorkoutConfirmation"
import { cn } from "@/lib/utils"

export default async function WorkoutSessionPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getWorkoutSession(params.id)

  if (!session) {
      return <div>Sesión no encontrada o no tienes permiso.</div>
  }

  const { log, exercises, history } = session

    const isCompleted = log.status === 'completed'

    if (isCompleted) {
        return (
            <div className="space-y-6 pb-20">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">{log.workout?.name || 'Rutina'}</h2>
                        <div className="flex items-center text-green-600 text-sm font-medium mt-1">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Completado el {new Date(log.date).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {exercises.map((exercise: any) => (
                    <Card key={exercise.id} className="overflow-hidden opacity-90">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800 py-3">
                            <CardTitle className="text-base">{exercise.exercise_name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-[auto_1fr_1fr] gap-2 p-2 text-xs font-medium text-muted-foreground text-center border-b">
                                <div className="w-8">Set</div>
                                <div>Kg</div>
                                <div>Reps</div>
                            </div>
                            {history.filter((h: any) => h.exercise_name === exercise.exercise_name)
                                .sort((a: any, b: any) => a.set_number - b.set_number)
                                .map((set: any) => (
                                <div key={set.id} className="grid grid-cols-[auto_1fr_1fr] gap-2 p-2 items-center border-b last:border-0">
                                    <div className="w-8 flex justify-center items-center font-bold text-sm bg-slate-100 dark:bg-slate-800 rounded-full h-6 w-6">
                                        {set.set_number}
                                    </div>
                                    <div className="text-center font-medium">{set.weight} <span className="text-xs text-muted-foreground">kg</span></div>
                                    <div className="text-center font-medium">{set.reps} <span className="text-xs text-muted-foreground">reps</span></div>
                                </div>
                            ))}
                            {history.filter((h: any) => h.exercise_name === exercise.exercise_name).length === 0 && (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No se registraron series.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
      <div className="space-y-2 pb-20">
      <WorkoutCarousel
        logId={params.id}
        workoutName={log.workout?.name || 'Rutina'}
        exercises={exercises}
        history={history}
        previousLogs={session.previousLogs}
        personalRecords={session.personalRecords}
      />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t z-40">
         <div className="max-w-md mx-auto">
             <FinishWorkoutConfirmation 
                logId={params.id}
                workoutName={log.workout?.name || 'Rutina'}
                exercises={exercises}
                history={history}
             />
         </div>
      </div>
    </div>
  )
}
