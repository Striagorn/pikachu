import { getWorkouts, createWorkout, duplicateWorkout } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Dumbbell, ChevronRight, Copy } from "lucide-react"
import Link from 'next/link'

export default async function WorkoutsPage() {
  const workouts = await getWorkouts()

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Rutinas
        </h1>

        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 text-[15px] font-medium text-blue-500 hover:text-blue-600 transition-colors">
              <Plus className="h-4 w-4" />
              Nueva
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Rutina</DialogTitle>
              <DialogDescription>
                Dale un nombre a la rutina para empezar a añadir ejercicios.
              </DialogDescription>
            </DialogHeader>
            <form action={createWorkout}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nombre</Label>
                  <Input id="name" name="name" className="col-span-3" required placeholder="Ej: Hipertrofia Pierna" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Descripción</Label>
                  <Input id="description" name="description" className="col-span-3" placeholder="Opcional" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Crear rutina</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {workouts.length === 0 ? (
        <div className="bg-white dark:bg-white/[0.06] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] p-10 flex flex-col items-center text-center shadow-sm shadow-black/[0.04]">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-blue-500" strokeWidth={1.5} />
          </div>
          <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white mb-1">
            No hay rutinas
          </h3>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 max-w-xs">
            Crea tu primera rutina para empezar a asignar entrenamientos.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">
            {workouts.length} {workouts.length === 1 ? 'rutina' : 'rutinas'}
          </p>
          <div className="bg-white dark:bg-white/[0.06] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] divide-y divide-black/[0.04] dark:divide-white/[0.04] shadow-sm shadow-black/[0.04]">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors group"
              >
                {/* Icon badge */}
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <Dumbbell className="h-5 w-5 text-blue-500" strokeWidth={1.8} />
                </div>

                {/* Info */}
                <Link href={`/dashboard/workouts/${workout.id}/edit`} className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-gray-900 dark:text-white truncate">
                    {workout.name}
                  </p>
                  {workout.description && (
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
                      {workout.description}
                    </p>
                  )}
                </Link>

                {/* Duplicate button */}
                <form action={async () => {
                  'use server'
                  await duplicateWorkout(workout.id)
                }}>
                  <button
                    type="submit"
                    title="Duplicar Rutina"
                    className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                  >
                    <Copy className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </form>

                {/* Chevron */}
                <Link href={`/dashboard/workouts/${workout.id}/edit`}>
                  <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-gray-400 transition-colors" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

