import { getProfileStats, getConsistencyData, getStrengthProgress } from './actions'
import { ProfileStats } from '@/components/analytics/ProfileStats'
import { ConsistencyChart } from '@/components/analytics/ConsistencyChart'
import { StrengthChart } from '@/components/analytics/StrengthChart'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DeleteAccountButton } from "@/components/DeleteAccountButton"

export default async function ProfilePage() {
    const { client, totalWorkouts, memberSince } = await getProfileStats()
    const consistencyData = await getConsistencyData()
    // Fetch stats for a few common exercises (hardcoded for MVP demo)
    const deadliftData = await getStrengthProgress('Peso Muerto') // Adjust names to match DB
    const squatData = await getStrengthProgress('Sentadilla')
    
    // Fallback if no specific exercise found, maybe just show whatever we have?
    // For MVP, we'll try these.

    return (
        <div className="pb-32 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50/50 dark:bg-black min-h-screen">
            
            {/* Apple-style Large Header */}
            <div className="pt-14 px-6 pb-2">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-[34px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                        Perfil
                    </h1>
                     <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800">
                        <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${client?.first_name || 'User'}`} />
                        <AvatarFallback>{client?.first_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                </div>
                
                {/* Profile Card (Inset Grouped) */}
                <div className="flex flex-col items-center bg-white dark:bg-[#1C1C1E] rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800/50">
                    <div className="relative mb-4">
                         <Avatar className="h-24 w-24 border-4 border-slate-50 dark:border-[#1C1C1E] shadow-xl">
                            <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${client?.first_name || 'User'}`} />
                            <AvatarFallback>{client?.first_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <Badge variant="secondary" className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white border-2 border-white dark:border-[#1C1C1E] font-medium text-[10px] tracking-wide uppercase">
                            PRO
                        </Badge>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{client?.first_name} {client?.last_name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Miembro desde {new Date(memberSince).getFullYear()}</p>
                </div>
            </div>

            {/* Key Stats (Horizontal Scroll if needed, or Grid) */}
            <div className="px-5">
                <ProfileStats totalWorkouts={totalWorkouts} memberSince={memberSince} />
            </div>

            {/* Charts Section - Inset Grouped Style */}
            <div className="px-5 space-y-6">
                
                {/* Consistency Section */}
                <div className="space-y-3">
                    <h3 className="text-[20px] font-semibold text-slate-900 dark:text-white px-1">Consistencia</h3>
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-800/50">
                        <ConsistencyChart data={consistencyData} />
                    </div>
                </div>

                {/* Strength Section */}
                <div className="space-y-3">
                    <h3 className="text-[20px] font-semibold text-slate-900 dark:text-white px-1">Progreso de Fuerza</h3>
                    <div className="space-y-4">
                         {squatData.length > 0 && (
                            <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-800/50">
                                <StrengthChart data={squatData} exerciseName="Sentadilla" />
                            </div>
                         )}
                         
                         {deadliftData.length > 0 && (
                            <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-800/50">
                                <StrengthChart data={deadliftData} exerciseName="Peso Muerto" />
                            </div>
                         )}

                         {/* Fallback msg if empty */}
                         {squatData.length === 0 && deadliftData.length === 0 && (
                             <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] p-8 text-center border-dashed border-2 border-slate-200 dark:border-slate-800">
                                 <p className="text-sm text-slate-400 font-medium">
                                     Registra tus entrenamientos para desbloquear los gráficos de fuerza.
                                 </p>
                             </div>
                         )}
                    </div>
                </div>
            </div>

            {/* ═══ DANGER ZONE ═══ */}
            <div className="px-5 pt-6">
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] overflow-hidden border border-red-100 dark:border-red-900/30 shadow-sm">
                    <div className="px-4 py-3 bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20">
                        <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Zona de Peligro</p>
                    </div>
                    <DeleteAccountButton />
                </div>
            </div>
        </div>
    )
}
