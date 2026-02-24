import { getClientHistory } from '../actions'
import { Card, CardContent } from "@/components/ui/card"
import { WorkoutSummaryDialog } from "@/components/WorkoutSummaryDialog"
import { Calendar, CheckCircle2 } from "lucide-react"

export default async function HistoryPage() {
  const history = await getClientHistory()

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tu Historial</h1>
        <div className="text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {history.length} Entrenamientos
        </div>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Calendar className="h-10 w-10 mb-3 opacity-20" />
                    <p>Aún no tienes entrenamientos completados.</p>
                </CardContent>
            </Card>
        ) : (
            history.map((log: any) => (
                <WorkoutSummaryDialog key={log.id} log={log} />
            ))
        )}
      </div>
    </div>
  )
}
