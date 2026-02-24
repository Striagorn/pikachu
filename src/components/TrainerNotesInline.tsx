'use client'

import { useState, useRef } from 'react'
import { MessageSquare, Check, Loader2 } from 'lucide-react'
import { updateTrainerNotes } from '@/app/dashboard/workouts/actions'
import { cn } from '@/lib/utils'

interface TrainerNotesInlineProps {
    exerciseId: string
    initialNotes: string
}

export function TrainerNotesInline({ exerciseId, initialNotes }: TrainerNotesInlineProps) {
    const [notes, setNotes] = useState(initialNotes)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    async function handleSave() {
        if (notes === initialNotes) {
            setIsEditing(false)
            return
        }
        setIsSaving(true)
        await updateTrainerNotes(exerciseId, notes)
        setIsSaving(false)
        setSaved(true)
        setIsEditing(false)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setSaved(false), 2000)
    }

    if (!isEditing && !notes) {
        return (
            <button
                onClick={() => { setIsEditing(true); setTimeout(() => inputRef.current?.focus(), 50) }}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-500 transition-colors"
            >
                <MessageSquare className="h-3 w-3" />
                Agregar nota para el cliente
            </button>
        )
    }

    if (!isEditing && notes) {
        return (
            <button
                onClick={() => { setIsEditing(true); setTimeout(() => inputRef.current?.focus(), 50) }}
                className={cn(
                    "flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg transition-all w-full text-left",
                    saved
                        ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                        : "bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                )}
            >
                {saved ? <Check className="h-3 w-3 shrink-0" /> : <MessageSquare className="h-3 w-3 shrink-0" />}
                <span className="truncate">{notes}</span>
            </button>
        )
    }

    return (
        <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3 text-amber-500 shrink-0" />
            <input
                ref={inputRef}
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                placeholder="Nota para el cliente..."
                className="flex-1 text-[11px] bg-transparent border-b border-amber-300 dark:border-amber-700 focus:border-amber-500 outline-none py-0.5 text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
            />
            {isSaving && <Loader2 className="h-3 w-3 animate-spin text-amber-500" />}
        </div>
    )
}
