import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Dumbbell, Users, Award, ArrowRight, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function TrainerPublicPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const supabase = await createClient()

    // Get trainer profile
    const { data: trainer } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .eq('id', params.id)
        .eq('role', 'trainer')
        .single()

    if (!trainer) return notFound()

    // Get stats
    const { count: clientCount } = await supabase
        .from('clients_trainers')
        .select('id', { count: 'exact', head: true })
        .eq('trainer_id', trainer.id)
        .eq('status', 'active')

    const { count: workoutCount } = await supabase
        .from('workouts')
        .select('id', { count: 'exact', head: true })
        .eq('trainer_id', trainer.id)

    const { count: totalSessions } = await supabase
        .from('workout_logs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')

    const initials = trainer.full_name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'T'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: `32px 32px`
                    }}
                />
                {/* Gradient orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] -mr-48 -mt-24" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/15 rounded-full blur-[100px] -ml-36 -mb-36" />

                <div className="relative z-10 max-w-lg mx-auto px-6 pt-16 pb-20 text-center">
                    {/* Avatar */}
                    <div className="mx-auto w-24 h-24 rounded-[28px] bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 ring-4 ring-white/10 mb-6">
                        {trainer.avatar_url ? (
                            <img
                                src={trainer.avatar_url}
                                alt={trainer.full_name}
                                className="w-full h-full object-cover rounded-[28px]"
                            />
                        ) : (
                            <span className="text-3xl font-black text-white tracking-tight">{initials}</span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        {trainer.full_name}
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Personal Trainer
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-8 mt-8">
                        <div className="text-center">
                            <p className="text-2xl font-black text-white">{clientCount || 0}</p>
                            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Clientes</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <p className="text-2xl font-black text-white">{workoutCount || 0}</p>
                            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Rutinas</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <p className="text-2xl font-black text-white">{totalSessions || 0}</p>
                            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Sesiones</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-lg mx-auto px-6 -mt-6 pb-12 space-y-6">
                {/* CTA Card */}
                <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] p-6 shadow-xl shadow-black/[0.06] border border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        Entrena conmigo
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                        Rutinas personalizadas, seguimiento de progreso y planes adaptados a tus objetivos.
                    </p>
                    <Link
                        href={`/join/${trainer.id}`}
                        className="flex items-center justify-center gap-2 w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-black font-semibold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98]"
                    >
                        Comenzar
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Features */}
                <div className="space-y-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-1">
                        Incluye
                    </p>
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[18px] border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
                        <div className="flex items-center gap-4 px-5 py-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
                                <Dumbbell className="h-5 w-5 text-violet-600" strokeWidth={1.8} />
                            </div>
                            <div>
                                <p className="text-[14px] font-semibold text-slate-900 dark:text-white">Rutinas personalizadas</p>
                                <p className="text-[12px] text-slate-500">Diseñadas para tus objetivos específicos</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 px-5 py-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                                <Award className="h-5 w-5 text-blue-600" strokeWidth={1.8} />
                            </div>
                            <div>
                                <p className="text-[14px] font-semibold text-slate-900 dark:text-white">Seguimiento de progreso</p>
                                <p className="text-[12px] text-slate-500">Registro de peso, series y repeticiones</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 px-5 py-4">
                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
                                <Users className="h-5 w-5 text-green-600" strokeWidth={1.8} />
                            </div>
                            <div>
                                <p className="text-[14px] font-semibold text-slate-900 dark:text-white">Acompañamiento continuo</p>
                                <p className="text-[12px] text-slate-500">Tu trainer te guía en cada sesión</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
