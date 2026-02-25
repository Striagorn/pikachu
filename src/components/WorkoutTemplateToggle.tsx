'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { toggleWorkoutTemplate } from '@/app/dashboard/clients/actions'
import { toast } from 'sonner'

export function WorkoutTemplateToggle({ workoutId, initialIsTemplate }: { workoutId: string, initialIsTemplate: boolean }) {
    const [isTemplate, setIsTemplate] = useState(initialIsTemplate)
    const [isLoading, setIsLoading] = useState(false)

    async function handleToggle(e: React.MouseEvent) {
        e.preventDefault() // prevent navigating into edit page
        setIsLoading(true)
        const nextState = !isTemplate
        const result = await toggleWorkoutTemplate(workoutId, nextState)
        setIsLoading(false)
        if (result.error) toast.error(result.error)
        else {
            setIsTemplate(nextState)
            toast.success(nextState ? 'Marcada como plantilla' : 'Quitada de plantillas')
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            title={isTemplate ? 'Quitar de plantillas' : 'Marcar como plantilla'}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all active:scale-90 z-10"
        >
            {isTemplate ? (
                <BookmarkCheck className="h-4 w-4 text-amber-500" strokeWidth={2} />
            ) : (
                <Bookmark className="h-4 w-4" strokeWidth={1.8} />
            )}
        </button>
    )
}
