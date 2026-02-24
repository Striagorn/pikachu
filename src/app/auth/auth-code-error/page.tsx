import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <AlertTriangle className="h-10 w-10 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Error de Autenticación</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Hubo un problema al verificar tu cuenta. Esto puede pasar si el enlace expiró o ya fue usado.
      </p>
      <div className="flex gap-4">
        <Link href="/login">
            <Button>Volver al Inicio de Sesión</Button>
        </Link>
      </div>
    </div>
  )
}
