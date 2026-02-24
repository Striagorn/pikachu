'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { History, Calendar, TrendingUp } from "lucide-react"
import { getExerciseHistory } from "../app/dashboard/workout/[id]/actions"
import { ExerciseHistoryChart } from "./ExerciseHistoryChart"

interface ExerciseHistorySheetProps {
    exerciseName: string
}

export function ExerciseHistorySheet({ exerciseName }: ExerciseHistorySheetProps) {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (isOpen && history.length === 0) {
            setLoading(true)
            getExerciseHistory(exerciseName)
                .then(data => setHistory(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false))
        }
    }, [isOpen, exerciseName])

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-100 text-purple-600 hover:text-purple-700">
                    <History className="w-4 h-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-[20px] px-0 bg-slate-50 dark:bg-black">
                <SheetHeader className="px-6 mb-2 pt-4">
                    <div className="flex items-center justify-between">
                         <div>
                            <SheetTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Historial
                            </SheetTitle>
                            <p className="text-sm text-slate-500 font-medium capitalize mt-1">{exerciseName}</p>
                         </div>
                    </div>
                </SheetHeader>

                <div className="overflow-y-auto h-full pb-20 px-4 space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center text-slate-400 py-20 flex flex-col items-center gap-2">
                            <History className="w-10 h-10 opacity-20" />
                            <p>No hay historial previo.</p>
                        </div>
                    ) : (
                        <>
                             {/* 1. Key Stats Cards */}
                             <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                                        <TrendingUp className="w-3 h-3" /> Récord (PR)
                                    </div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                                        {Math.max(...history.flatMap((s: any) => s.sets.map((set: any) => Number(set.weight))))}
                                        <span className="text-xs font-medium text-slate-400 ml-1">kg</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium mt-1">Mejor peso levantado</div>
                                </div>
                                <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        <Calendar className="w-3 h-3" /> Última Vez
                                    </div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                                        {Math.max(...history[0].sets.map((s: any) => Number(s.weight)))}
                                        <span className="text-xs font-medium text-slate-400 ml-1">kg</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium mt-1">{history[0].date}</div>
                                </div>
                             </div>

                             {/* Segmented Control */}
                             <div className="bg-slate-200 dark:bg-slate-800/50 p-1 rounded-lg flex relative">
                                 <button 
                                    onClick={() => setViewMode('list')}
                                    className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                 >
                                     Lista
                                 </button>
                                 <button 
                                    onClick={() => setViewMode('chart')}
                                    className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${viewMode === 'chart' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                 >
                                     Gráfico
                                 </button>
                             </div>

                             {viewMode === 'chart' ? (
                                 /* 2. Mini Chart */
                                 <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 min-h-[250px] flex flex-col">
                                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Progreso (Peso Máx)</h4>
                                     <div className="flex-1 w-full min-h-[200px]">
                                        <ExerciseHistoryChart data={history} />
                                     </div>
                                 </div>
                             ) : (
                                 /* 3. Detailed List */
                                 <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white px-2">Sesiones Anteriores</h4>
                                    {history.map((session: any, i) => (
                                        <div key={i} className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                                            <div className="bg-slate-50/50 dark:bg-slate-800/30 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500">{session.date}</span>
                                                <span className="text-[10px] font-medium text-slate-400">{session.sets.length} series</span>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                {session.sets.sort((a: any, b: any) => a.set_number - b.set_number).map((set: any) => (
                                                    <div key={set.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full">
                                                                {set.set_number}
                                                            </span>
                                                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                                                                {set.weight}<span className="text-xs font-normal text-slate-400 ml-0.5">kg</span>
                                                            </span>
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                            {set.reps}<span className="text-xs text-slate-400 ml-1">reps</span>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                 </div>
                             )}
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
