import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function TrainerPublicPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const supabase = await createClient()

    const { data: trainer } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, bio, specialty')
        .eq('id', params.id)
        .eq('role', 'trainer')
        .single()

    if (!trainer) return notFound()

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

    const firstName = trainer.full_name?.split(' ')[0] || 'Entrenador'

    return (
        <div className="min-h-screen bg-[#f5f5f7] dark:bg-black font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display',sans-serif]">

            {/* ─── DESKTOP LAYOUT ─── */}
            <div className="hidden md:flex min-h-screen">

                {/* Left sidebar — sticky trainer card */}
                <aside className="w-[340px] shrink-0 sticky top-0 h-screen flex flex-col justify-between p-10 bg-white dark:bg-[#111] border-r border-black/[0.06] dark:border-white/[0.06]">
                    <div>
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/20 mb-6">
                            {trainer.avatar_url ? (
                                <img src={trainer.avatar_url} alt={trainer.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-black text-white tracking-tight">{initials}</span>
                            )}
                        </div>

                        <h1 className="text-[28px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-1">
                            {trainer.full_name}
                        </h1>
                        <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-6">
                            {(trainer as any).specialty || 'Personal Trainer'}
                        </p>

                        {(trainer as any).bio && (
                            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                                {(trainer as any).bio}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="space-y-3">
                            <StatRow value={clientCount || 0} label="Clientes activos" />
                            <StatRow value={workoutCount || 0} label="Rutinas diseñadas" />
                            <StatRow value={totalSessions || 0} label="Sesiones completadas" />
                        </div>
                    </div>

                    {/* Desktop CTA */}
                    <Link
                        href={`/join/${trainer.id}`}
                        className="flex items-center justify-center w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-black text-[15px] font-semibold rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-[0.98] shadow-lg shadow-gray-900/20 mt-8"
                    >
                        Comenzar ahora
                    </Link>
                </aside>

                {/* Right content */}
                <main className="flex-1 max-w-2xl mx-auto py-16 px-12 space-y-14">
                    <Section label="El método">
                        <div className="grid grid-cols-2 gap-4">
                            <FeatureCard
                                number="01"
                                title="Plan a tu medida"
                                desc="Rutinas diseñadas para tus objetivos y tu nivel, sin programas genéricos."
                            />
                            <FeatureCard
                                number="02"
                                title="Seguimiento real"
                                desc="Cada serie, cada peso, cada mejora registrada en tiempo real."
                            />
                            <FeatureCard
                                number="03"
                                title="Progresión inteligente"
                                desc="La app sugiere aumentar peso cuando estás listo. Sin estancamientos."
                            />
                            <FeatureCard
                                number="04"
                                title="Comunicación directa"
                                desc="Tu entrenador revisa tus notas post-sesión y te da feedback."
                            />
                        </div>
                    </Section>

                    <Section label="Resultados">
                        <div className="grid grid-cols-3 gap-4">
                            <ResultCard pct="94%" label="de clientes mejoran su marca en los primeros 30 días" />
                            <ResultCard pct="3×" label="más consistencia con seguimiento profesional" />
                            <ResultCard pct="100%" label="rutinas personalizadas, ninguna plantilla genérica" />
                        </div>
                    </Section>

                    <Section label="Cómo funciona">
                        <div className="space-y-0 rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06]">
                            <StepRow n="1" title="Regístrate" desc={`Crea tu cuenta y te vinculo yo directamente.`} />
                            <StepRow n="2" title="Recibe tu plan" desc="Tu rutina aparece en la app lista para usar." />
                            <StepRow n="3" title="Entrena y registra" desc="Registra cada set con peso y reps en segundos." />
                            <StepRow n="4" title="Progresa" desc="Tu entrenador ajusta el plan según tu evolución." />
                        </div>
                    </Section>
                </main>
            </div>

            {/* ─── MOBILE LAYOUT ─── */}
            <div className="md:hidden">

                {/* Hero */}
                <div className="relative bg-gray-900 pt-16 pb-24 px-6 text-center overflow-hidden">
                    {/* Gradient orbs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/25 rounded-full blur-[100px] -mr-40 -mt-20" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-600/20 rounded-full blur-[80px] -ml-30 -mb-20" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 mx-auto mb-5">
                            {trainer.avatar_url ? (
                                <img src={trainer.avatar_url} alt={trainer.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-black text-white">{initials}</span>
                            )}
                        </div>
                        <h1 className="text-[30px] font-bold text-white tracking-tight mb-1">{trainer.full_name}</h1>
                        <p className="text-sm font-medium text-violet-400">{(trainer as any).specialty || 'Personal Trainer'}</p>

                        {(trainer as any).bio && (
                            <p className="text-[13px] text-slate-400 mt-4 leading-relaxed max-w-xs mx-auto">
                                {(trainer as any).bio}
                            </p>
                        )}
                    </div>
                </div>

                {/* Stats bar */}
                <div className="bg-white dark:bg-[#1C1C1E] mx-4 -mt-6 rounded-[22px] shadow-xl shadow-black/10 border border-black/[0.05] dark:border-white/[0.05] relative z-10">
                    <div className="grid grid-cols-3 divide-x divide-black/[0.05] dark:divide-white/[0.05] py-5">
                        <MobileStat value={clientCount || 0} label="Clientes" />
                        <MobileStat value={workoutCount || 0} label="Rutinas" />
                        <MobileStat value={totalSessions || 0} label="Sesiones" />
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 pt-8 pb-32 space-y-10">

                    <MobileSection label="El método">
                        <div className="space-y-3">
                            <MobileFeatureCard number="01" title="Plan a tu medida" desc="Rutinas diseñadas para tus objetivos y tu nivel, sin programas genéricos." />
                            <MobileFeatureCard number="02" title="Seguimiento real" desc="Cada serie, cada peso, cada mejora registrada en tiempo real." />
                            <MobileFeatureCard number="03" title="Progresión inteligente" desc="La app sugiere aumentar peso cuando estás listo. Sin estancamientos." />
                            <MobileFeatureCard number="04" title="Comunicación directa" desc="Tu entrenador revisa tus notas y te da feedback personalizado." />
                        </div>
                    </MobileSection>

                    <MobileSection label="Resultados">
                        <div className="grid grid-cols-3 gap-3">
                            <MobileResultCard pct="94%" label="mejoran en 30 días" />
                            <MobileResultCard pct="3×" label="más consistencia" />
                            <MobileResultCard pct="100%" label="personalizado" />
                        </div>
                    </MobileSection>

                    <MobileSection label="Cómo funciona">
                        <div className="space-y-0 rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#1C1C1E]">
                            <StepRow n="1" title="Regístrate" desc="Crea tu cuenta y te vinculo yo directamente." />
                            <StepRow n="2" title="Recibe tu plan" desc="Tu rutina aparece lista para usar." />
                            <StepRow n="3" title="Entrena y registra" desc="Registra cada set en segundos." />
                            <StepRow n="4" title="Progresa" desc="Tu entrenador ajusta el plan con tu evolución." />
                        </div>
                    </MobileSection>
                </div>

                {/* Sticky CTA */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#f5f5f7]/90 dark:bg-black/90 backdrop-blur-xl border-t border-black/[0.06] dark:border-white/[0.06] z-50">
                    <Link
                        href={`/join/${trainer.id}`}
                        className="flex items-center justify-center w-full h-14 bg-gray-900 dark:bg-white text-white dark:text-black text-[16px] font-bold rounded-2xl active:scale-[0.98] transition-all shadow-xl shadow-black/20"
                    >
                        Entrenar con {firstName}
                    </Link>
                </div>
            </div>
        </div>
    )
}

// ─── Shared sub-components ───────────────────────────────────────────

function StatRow({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0">
            <span className="text-[13px] text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-[15px] font-bold text-gray-900 dark:text-white">{value}</span>
        </div>
    )
}

function MobileStat({ value, label }: { value: number; label: string }) {
    return (
        <div className="text-center">
            <p className="text-[22px] font-black text-gray-900 dark:text-white">{value}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
        </div>
    )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-5">{label}</p>
            {children}
        </div>
    )
}

function MobileSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4 px-1">{label}</p>
            {children}
        </div>
    )
}

function FeatureCard({ number, title, desc }: { number: string; title: string; desc: string }) {
    return (
        <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl border border-black/[0.05] dark:border-white/[0.05]">
            <p className="text-[11px] font-bold text-violet-500 tracking-widest mb-3">{number}</p>
            <p className="text-[15px] font-bold text-gray-900 dark:text-white mb-1.5">{title}</p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
        </div>
    )
}

function MobileFeatureCard({ number, title, desc }: { number: string; title: string; desc: string }) {
    return (
        <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-black/[0.05] dark:border-white/[0.05] flex gap-4 items-start">
            <span className="text-[11px] font-black text-violet-500 tracking-widest mt-0.5 shrink-0">{number}</span>
            <div>
                <p className="text-[14px] font-bold text-gray-900 dark:text-white mb-1">{title}</p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function ResultCard({ pct, label }: { pct: string; label: string }) {
    return (
        <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl border border-black/[0.05] dark:border-white/[0.05] text-center">
            <p className="text-[32px] font-black text-gray-900 dark:text-white leading-none mb-2">{pct}</p>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-snug">{label}</p>
        </div>
    )
}

function MobileResultCard({ pct, label }: { pct: string; label: string }) {
    return (
        <div className="bg-white dark:bg-[#1C1C1E] p-3 rounded-2xl border border-black/[0.05] dark:border-white/[0.05] text-center">
            <p className="text-[24px] font-black text-gray-900 dark:text-white leading-none mb-1">{pct}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">{label}</p>
        </div>
    )
}

function StepRow({ n, title, desc }: { n: string; title: string; desc: string }) {
    return (
        <div className="flex items-start gap-4 px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0 bg-white dark:bg-[#1C1C1E]">
            <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {n}
            </div>
            <div>
                <p className="text-[14px] font-semibold text-gray-900 dark:text-white">{title}</p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
