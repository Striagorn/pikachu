'use client'

import { useState } from 'react'
import { saveTrainerFeedback } from '@/app/dashboard/clients/actions'
import { toast } from 'sonner'

interface TrainerFeedbackPanelProps {
    logId: string
    clientName: string
    existingFeedback: string | null
}

export function TrainerFeedbackPanel({ logId, clientName, existingFeedback }: TrainerFeedbackPanelProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [feedback, setFeedback] = useState(existingFeedback || '')
    const [isSaving, setIsSaving] = useState(false)

    async function handleSave() {
        if (!feedback.trim()) return
        setIsSaving(true)
        const result = await saveTrainerFeedback(logId, feedback.trim())
        setIsSaving(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Feedback guardado')
            setIsEditing(false)
        }
    }

    return (
        <div className="px-5 py-3">
            {!isEditing && !existingFeedback ? (
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-[12px] font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                >
                    + Dar feedback a {clientName}
                </button>
            ) : isEditing ? (
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tu feedback</p>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder={`Escribe un comentario para ${clientName}...`}
                        className="w-full text-[13px] text-gray-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-violet-400 dark:focus:ring-violet-600 transition-all"
                        rows={3}
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !feedback.trim()}
                            className="flex-1 h-8 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-[12px] font-bold rounded-lg transition-colors"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                            onClick={() => { setIsEditing(false); setFeedback(existingFeedback || '') }}
                            className="px-3 h-8 text-[12px] font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-wider mb-1">Tu feedback</p>
                        <p className="text-[13px] text-gray-700 dark:text-gray-300">{existingFeedback}</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-[11px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 mt-0.5 transition-colors"
                    >
                        Editar
                    </button>
                </div>
            )}
        </div>
    )
}
