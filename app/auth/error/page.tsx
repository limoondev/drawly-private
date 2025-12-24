"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, RefreshCw, Mail, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; description?: string }>
}) {
  const params = await searchParams

  const errorMessages: Record<string, { title: string; message: string; action?: string }> = {
    could_not_verify_email: {
      title: "Email non verifie",
      message:
        "Impossible de verifier ton email. Le lien a peut-etre expire ou a deja ete utilise. Essaie de te reconnecter ou de demander un nouveau lien.",
      action: "resend",
    },
    invalid_token: {
      title: "Token invalide",
      message: "Le token de verification est invalide ou a expire. Reconnecte-toi pour obtenir un nouveau lien.",
      action: "login",
    },
    exchange_failed: {
      title: "Erreur d'echange",
      message: "Une erreur est survenue lors de la verification. Essaie de te reconnecter.",
      action: "login",
    },
    no_code: {
      title: "Code manquant",
      message: "Le lien de verification est incomplet. Clique sur le lien depuis ton email ou demande un nouveau lien.",
      action: "resend",
    },
    access_denied: {
      title: "Acces refuse",
      message: "L'acces a ete refuse. Tu as peut-etre annule la connexion ou le lien est invalide.",
      action: "login",
    },
    server_error: {
      title: "Erreur serveur",
      message: "Une erreur serveur est survenue. Reessaie dans quelques instants.",
      action: "retry",
    },
    default: {
      title: "Erreur inattendue",
      message: "Une erreur inattendue s'est produite. Contacte le support si le probleme persiste.",
      action: "login",
    },
  }

  const errorInfo = errorMessages[params.error || "default"] || errorMessages.default

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d25] to-[#080818]" />
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
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
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour a l'accueil
        </Link>

        <div className="glass-strong rounded-2xl p-8 text-center">
          {/* Error Icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-lg opacity-50" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">{errorInfo.title}</h1>
          <p className="text-white/60 mb-6 leading-relaxed">{errorInfo.message}</p>

          {/* Error details */}
          {params.error && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-6">
              <p className="text-xs text-white/30 font-mono">Code: {params.error}</p>
              {params.description && (
                <p className="text-xs text-white/40 mt-1 break-words">{decodeURIComponent(params.description)}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {errorInfo.action === "resend" && (
              <Link href="/auth/sign-up">
                <Button className="w-full h-12 bg-gradient-to-r from-primary to-purple-500">
                  <Mail className="w-4 h-4 mr-2" />
                  Demander un nouveau lien
                </Button>
              </Link>
            )}

            {errorInfo.action === "retry" && (
              <Button
                onClick={() => window.location.reload()}
                className="w-full h-12 bg-gradient-to-r from-primary to-purple-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reessayer
              </Button>
            )}

            <Link href="/auth/login">
              <Button
                variant={errorInfo.action === "login" ? "default" : "outline"}
                className={
                  errorInfo.action === "login"
                    ? "w-full h-12 bg-gradient-to-r from-primary to-purple-500"
                    : "w-full h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                }
              >
                {errorInfo.action === "login" ? "Se connecter" : "Retour a la connexion"}
              </Button>
            </Link>

            <Link href="/">
              <Button variant="ghost" className="w-full text-white/60 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au jeu
              </Button>
            </Link>
          </div>

          {/* Help link */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-white/40 flex items-center justify-center gap-2">
              <HelpCircle className="w-3 h-3" />
              Besoin d'aide ?{" "}
              <a href="mailto:support@drawly.app" className="text-primary hover:underline">
                Contacte le support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
