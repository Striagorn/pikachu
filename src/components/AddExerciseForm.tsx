'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Search, Link2 } from "lucide-react"
import { addExercise } from '../app/dashboard/workouts/actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface CatalogItem {
    name: string
    video_url?: string
    image_url?: string
}

interface AddExerciseFormProps {
    workoutId: string
    catalog: CatalogItem[]
    nextSupersetGroup: number
}

export function AddExerciseForm({ workoutId, catalog, nextSupersetGroup }: AddExerciseFormProps) {
    const [isPending, setIsPending] = useState(false)
    const [exerciseName, setExerciseName] = useState('')
    const [videoUrl, setVideoUrl] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isBiserie, setIsBiserie] = useState(false)
    const [supersetGroup, setSupersetGroup] = useState(nextSupersetGroup)
    const formRef = useRef<HTMLFormElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Filter catalog based on typed text
    const filtered = exerciseName.length > 0
        ? catalog.filter(c => c.name.toLowerCase().includes(exerciseName.toLowerCase()))
        : catalog

    // Close suggestions on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function selectFromCatalog(item: CatalogItem) {
        setExerciseName(item.name)
        if (item.video_url) setVideoUrl(item.video_url)
        setShowSuggestions(false)
    }

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        const name = exerciseName.trim()
        const sets = parseInt(formData.get('sets') as string)
        const reps = formData.get('reps') as string
        const rest = parseInt(formData.get('rest') as string)
        const video = videoUrl.trim() || undefined
        const targetWeight = (formData.get('target_weight') as string) || undefined
        const trainerNotes = (formData.get('trainer_notes') as string) || undefined

        await addExercise(
            workoutId, name, sets, reps, rest, video, targetWeight,
            isBiserie ? supersetGroup : null,
            trainerNotes
        )
        
        formRef.current?.reset()
        setExerciseName('')
        setVideoUrl('')
        // Don't reset biserie toggle — trainer might want to add the second exercise of the pair
        router.refresh()
        setIsPending(false)
    }

    return (
        <form ref={formRef} action={handleSubmit} className="space-y-4">
            {/* Exercise Name with Autocomplete */}
            <div className="space-y-2 relative" ref={suggestionsRef}>
                <Label htmlFor="exercise_name">Nombre del Ejercicio</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        id="exercise_name"
                        value={exerciseName}
                        onChange={(e) => {
                            setExerciseName(e.target.value)
                            setShowSuggestions(true)
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Buscar o escribir..."
                        className="pl-9"
                        required
                        autoComplete="off"
                    />
                </div>
                
                {/* Suggestions Dropdown */}
                {showSuggestions && filtered.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {filtered.slice(0, 10).map((item) => (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => selectFromCatalog(item)}
                                className="w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors first:rounded-t-xl last:rounded-b-xl"
                            >
                                <span className="font-medium truncate">{item.name}</span>
                                {item.video_url && (
                                    <Link2 className="h-3 w-3 text-blue-500 shrink-0 ml-2" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="sets">Series</Label>
                    <Input id="sets" name="sets" type="number" defaultValue="3" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="reps">Reps</Label>
                    <Input id="reps" name="reps" placeholder="8-12" required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="rest">Descanso (seg)</Label>
                    <Input id="rest" name="rest" type="number" defaultValue="60" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="target_weight">Peso Op. (kg/lbs)</Label>
                    <Input id="target_weight" name="target_weight" placeholder="Ej: 60kg" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="video_url">Video YouTube (Opcional)</Label>
                <Input
                    id="video_url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                />
            </div>

            {/* Trainer Notes */}
            <div className="space-y-2">
                <Label htmlFor="trainer_notes">Nota para el cliente (Opcional)</Label>
                <Input
                    id="trainer_notes"
                    name="trainer_notes"
                    placeholder="Ej: Agarre supino, cuidar la postura..."
                    className="text-sm"
                />
            </div>

            {/* Biserie Toggle */}
            <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 rounded-xl px-4 py-3 border border-purple-100 dark:border-purple-800/40">
                <div>
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">Biserie / Superset</p>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400">Agrupar con otro ejercicio</p>
                </div>
                <div className="flex items-center gap-2">
                    {isBiserie && (
                        <select
                            value={supersetGroup}
                            onChange={(e) => setSupersetGroup(Number(e.target.value))}
                            className="text-xs bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 rounded-lg px-2 py-1.5 font-semibold text-purple-700 dark:text-purple-300"
                        >
                            {Array.from({ length: Math.max(nextSupersetGroup, 5) }, (_, i) => i + 1).map(n => (
                                <option key={n} value={n}>Grupo {n}</option>
                            ))}
                        </select>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsBiserie(!isBiserie)}
                        className={cn(
                            "relative w-12 h-7 rounded-full transition-colors",
                            isBiserie
                                ? "bg-purple-600"
                                : "bg-slate-300 dark:bg-slate-600"
                        )}
                    >
                        <div className={cn(
                            "absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform",
                            isBiserie ? "translate-x-5" : "translate-x-0.5"
                        )} />
                    </button>
                </div>
            </div>

            <Button className="w-full" type="submit" disabled={isPending || !exerciseName.trim()}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {isPending ? 'Añadiendo...' : 'Añadir Ejercicio'}
            </Button>
        </form>
    )
}
