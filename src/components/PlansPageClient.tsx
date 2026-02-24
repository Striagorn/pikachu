'use client'

import { useState } from 'react'
import { getPlans, createPlan, archivePlan } from '../app/dashboard/plans/actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Calendar, CreditCard, Layers } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function PlansPage({ plans }: { plans: any[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleCreate(formData: FormData) {
    setIsLoading(true)
    const result = await createPlan(formData)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Plan creado exitosamente")
      setIsCreateOpen(false)
    }
  }

  async function handleArchive(planId: string) {
      if(!confirm("¿Estás seguro de archivar este plan? Ya no podrás asignarlo.")) return;

      const result = await archivePlan(planId)
      if (result.error) {
          toast.error("Error al archivar plan")
      } else {
          toast.success("Plan archivado")
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planes y Precios</h1>
          <p className="text-muted-foreground">Gestiona tus paquetes de entrenamiento.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Plan</DialogTitle>
              <DialogDescription>
                Define un paquete de sesiones y duración.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre del Plan</Label>
                        <Input id="name" name="name" placeholder="Ej: Pack Mensual 12 Sesiones" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="session_credits">Sesiones (Créditos)</Label>
                            <Input id="session_credits" name="session_credits" type="number" min="1" placeholder="12" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="validity_days">Duración (Días)</Label>
                            <Input id="validity_days" name="validity_days" type="number" min="1" placeholder="30" required />
                        </div>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="price">Precio (Opcional)</Label>
                        <Input id="price" name="price" type="number" min="0" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción (Opcional)</Label>
                        <Input id="description" name="description" placeholder="Incluye acceso a app + feedback..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creando..." : "Guardar Plan"}
                    </Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description || "Sin descripción"}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 flex-1">
                <div className="flex items-center space-x-4 text-sm">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span>{plan.session_credits} Sesiones</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{plan.validity_days} Días de vigencia</span>
                </div>
                 <div className="flex items-center space-x-4 text-sm font-semibold">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>${plan.price}</span>
                </div>
            </CardContent>
            <CardFooter>
                 <Button variant="ghost" size="sm" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleArchive(plan.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Archivar
                 </Button>
            </CardFooter>
          </Card>
        ))}
         {plans.length === 0 && (
            <div className="col-span-full text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
                <p>No tienes planes creados.</p>
                <p className="text-sm">Crea tu primer pack para empezar a vender.</p>
            </div>
        )}
      </div>
    </div>
  )
}
