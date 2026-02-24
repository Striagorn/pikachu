import { getClientTodaysWorkout, getClientHistory, getClientSubscription, getWeeklyProgress, getWeeklyHistory, getAvailableWorkouts, getClientWeekSchedule, getStreak } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayCircle, CheckCircle2, Calendar, TrendingUp, AlertCircle, Trophy, BarChart3, Flame, Zap } from "lucide-react"
import Link from 'next/link'
import { WorkoutSummaryDialog } from "@/components/WorkoutSummaryDialog"
import { RoutinePicker } from "@/components/RoutinePicker"

export default async function ClientView({ user }: { user: any }) {
  const todaysWorkout: any = await getClientTodaysWorkout()
  const history = await getClientHistory()
  const weeklyProgress = await getWeeklyProgress()
  const weeklyHistory = await getWeeklyHistory()
  const subscription = await getClientSubscription()
  const availableWorkouts = await getAvailableWorkouts()
  const weekSchedule = await getClientWeekSchedule()
  const streak = await getStreak()
  const todayDow = new Date().getDay()

  const progressPercentage = Math.min((weeklyProgress.count / weeklyProgress.goal) * 100, 100)
  const firstName = user.full_name?.split(' ')[0] || 'Atleta'

  // Time-aware greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  // Streak calculation from weekly history
  const currentWeekCount = weeklyProgress.count
  const totalCompleted = history.length

  return (
    <div className="space-y-6 pb-32">
      {/* ═══ HERO BANNER ═══ */}
      <div className="relative overflow-hidden rounded-[28px] mx-2 bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 dark:from-violet-950/40 dark:via-purple-900/30 dark:to-indigo-950/40 p-6 shadow-lg shadow-purple-200/30 dark:shadow-purple-900/20 border border-purple-100/60 dark:border-purple-800/30">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-300/30 dark:bg-purple-500/15 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-300/25 dark:bg-blue-500/10 rounded-full blur-3xl -ml-8 -mb-8 pointer-events-none" />

        <div className="relative z-10">
          {/* Greeting */}
          <p className="text-purple-500 dark:text-purple-400 text-sm font-medium mb-1">{greeting},</p>
          <h1 className="text-[32px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            {firstName}
          </h1>

          {/* Stats row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Streak pill */}
            {streak.streak >= 2 && (
              <div className="flex items-center gap-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-orange-200/60 dark:border-orange-500/20 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-sm shadow-orange-400/30">
                  <Flame className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 dark:text-white/50 font-medium">Racha</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{streak.streak} días</p>
                </div>
              </div>
            )}

            {/* Weekly progress pill */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-purple-100/50 dark:border-white/[0.06] shadow-sm">
              <div className="relative w-9 h-9">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none"
                    stroke="url(#progress-gradient)" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercentage * 0.974} 100`}
                  />
                  <defs>
                    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-purple-700 dark:text-white">
                  {weeklyProgress.count}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 dark:text-white/50 font-medium">Semanal</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{weeklyProgress.count}/{weeklyProgress.goal}</p>
              </div>
            </div>

            {/* Credits pill */}
            {subscription ? (
              <div className="flex items-center gap-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-purple-100/50 dark:border-white/[0.06] shadow-sm">
                <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 dark:text-white/50 font-medium">Créditos</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{subscription.credits_remaining}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-purple-100/50 dark:border-white/[0.06] shadow-sm">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-slate-500 dark:text-slate-400" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 dark:text-white/50 font-medium">Total</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{streak.total}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MINI WEEK PREVIEW ═══ */}
      {weekSchedule.length > 0 && (
          <div className="px-4">
              <div className="flex items-center justify-center gap-1.5">
                  {['D','L','M','X','J','V','S'].map((label, i) => {
                      const hasWorkout = weekSchedule.some((s: any) => s.day_of_week === i)
                      const isToday = i === todayDow
                      return (
                          <div key={i} className="flex flex-col items-center gap-1">
                              <span className={`text-[9px] font-bold uppercase ${isToday ? 'text-primary' : 'text-slate-400'}`}>{label}</span>
                              <div className={`w-8 h-1.5 rounded-full transition-all ${
                                  hasWorkout && isToday ? 'bg-primary shadow-sm shadow-primary/30' :
                                  hasWorkout ? 'bg-violet-300 dark:bg-violet-700' :
                                  'bg-slate-100 dark:bg-slate-800'
                              }`} />
                          </div>
                      )
                  })}
              </div>
          </div>
      )}

      {/* ═══ NEXT WORKOUT CARD ═══ */}
      <div className="px-2">
        {todaysWorkout ? (
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                <div className="flex items-start justify-between mb-4 pl-2">
                    <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">
                            {todaysWorkout.status === 'scheduled' ? 'Programada para Hoy' : 'Siguiente Sesión'}
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                            {Array.isArray(todaysWorkout.workout) ? todaysWorkout.workout[0]?.name : todaysWorkout.workout?.name}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            {Array.isArray(todaysWorkout.workout) 
                                ? (Array.isArray(todaysWorkout.workout[0]?.trainer) ? todaysWorkout.workout[0]?.trainer[0]?.full_name : todaysWorkout.workout[0]?.trainer?.full_name) 
                                : (Array.isArray(todaysWorkout.workout?.trainer) ? todaysWorkout.workout?.trainer[0]?.full_name : todaysWorkout.workout?.trainer?.full_name)}
                        </p>
                    </div>
                    <div className={`p-3 rounded-full ${todaysWorkout.status === 'scheduled' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' : 'bg-primary/10 text-primary'}`}>
                        {todaysWorkout.status === 'scheduled' ? <Calendar className="w-8 h-8" /> : <PlayCircle className="w-8 h-8" />}
                    </div>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 pl-2 line-clamp-2">
                     {Array.isArray(todaysWorkout.workout) ? todaysWorkout.workout[0]?.description : todaysWorkout.workout?.description}
                </p>

                {todaysWorkout.id ? (
                    <Link href={`/dashboard/workout/${todaysWorkout.id}`} className="block pl-2">
                        <Button className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]">
                            Continuar Rutina
                        </Button>
                    </Link>
                ) : (
                    <div className="pl-2">
                        <form action={async () => {
                            'use server'
                            const { startWorkoutSession } = await import('./actions')
                            const workoutId = Array.isArray(todaysWorkout.workout) ? todaysWorkout.workout[0]?.id : todaysWorkout.workout?.id
                            if (workoutId) await startWorkoutSession(workoutId)
                        }}>
                            <Button type="submit" className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]">
                                Comenzar Rutina
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        ) : (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[24px] border-dashed border-2 border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">¡Día libre!</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-[200px]">
                    No tienes rutinas programadas hoy. ¡Disfruta tu descanso!
                </p>
            </div>
        )}
      </div>

      {/* ═══ ROUTINE PICKER — right after the main card ═══ */}
      <div className="px-2">
          <RoutinePicker workouts={availableWorkouts} />
      </div>

      {/* ═══ WEEKLY PROGRESS ═══ */}
      <div className="px-2">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-800/50">
             <div className="flex items-center justify-between mb-3">
                 <h3 className="text-base font-semibold text-slate-900 dark:text-white">Progreso Semanal</h3>
                 <span className="text-xs font-medium text-slate-400">{weeklyProgress.count} de {weeklyProgress.goal} sesiones</span>
             </div>
             
             {/* Simple Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden mb-4">
                <div 
                    className="bg-primary h-full rounded-full relative" 
                    style={{ width: `${progressPercentage}%` }}
                />
              </div>

               {/* Weekly History Dots */}
               {weeklyHistory.length > 0 && (
                 <div className="flex justify-between items-center px-1">
                    {weeklyHistory.map((week: any, index: number) => {
                        const isSuccess = week.count >= (week.goal || 3)
                        const isCurrent = index === weeklyHistory.length - 1
                        let label = isCurrent ? "Esta" : "Sem"
                        
                        return (
                            <div key={week.week} className="flex flex-col items-center gap-1.5">
                                 <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                     isSuccess 
                                     ? 'bg-green-500 text-white shadow-md shadow-green-500/20' 
                                     : isCurrent 
                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md' 
                                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                 }`}>
                                     {week.count}
                                 </div>
                                 <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
                            </div>
                        )
                    })}
                 </div>
              )}
          </div>
      </div>

      {/* ═══ SUBSCRIPTION BANNER ═══ */}
      {subscription && (
           <div className="px-2">
                <div className="bg-slate-900 dark:bg-slate-800 rounded-[22px] p-5 shadow-lg flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 bg-white/5 rounded-full blur-2xl -mr-4 -mt-4 pointer-events-none"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Plan Activo</p>
                        <h3 className="text-white font-bold text-lg">{subscription.plan?.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">Vence: {new Date(subscription.end_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right relative z-10">
                        <div className="text-2xl font-bold text-white">{subscription.credits_remaining}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Créditos</div>
                    </div>
                </div>
           </div>
      )}

      {/* ═══ HISTORY ═══ */}
      <div className="px-2">
        <h3 className="font-semibold text-xl text-slate-900 dark:text-white px-2 mb-3">Historial Reciente</h3>
        {history.length > 0 ? (
            <div className="space-y-3">
                {history.map((log: any) => (
                     <div key={log.id} className="bg-white dark:bg-[#1C1C1E] rounded-[18px] p-4 shadow-sm border border-slate-100 dark:border-slate-800/50 flex items-center justify-between active:scale-[0.99] transition-transform">
                          <div className="flex items-center gap-3">
                              <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2.5 rounded-full">
                                  <Trophy className="w-5 h-5" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{log.workout?.name || 'Entrenamiento'}</h4>
                                  <p className="text-xs text-slate-500">{new Date(log.finished_at).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <span className="text-sm font-bold text-slate-900 dark:text-white block">{log.duration_minutes || 45} min</span>
                          </div>
                     </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
                Sin historial aún.
            </div>
        )}
      </div>
    </div>
  )
}
