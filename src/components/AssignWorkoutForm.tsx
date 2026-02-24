'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { assignWorkout } from '../app/dashboard/clients/actions'

export function AssignWorkoutForm({ clientId, workouts, onClose }: { clientId: string, workouts: any[], onClose: () => void }) {
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        const result = await assignWorkout(formData)
        
        if (result.error) {
            toast.error("Error al asignar rutina")
        } else {
            toast.success("¡Rutina asignada con éxito!")
            onClose()
        }
        setIsPending(false)
    }

    return (
        <form action={handleSubmit}>
            <input type="hidden" name="clientId" value={clientId} />
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="workout">Selecciona Rutina</Label>
                    <Select name="workoutId" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                            {workouts.map((w: any) => (
                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? 'Asignando...' : 'Asignar para Hoy'}
                </Button>
            </DialogFooter>
        </form>
    )
}
