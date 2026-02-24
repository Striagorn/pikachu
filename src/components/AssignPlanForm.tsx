'use client'

import { useState } from 'react'
import { assignPlan } from '../app/dashboard/clients/actions'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function AssignPlanForm({ clientId, plans, onClose }: { clientId: string, plans: any[], onClose?: () => void }) {
    const [selectedPlanId, setSelectedPlanId] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    async function handleAssign() {
        if (!selectedPlanId) {
            toast.error("Selecciona un plan")
            return
        }

        setIsLoading(true)
        const result = await assignPlan(clientId, selectedPlanId)
        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Plan asignado correctamente")
            if (onClose) onClose()
        }
    }

    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="plan">Seleccionar Plan</Label>
                <Select onValueChange={setSelectedPlanId} value={selectedPlanId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Elige un plan..." />
                    </SelectTrigger>
                    <SelectContent>
                        {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                                {plan.name} ({plan.session_credits} sesiones / {plan.validity_days} días)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleAssign} disabled={isLoading || !selectedPlanId} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Asignar Plan
            </Button>
        </div>
    )
}
