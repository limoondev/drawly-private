"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Pencil, Loader2, Mail, Lock, User, ArrowLeft, Sparkles, CheckCircle, XCircle } from "lucide-react"

const FORBIDDEN_WORDS = [
  "admin",
  "moderator",
  "staff",
  "drawly",
  "system",
  "support",
  "nazi",
  "hitler",
  "porn",
  "sex",
  "fuck",
  "shit",
  "bitch",
  "ass",
  "nigger",
  "faggot",
  "retard",
  "kill",
  "death",
  "suicide",
]

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateUsername = (value: string) => {
    setUsername(value)
    setUsernameError(null)

    if (value.length < 3) {
      setUsernameError("Le pseudo doit faire au moins 3 caracteres")
      return false
    }
    if (value.length > 16) {
      setUsernameError("Le pseudo ne doit pas depasser 16 caracteres")
      return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError("Seuls les lettres, chiffres et _ sont autorises")
      return false
    }
    const lowerValue = value.toLowerCase()
    for (const word of FORBIDDEN_WORDS) {
      if (lowerValue.includes(word)) {
        setUsernameError("Ce pseudo contient des mots interdits")
        return false
      }
    }
    return true
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateUsername(username)) return

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caracteres")
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          data: {
            username: username,
            display_name: username,
          },
        },
      })

      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
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
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au jeu
        </Link>

        <div className="glass-strong rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-xl blur-lg opacity-50" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-primary via-purple-500 to-secondary rounded-xl flex items-center justify-center">
                <Pencil className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Creer un compte</h1>
            <p className="text-sm text-white/50 mt-1">Rejoins la communaute Drawly</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Pseudo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="text"
                  placeholder="TonPseudo"
                  required
                  value={username}
                  onChange={(e) => validateUsername(e.target.value)}
                  className={`h-12 pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 ${usernameError ? "border-red-500/50" : ""}`}
                  maxLength={16}
                />
              </div>
              {usernameError && <p className="text-xs text-red-400 mt-1">{usernameError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="email"
                  placeholder="ton@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Mot de passe</label>
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
              disabled={isLoading || !!usernameError}
              className="w-full h-12 bg-gradient-to-r from-primary via-purple-500 to-primary text-white font-semibold"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Creer mon compte
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/50">
              Deja un compte ?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>

          <p className="mt-4 text-xs text-white/30 text-center">
            En creant un compte, tu acceptes nos regles du jeu et notre politique de confidentialite.
          </p>
        </div>
      </div>
    </div>
  )
}
