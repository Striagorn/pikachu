import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Zap, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-16 flex items-center justify-between border-b">
        <div className="font-bold text-xl flex items-center">
            <Zap className="mr-2 h-6 w-6 text-blue-600" />
            TrainerApp
        </div>
        <div className="flex gap-4">
            <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/login">
                <Button>Empezar Gratis</Button>
            </Link>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="py-20 px-6 text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 dark:text-slate-100">
                La plataforma moderna para <br className="hidden md:inline" /> 
                <span className="text-blue-600">Entrenadores Personales</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Gestiona clientes, crea rutinas y permite que tus alumnos registren su progreso en menos de 5 segundos. Sin hojas de cálculo, sin complicaciones.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                    <Button size="lg" className="px-8 text-lg h-12 w-full sm:w-auto">
                        Soy Entrenador <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
                 <Link href="/login">
                    <Button size="lg" variant="outline" className="px-8 text-lg h-12 w-full sm:w-auto">
                        Soy Cliente
                    </Button>
                </Link>
            </div>
        </section>

        <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8">
                <div className="p-6 bg-background rounded-xl shadow-sm border space-y-3">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-xl">Registro Ultra-Rápido</h3>
                    <p className="text-muted-foreground">
                        Tus clientes aman entrenar, no escribir en el móvil. Interfaz diseñada para registrar sets en segundos.
                    </p>
                </div>
                <div className="p-6 bg-background rounded-xl shadow-sm border space-y-3">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-xl">Gestión Centralizada</h3>
                    <p className="text-muted-foreground">
                        Todos tus clientes en un solo lugar. Asigna rutinas, monitorea progreso y mantén el control.
                    </p>
                </div>
                 <div className="p-6 bg-background rounded-xl shadow-sm border space-y-3">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-xl">Progreso Real</h3>
                    <p className="text-muted-foreground">
                        Visualiza la sobrecarga progresiva. Gráficos automáticos y seguimiento de historial.
                    </p>
                </div>
            </div>
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        © 2026 TrainerApp. Construido para potenciar tu gimnasio.
      </footer>
    </div>
  )
}
