import { getClientProgress } from '../../actions'
import { getClients } from '../../actions'
import { notFound } from 'next/navigation'
import { TrainerFeedbackPanel } from '@/components/TrainerFeedbackPanel'
import { ExerciseHistoryChart } from '@/components/ExerciseHistoryChart'

export default async function ClientProgressPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const clientId = params.id

    const clients = await getClients()
    const client = clients.find((c: any) => c.id === clientId)
    if (!client) return notFound()

    const { recentSessions, personalRecords } = await getClientProgress(clientId)

    const firstName = (client as any).full_name?.split(' ')[0] || 'Cliente'

    return (
        <div className="space-y-8 max-w-3xl pb-24">

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                    {(client as any).full_name?.slice(0, 1).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{(client as any).full_name}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {recentSessions.length} sesiones completadas en total
                    </p>
                </div>
            </div>

            {/* Personal Records */}
            {personalRecords.length > 0 && (
                <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Récords Personales (PR)</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {personalRecords.map((pr: any) => (
                            <div key={pr.exercise} className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-4 shadow-sm flex flex-col">
                                <div>
                                    <p className="text-[11px] text-amber-500 font-bold uppercase tracking-wider mb-1">🏆 PR {pr.exercise}</p>
                                    <p className="text-[24px] font-black text-gray-900 dark:text-white leading-none tracking-tight">
                                        {pr.weight}<span className="text-sm font-medium text-gray-400 ml-1">kg</span>
                                    </p>
                                </div>
                                {pr.history && pr.history.length > 1 && (
                                    <div className="mt-4 -mx-2 h-[120px]">
                                        <ExerciseHistoryChart data={pr.history} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Sessions */}
            <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Sesiones recientes</p>
                {recentSessions.length === 0 ? (
                    <div className="bg-white dark:bg-[#1C1C1E] border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
                        <p className="text-gray-400 text-sm">Ninguna sesión completada aún.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentSessions.map((session: any) => (
                            <div key={session.id} className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
                                {/* Session header */}
                                <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.04] dark:border-white/[0.04]">
                                    <div>
                                        <p className="text-[14px] font-semibold text-gray-900 dark:text-white">{session.workout?.name || 'Rutina'}</p>
                                        <p className="text-[12px] text-gray-500">{new Date(session.date).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {session.rpe && (
                                            <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                                                session.rpe >= 8 ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                                : session.rpe >= 6 ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                                                : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                            }`}>
                                                RPE {session.rpe}/10
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Client notes */}
                                {session.notes && (
                                    <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/30 border-b border-black/[0.04] dark:border-white/[0.04]">
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nota del cliente</p>
                                        <p className="text-[13px] text-gray-700 dark:text-gray-300 italic">"{session.notes}"</p>
                                    </div>
                                )}

                                {/* Trainer feedback panel */}
                                <TrainerFeedbackPanel
                                    logId={session.id}
                                    clientName={firstName}
                                    existingFeedback={session.trainer_feedback}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
