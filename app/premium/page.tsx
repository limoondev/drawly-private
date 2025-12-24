"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Pencil,
  Crown,
  Users,
  Palette,
  Shield,
  Star,
  Check,
  Lock,
  Rocket,
  CreditCard,
  Loader2,
  CheckCircle,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Footer } from "@/components/footer"

function CheckoutModal({
  plan,
  onClose,
  onSuccess,
}: {
  plan: { name: string; price: string; color: string }
  onClose: () => void
  onSuccess: () => void
}) {
  const [step, setStep] = useState<"form" | "processing" | "success">("form")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(" ") : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleSubmit = async () => {
    setError(null)

    // Validate card
    const cleanCard = cardNumber.replace(/\s/g, "")
    if (cleanCard.length !== 16) {
      setError("Numéro de carte invalide")
      return
    }

    const [month, year] = expiry.split("/")
    if (!month || !year || Number.parseInt(month) > 12 || Number.parseInt(month) < 1) {
      setError("Date d'expiration invalide")
      return
    }

    if (cvc.length < 3) {
      setError("CVC invalide")
      return
    }

    if (name.length < 2) {
      setError("Nom requis")
      return
    }

    setStep("processing")

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Update user premium status in Supabase
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from("profiles")
        .update({
          is_premium: true,
          premium_plan: plan.name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
    }

    setStep("success")
    setTimeout(() => {
      onSuccess()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md glass-strong rounded-2xl p-6 animate-in fade-in zoom-in-95">
        {step === "form" && (
          <>
            <div className="text-center mb-6">
              <div
                className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-4`}
              >
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              <p className="text-2xl font-bold text-white mt-2">
                {plan.price}€<span className="text-sm text-white/50">/mois</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Numéro de carte</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    className="h-12 pl-11 bg-white/5 border-white/10 text-white font-mono"
                    maxLength={19}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Expiration</label>
                  <Input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="h-12 bg-white/5 border-white/10 text-white font-mono"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">CVC</label>
                  <Input
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                    placeholder="123"
                    className="h-12 bg-white/5 border-white/10 text-white font-mono"
                    maxLength={4}
                    type="password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Nom sur la carte</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="h-12 bg-white/5 border-white/10 text-white"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button onClick={handleSubmit} className={`w-full h-12 bg-gradient-to-r ${plan.color}`}>
                Payer {plan.price}€
              </Button>

              <p className="text-xs text-white/30 text-center">Paiement sécurisé - Mode simulation</p>
            </div>

            <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
              ✕
            </button>
          </>
        )}

        {step === "processing" && (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Traitement en cours...</h2>
            <p className="text-sm text-white/50">Veuillez patienter</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Paiement réussi !</h2>
            <p className="text-sm text-white/50">Bienvenue dans {plan.name}</p>
            <Sparkles className="w-6 h-6 text-amber-400 mx-auto mt-4 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function PremiumPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [showCheckout, setShowCheckout] = useState<{ name: string; price: string; color: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("is_premium").eq("id", user.id).single()

        setIsPremium(profile?.is_premium || false)
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const handlePlanSelect = (plan: { name: string; price: string; color: string }) => {
    if (!user) {
      window.location.href = "/auth/sign-up"
      return
    }
    setShowCheckout(plan)
  }

  const plans = [
    {
      name: "Plan Astral",
      icon: Star,
      price: "4.99",
      period: "mois",
      color: "from-purple-500 to-pink-500",
      popular: true,
      features: [
        { text: "Serveurs privés jusqu'à 16 joueurs", included: true },
        { text: "Code de partie personnalisé", included: true },
        { text: "Choix du thème de partie", included: true },
        { text: "Définir les mots des autres", included: true },
        { text: "Expulser et modérer la partie", included: true },
        { text: "Badge Premium exclusif", included: true },
        { text: "Accès prioritaire aux nouveautés", included: true },
      ],
    },
    {
      name: "Plan Cosmic",
      icon: Rocket,
      price: "9.99",
      period: "mois",
      color: "from-cyan-500 to-blue-500",
      popular: false,
      comingSoon: true,
      features: [
        { text: "Tout le Plan Astral", included: true },
        { text: "Serveurs jusqu'à 32 joueurs", included: true },
        { text: "Mots personnalisés illimités", included: true },
        { text: "Statistiques avancées", included: true },
        { text: "Support prioritaire", included: true },
      ],
    },
    {
      name: "Plan Galaxy",
      icon: Crown,
      price: "19.99",
      period: "mois",
      color: "from-amber-500 to-orange-500",
      popular: false,
      comingSoon: true,
      features: [
        { text: "Tout le Plan Cosmic", included: true },
        { text: "API pour intégrations", included: true },
        { text: "White-label disponible", included: true },
        { text: "Support dédié 24/7", included: true },
      ],
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d25] to-[#080818] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d25] to-[#080818] flex flex-col">
        <header className="glass-strong border-b border-white/5 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary via-purple-500 to-secondary rounded-lg flex items-center justify-center">
                <Pencil className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Drawly</span>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-24 text-center flex-1">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Tu es déjà Premium !</h1>
          <p className="text-lg text-white/50 mb-8">
            Merci de soutenir Drawly. Profite de toutes tes fonctionnalités exclusives.
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500">Retour au jeu</Button>
          </Link>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d25] to-[#080818] flex flex-col">
      {/* Header */}
      <header className="glass-strong border-b border-white/5 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-purple-500 to-secondary rounded-lg flex items-center justify-center">
              <Pencil className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Drawly</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-12 flex-1">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 bg-amber-500/10 px-4 py-2 rounded-full mb-6 border border-amber-500/20">
            <Crown className="w-4 h-4" />
            Premium
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Passez au niveau{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              supérieur
            </span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Débloquez des fonctionnalités exclusives et profitez d'une expérience Drawly sans limites.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative glass rounded-2xl p-6 ${plan.popular ? "ring-2 ring-purple-500/50" : ""} ${plan.comingSoon ? "opacity-60" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Populaire
                  </span>
                </div>
              )}

              {plan.comingSoon && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-white/10 text-white/70 text-xs font-bold px-4 py-1 rounded-full border border-white/20">
                    Bientôt
                  </span>
                </div>
              )}

              <div
                className={`w-14 h-14 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center mb-4`}
              >
                <plan.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-white">{plan.price}€</span>
                <span className="text-sm text-white/50">/{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-white/30 shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? "text-white/70" : "text-white/30"}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() =>
                  !plan.comingSoon && handlePlanSelect({ name: plan.name, price: plan.price, color: plan.color })
                }
                className={`w-full ${
                  plan.comingSoon
                    ? "bg-white/10 text-white/50 cursor-not-allowed"
                    : `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`
                }`}
                disabled={plan.comingSoon}
              >
                {plan.comingSoon ? "Bientôt disponible" : "Choisir ce plan"}
              </Button>
            </div>
          ))}
        </div>

        {/* Features highlight */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Pourquoi passer Premium ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Plus de joueurs", desc: "Invitez jusqu'à 16 amis dans vos parties privées" },
              { icon: Palette, title: "Personnalisation", desc: "Créez vos propres codes et choisissez vos thèmes" },
              { icon: Shield, title: "Contrôle total", desc: "Modérez vos parties et expulsez les perturbateurs" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          plan={showCheckout}
          onClose={() => setShowCheckout(null)}
          onSuccess={() => {
            setShowCheckout(null)
            setIsPremium(true)
          }}
        />
      )}
    </div>
  )
}
