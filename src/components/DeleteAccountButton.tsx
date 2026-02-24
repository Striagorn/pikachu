'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { deleteAccount } from '@/app/dashboard/profile/delete-actions'

export function DeleteAccountButton() {
    const [open, setOpen] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const canDelete = confirmText.toLowerCase() === 'eliminar'

    async function handleDelete() {
        if (!canDelete) return
        setIsDeleting(true)
        setError(null)

        const result = await deleteAccount()
        if (result?.error) {
            setError(result.error)
            setIsDeleting(false)
        }
        // If successful, deleteAccount redirects — we won't reach here
    }

    return (
        <Dialog open={open} onOpenChange={(o) => {
            setOpen(o)
            if (!o) { setConfirmText(''); setError(null) }
        }}>
            <DialogTrigger asChild>
                <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors rounded-xl">
                    <Trash2 className="h-5 w-5" />
                    <div>
                        <p className="text-[15px] font-semibold">Eliminar cuenta</p>
                        <p className="text-[12px] text-red-400">Se borrarán todos tus datos permanentemente</p>
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center space-y-3">
                    <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-red-600">¿Eliminar tu cuenta?</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 leading-relaxed">
                        Esta acción es <strong className="text-slate-900 dark:text-white">permanente e irreversible</strong>. 
                        Se eliminarán todos tus datos incluyendo: rutinas, historial de entrenamiento, 
                        relaciones con clientes/entrenador, y tu perfil.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Escribe <strong className="text-red-600 font-bold">ELIMINAR</strong> para confirmar:
                        </p>
                        <Input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="ELIMINAR"
                            className="text-center font-semibold tracking-wider border-red-200 dark:border-red-800 focus-visible:ring-red-500"
                            disabled={isDeleting}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isDeleting}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={!canDelete || isDeleting}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 disabled:opacity-40"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Eliminando...
                                </>
                            ) : (
                                'Eliminar cuenta'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
