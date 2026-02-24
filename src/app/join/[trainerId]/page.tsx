import { joinTrainer } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Check } from 'lucide-react'
import Link from 'next/link'

export default async function JoinPage(props: { params: Promise<{ trainerId: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  
  // Try to get user, but don't enforce it yet
  const { data: { user } } = await supabase.auth.getUser()

  // Get Trainer Details (Profiles are public read)
  const { data: trainer } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', params.trainerId)
    .single()

  if (!trainer) {
    return <div className="p-8 text-center text-red-500">Entrenador no encontrado.</div>
  }

  const nextUrl = `/join/${params.trainerId}`

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4 text-2xl overflow-hidden">
            {trainer.avatar_url ? <img src={trainer.avatar_url} className="w-full h-full object-cover" /> : (trainer.full_name?.[0] || 'T')}
          </div>
          <CardTitle>Invitación de {trainer.full_name || 'Entrenador'}</CardTitle>
          <CardDescription>
            Te ha invitado a unirte a su equipo de entrenamiento.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Al aceptar, {trainer.full_name} podrá asignarte rutinas y ver tu progreso.
            </p>
        </CardContent>
        <CardFooter>
            {user ? (
                <form action={joinTrainer} className="w-full">
                    <input type="hidden" name="trainerId" value={params.trainerId} />
                    <Button className="w-full" size="lg">
                        <Check className="mr-2 h-4 w-4" /> Aceptar Invitación
                    </Button>
                </form>
            ) : (
                <div className="w-full space-y-3">
                    <Link href={`/login?next=${encodeURIComponent(nextUrl)}&view=signup&role=client`} className="w-full">
                        <Button className="w-full" size="lg">
                            Crear Cuenta Nueva
                        </Button>
                    </Link>
                    <Link href={`/login?next=${encodeURIComponent(nextUrl)}&view=login`} className="w-full">
                        <Button variant="outline" className="w-full" size="sm">
                            Ya tengo cuenta
                        </Button>
                    </Link>
                </div>
            )}
        </CardFooter>
      </Card>
    </div>
  )
}
