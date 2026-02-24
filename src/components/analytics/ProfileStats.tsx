import { Card, CardContent } from "@/components/ui/card"
import { Trophy, CalendarDays, Flame, Dumbbell } from "lucide-react"

export function ProfileStats({ totalWorkouts, memberSince }: { totalWorkouts: number, memberSince: string }) {
    const formattedDate = new Date(memberSince).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

    return (
        <div className="grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[22px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800/50 flex flex-col items-center justify-center gap-1">
                 <div className="text-pink-500 mb-1">
                    <Trophy className="w-6 h-6" />
                 </div>
                 <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{totalWorkouts}</span>
                 <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Workouts</span>
             </div>
             
             <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[22px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800/50 flex flex-col items-center justify-center gap-1">
                 <div className="text-orange-500 mb-1">
                    <Flame className="w-6 h-6" />
                 </div>
                 <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Activo</span>
                 <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Status</span>
             </div>
        </div>
    )
}
