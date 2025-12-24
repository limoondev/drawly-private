import Link from "next/link"
import { ShieldX, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function BannedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const { data: profile } = await supabase.from("profiles").select("ban_reason, banned_at").eq("id", user.id).single()

  if (!profile?.banned_at) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0505] via-[#250a0a] to-[#180303]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-strong rounded-2xl p-8 text-center border border-red-500/20">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-lg opacity-50" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <ShieldX className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Compte suspendu</h1>
          <p className="text-white/60 mb-4">Ton compte a ete suspendu pour violation des regles de Drawly.</p>

          {profile.ban_reason && (
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 mb-6">
              <p className="text-sm font-medium text-red-400 mb-1">Raison :</p>
              <p className="text-sm text-white/70">{profile.ban_reason}</p>
            </div>
          )}

          <p className="text-xs text-white/40 mb-6">
            Banni le {new Date(profile.banned_at).toLocaleDateString("fr-FR")}
          </p>

          <div className="space-y-3">
            <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10 bg-transparent">
              <Mail className="w-4 h-4 mr-2" />
              Contacter le support
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full text-white/40 hover:text-white/60">
                Retour a l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
