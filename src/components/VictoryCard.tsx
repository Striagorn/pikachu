import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Share2 } from "lucide-react"

interface VictoryCardProps {
    clientName: string
    totalWorkouts: number
    lastWorkoutDate: string | null
}

export function VictoryCard({ clientName, totalWorkouts, lastWorkoutDate }: VictoryCardProps) {
    return (
        <Card className="w-full max-w-sm bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 border-yellow-200 dark:border-yellow-700 shadow-lg">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-2">
                    <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-xl font-bold text-yellow-800 dark:text-yellow-100">¡Imparable!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <div>
                    <p className="text-muted-foreground text-sm">Felicitaciones a</p>
                    <p className="text-lg font-semibold">{clientName}</p>
                </div>
                
                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{totalWorkouts}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Entrenamientos Completados</p>
                </div>

                <p className="text-xs text-muted-foreground italic">
                    "La constancia es la clave del éxito."
                </p>
            </CardContent>
            {/* 
            <CardFooter className="justify-center pt-0 pb-6">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                    <Share2 className="w-4 h-4 mr-2" /> Compartir Logro
                </Button>
            </CardFooter>
            */}
        </Card>
    )
}
