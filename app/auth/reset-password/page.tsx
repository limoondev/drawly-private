"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Lock, ArrowLeft, CheckCircle, XCircle, KeyRound } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères")
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d25] to-[#080818]" />
        <div className="relative z-10 w-full max-w-md">
          <div className="glass-strong rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Mot de passe modifié !</h1>
            <p className="text-white/60 mb-6">
              Ton mot de passe a été mis à jour avec succès. Tu vas être redirigé vers la page de connexion.
            </p>
            <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d25] to-[#080818]" />
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
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>

        <div className="glass-strong rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-xl blur-lg opacity-50" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-primary via-purple-500 to-secondary rounded-xl flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Nouveau mot de passe</h1>
            <p className="text-sm text-white/50 mt-1">Entre ton nouveau mot de passe</p>
          </div>

          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`h-12 pl-11 pr-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 ${passwordsDontMatch ? "border-red-500/50" : passwordsMatch ? "border-emerald-500/50" : ""}`}
                />
                {passwordsMatch && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                )}
                {passwordsDontMatch && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isLoading || passwordsDontMatch}
              className="w-full h-12 bg-gradient-to-r from-primary via-purple-500 to-primary text-white font-semibold"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Changer le mot de passe"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
