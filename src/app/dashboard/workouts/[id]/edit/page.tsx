import { getWorkout, getWorkoutExercises, deleteExercise, getExerciseCatalog, reorderExercise, updateTrainerNotes } from '../../actions'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, ArrowLeft, Video, Dumbbell, ChevronUp, ChevronDown, MessageSquare } from "lucide-react"
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { AddExerciseForm } from "@/components/AddExerciseForm"
import { TrainerNotesInline } from "@/components/TrainerNotesInline"

export default async function EditWorkoutPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const workout = await getWorkout(params.id)
  const exercises = await getWorkoutExercises(params.id)
  const catalog = await getExerciseCatalog()

  if (!workout) {
      return <div>Rutina no encontrada</div>
  }

  const usedGroups = exercises
      .map((e: any) => e.superset_group)
      .filter((g: any) => g !== null && g !== undefined)
  const nextSupersetGroup = usedGroups.length > 0 ? Math.max(...usedGroups) + 1 : 1

  async function handleDeleteExercise(formData: FormData) {
      'use server'
      const id = formData.get('id') as string
      await deleteExercise(id)
      revalidatePath(`/dashboard/workouts/${params.id}/edit`)
  }

  async function handleReorder(formData: FormData) {
      'use server'
      const id = formData.get('id') as string
      const direction = formData.get('direction') as 'up' | 'down'
      await reorderExercise(id, direction)
      revalidatePath(`/dashboard/workouts/${params.id}/edit`)
  }

  const sortedExercises = [...exercises].sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))

  const displayGroups: any[] = []
  const processedIds = new Set()
  
  for (const exercise of sortedExercises) {
      if (processedIds.has(exercise.id)) continue
      
      if (exercise.superset_group != null) {
          const groupExercises = sortedExercises.filter(
              (e: any) => e.superset_group === exercise.superset_group && !processedIds.has(e.id)
          )
          groupExercises.forEach((e: any) => processedIds.add(e.id))
          displayGroups.push({ type: 'superset', exercises: groupExercises, group: exercise.superset_group })
      } else {
          processedIds.add(exercise.id)
          displayGroups.push({ type: 'single', exercise })
      }
  }

  let exerciseCounter = 0
  const totalExercises = sortedExercises.length

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/workouts">
            <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
        <div>
            <h2 className="text-3xl font-bold tracking-tight">{workout.name}</h2>
            <p className="text-muted-foreground">{workout.description}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Ejercicios</h3>
            {displayGroups.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    No hay ejercicios en esta rutina. Añade uno a la derecha.
                </div>
            ) : (
                displayGroups.map((group: any) => {
                    if (group.type === 'superset') {
                        return (
                            <div key={`ss-${group.group}`} className="relative">
                                <div className="absolute -top-2.5 left-4 z-10 bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                                    Biserie · Grupo {group.group}
                                </div>
                                <div className="border-2 border-purple-300 dark:border-purple-700 rounded-xl overflow-hidden bg-purple-50/30 dark:bg-purple-900/10 divide-y divide-purple-200 dark:divide-purple-800">
                                    {group.exercises.map((exercise: any) => {
                                        exerciseCounter++
                                        return renderExerciseRow(exercise, exerciseCounter, totalExercises, handleDeleteExercise, handleReorder)
                                    })}
                                </div>
                            </div>
                        )
                    } else {
                        exerciseCounter++
                        return (
                            <Card key={group.exercise.id}>
                                {renderExerciseCard(group.exercise, exerciseCounter, totalExercises, handleDeleteExercise, handleReorder)}
                            </Card>
                        )
                    }
                })
            )}
        </div>

        <div>
            <Card className="sticky top-6">
                <CardHeader>
                    <CardTitle>Añadir Ejercicio</CardTitle>
                </CardHeader>
                <CardContent>
                    <AddExerciseForm
                        workoutId={params.id}
                        catalog={catalog}
                        nextSupersetGroup={nextSupersetGroup}
                    />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}

function renderExerciseRow(exercise: any, index: number, total: number, handleDelete: (fd: FormData) => Promise<void>, handleReorder: (fd: FormData) => Promise<void>) {
    return (
        <div key={exercise.id} className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 text-xs font-bold text-purple-700 dark:text-purple-300">
                        {index}
                    </span>
                    <div className="space-y-0.5">
                        <p className="text-base font-semibold">{exercise.exercise_name}</p>
                        <div className="flex gap-2">
                            {exercise.video_url && (
                                <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex items-center text-xs">
                                    <Video className="h-3 w-3 mr-1" /> Video
                                </a>
                            )}
                            {exercise.target_weight && (
                                <span className="text-muted-foreground flex items-center text-xs">
                                    <Dumbbell className="h-3 w-3 mr-1" /> {exercise.target_weight}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-0.5">
                    {/* Reorder buttons */}
                    <form action={handleReorder}>
                        <input type="hidden" name="id" value={exercise.id} />
                        <input type="hidden" name="direction" value="up" />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600" disabled={index === 1}>
                            <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                    </form>
                    <form action={handleReorder}>
                        <input type="hidden" name="id" value={exercise.id} />
                        <input type="hidden" name="direction" value="down" />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600" disabled={index === total}>
                            <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                    </form>
                    <form action={handleDelete}>
                        <input type="hidden" name="id" value={exercise.id} />
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7">
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </form>
                </div>
            </div>
            <div className="text-sm text-muted-foreground flex gap-4 pl-9">
                <span><span className="font-semibold text-foreground">{exercise.sets}</span> Series</span>
                <span><span className="font-semibold text-foreground">{exercise.reps}</span> Reps</span>
                <span><span className="font-semibold text-foreground">{exercise.rest_seconds}s</span> Descanso</span>
            </div>
            {/* Trainer notes */}
            <div className="pl-9">
                <TrainerNotesInline exerciseId={exercise.id} initialNotes={exercise.trainer_notes || ''} />
            </div>
        </div>
    )
}

function renderExerciseCard(exercise: any, index: number, total: number, handleDelete: (fd: FormData) => Promise<void>, handleReorder: (fd: FormData) => Promise<void>) {
    return (
        <>
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                        {index}
                    </span>
                    <div className="space-y-1">
                        <CardTitle className="text-base">{exercise.exercise_name}</CardTitle>
                        <div className="flex gap-2">
                            {exercise.video_url && (
                                <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex items-center text-xs">
                                    <Video className="h-3 w-3 mr-1" /> Ver Video
                                </a>
                            )}
                            {exercise.target_weight && (
                                <span className="text-muted-foreground flex items-center text-xs">
                                    <Dumbbell className="h-3 w-3 mr-1" /> Peso: {exercise.target_weight}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-0.5">
                    {/* Reorder */}
                    <form action={handleReorder}>
                        <input type="hidden" name="id" value={exercise.id} />
                        <input type="hidden" name="direction" value="up" />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600" disabled={index === 1}>
                            <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                    </form>
                    <form action={handleReorder}>
                        <input type="hidden" name="id" value={exercise.id} />
                        <input type="hidden" name="direction" value="down" />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600" disabled={index === total}>
                            <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                    </form>
                    <form action={handleDelete}>
                        <input type="hidden" name="id" value={exercise.id} />
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7">
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </form>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                <div className="text-sm text-muted-foreground grid grid-cols-3 gap-4">
                    <div>
                        <span className="font-semibold text-foreground">{exercise.sets}</span> Series
                    </div>
                    <div>
                        <span className="font-semibold text-foreground">{exercise.reps}</span> Reps
                    </div>
                    <div>
                        <span className="font-semibold text-foreground">{exercise.rest_seconds}s</span> Descanso
                    </div>
                </div>
                {/* Trainer notes */}
                <TrainerNotesInline exerciseId={exercise.id} initialNotes={exercise.trainer_notes || ''} />
            </CardContent>
        </>
    )
}
