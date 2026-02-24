import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Activity, Users, Calendar, TrendingUp, CheckCircle2, Clock, Link2 } from 'lucide-react'
import { getTrainerStats, getTodayActivity } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'client') {
    const ClientView = (await import('./client-view')).default
    return <ClientView user={profile} />
  }

  const stats = await getTrainerStats()
  const todayActivity = await getTodayActivity()
  const firstName = profile?.full_name?.split(' ')[0] || 'Entrenador'

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Hero greeting */}
      <div>
        <p className="text-sm font-medium text-blue-500 mb-1">{greeting}</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          {firstName} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-[15px]">
          Aquí está tu resumen de hoy.
        </p>
      </div>

      {/* Stats */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">
          Resumen
        </p>
        <div className="bg-white dark:bg-white/[0.06] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] divide-y divide-black/[0.05] dark:divide-white/[0.05] shadow-sm shadow-black/[0.04]">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5 text-blue-500" strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-gray-500 dark:text-gray-400">Sesiones hoy</p>
              <p className="text-[15px] font-semibold text-gray-900 dark:text-white">
                {stats?.sessionsToday || 0} entrenamientos programados
              </p>
            </div>
            <span className="text-2xl font-bold text-blue-500">{stats?.sessionsToday || 0}</span>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-amber-500" strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-gray-500 dark:text-gray-400">Planes por vencer</p>
              <p className="text-[15px] font-semibold text-gray-900 dark:text-white">
                En los próximos 7 días
              </p>
            </div>
            <span className="text-2xl font-bold text-amber-500">{stats?.expiringPlans || 0}</span>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-green-500" strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-gray-500 dark:text-gray-400">Clientes totales</p>
              <p className="text-[15px] font-semibold text-gray-900 dark:text-white">
                Activos en plataforma
              </p>
            </div>
            <span className="text-2xl font-bold text-green-500">{stats?.activeClients || 0}</span>
          </div>
        </div>
      </div>

      {/* ═══ TODAY'S ACTIVITY ═══ */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">
          Actividad de Hoy
        </p>
        {todayActivity.length > 0 ? (
          <div className="bg-white dark:bg-white/[0.06] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] divide-y divide-black/[0.04] dark:divide-white/[0.04] shadow-sm shadow-black/[0.04]">
            {todayActivity.slice(0, 8).map((activity: any) => (
              <div key={activity.id} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  activity.status === 'completed'
                    ? 'bg-green-100 dark:bg-green-500/20'
                    : 'bg-blue-100 dark:bg-blue-500/20'
                }`}>
                  {activity.status === 'completed'
                    ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                    : <Clock className="h-4 w-4 text-blue-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-900 dark:text-white truncate">
                    {activity.clientName || 'Cliente'}
                  </p>
                  <p className="text-[12px] text-gray-500 truncate">{activity.workoutName}</p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  activity.status === 'completed'
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {activity.status === 'completed' ? 'Completado' : 'En progreso'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-white/[0.06] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] p-6 text-center shadow-sm">
            <p className="text-[14px] text-gray-400">Ningún cliente ha entrenado hoy aún</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">
          Acciones rápidas
        </p>
        <div className="grid grid-cols-2 gap-3">
          <a href="/dashboard/clients" className="bg-white dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-[0.98] shadow-sm shadow-black/[0.04] group">
            <Users className="h-6 w-6 text-blue-500 mb-3" strokeWidth={1.8} />
            <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Ver clientes</p>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Gestionar alumnos</p>
          </a>
          <a href="/dashboard/workouts" className="bg-white dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-[0.98] shadow-sm shadow-black/[0.04] group">
            <TrendingUp className="h-6 w-6 text-blue-500 mb-3" strokeWidth={1.8} />
            <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Rutinas</p>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Crear y editar</p>
          </a>
        </div>
      </div>
      {/* Share your landing page */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">
          Tu página pública
        </p>
        <div className="bg-white dark:bg-white/[0.06] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] p-5 shadow-sm shadow-black/[0.04]">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
              <Link2 className="h-5 w-5 text-violet-500" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Comparte tu perfil</p>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Nuevos clientes pueden ver tus rutinas y contactarte</p>
            </div>
          </div>
          <a
            href={`/trainer/${user.id}`}
            target="_blank"
            className="block w-full text-center py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-[13px] font-medium text-violet-600 dark:text-violet-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors truncate"
          >
            /trainer/{user.id}
          </a>
        </div>
      </div>
    </div>
  )
}
