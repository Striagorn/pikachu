import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full h-full animate-in fade-in duration-500">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin relative z-10" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-center gap-1.5">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/50 rounded-full animate-pulse"></div>
            </div>
        </div>
    )
}
