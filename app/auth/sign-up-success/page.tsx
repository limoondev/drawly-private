import Link from "next/link"
import { Mail, Pencil, ArrowRight, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d25] to-[#080818]" />

      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-strong rounded-2xl p-8 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Vérifie tes emails !</h1>
          <p className="text-white/60 mb-6">
            Nous avons envoyé un email de vérification à ton adresse. Clique sur le lien dans l'email pour activer ton
            compte Drawly.
          </p>

          {/* Email preview card */}
          <div className="p-4 glass rounded-xl mb-6 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-white">Drawly</p>
                  <span className="text-xs text-white/30">à l'instant</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Bonjour ! Merci de ton inscription sur Drawly ! Pour confirmer ton adresse-mail, clique sur le lien
                  ci-dessous...
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-400">Compte créé</p>
                <p className="text-xs text-emerald-400/60">Ton compte a été enregistré avec succès</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-amber-400">En attente de vérification</p>
                <p className="text-xs text-amber-400/60">Vérifie ta boîte mail (et les spams)</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="p-3 bg-white/5 rounded-lg mb-6 text-left">
            <p className="text-xs text-white/40 mb-2">Tu n'as pas reçu l'email ?</p>
            <ul className="text-xs text-white/50 space-y-1">
              <li>• Vérifie ton dossier spam/courrier indésirable</li>
              <li>• Attends quelques minutes, l'email peut prendre du temps</li>
              <li>• Vérifie que ton adresse email est correcte</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full h-12 bg-gradient-to-r from-primary to-purple-500">
                Aller à la connexion
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full text-white/60 hover:text-white hover:bg-white/10">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
