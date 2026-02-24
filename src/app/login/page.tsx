import { login, signup } from './actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default async function LoginPage(props: { searchParams: Promise<{ message: string, next?: string, view?: string }> }) {
  const searchParams = await props.searchParams
  const next = searchParams.next || '/dashboard'
  const defaultTab = searchParams.view === 'signup' ? 'signup' : 'login'
  
  // Check if already logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
      return redirect(next)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bienvenido</CardTitle>
          <CardDescription>
            Plataforma integral para entrenadores y clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form action={login} className="space-y-4">
                <input type="hidden" name="next" value={next} />
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button className="w-full" type="submit">Entrar</Button>
                
                {searchParams?.message && (
                  <p className="mt-4 p-4 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded text-center text-sm">
                    {searchParams.message}
                  </p>
                )}
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form action={signup} className="space-y-4">
                <input type="hidden" name="next" value={next} />
                <div className="space-y-2">
                  <Label htmlFor="sign-email">Email</Label>
                  <Input id="sign-email" name="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sign-fullName">Nombre Completo</Label>
                  <Input id="sign-fullName" name="fullName" type="text" placeholder="Juan Pérez" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sign-password">Contraseña</Label>
                  <Input id="sign-password" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Soy...</Label>
                  <Select name="role" defaultValue="client">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Cliente (Quiero entrenar)</SelectItem>
                      <SelectItem value="trainer">Entrenador (Busco gestionar clientes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" type="submit">Crear Cuenta</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
