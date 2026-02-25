import { Loader2, ArrowLeft } from "lucide-react"

export default function Loading() {
    return (
        <div className="space-y-6 pb-20 max-w-lg mx-auto w-full animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <ArrowLeft className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex-1">
                    <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse mb-2"></div>
                    <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800/50 rounded-full animate-pulse"></div>
                </div>
            </div>

            {/* Exercise Card Skeletons */}
            {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.04] p-5 shadow-sm shadow-blue-500/5 h-[340px] flex flex-col">
                    <div className="h-7 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse mb-6"></div>
                    
                    <div className="flex-1 flex flex-col justify-center items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                            <Loader2 className="h-6 w-6 text-blue-500 animate-spin relative z-10" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
