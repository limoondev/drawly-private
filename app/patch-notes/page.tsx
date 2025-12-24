"use client"

import { ArrowLeft, Pencil, Sparkles, Bug, Zap, Plus, Star, Shield, Globe, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Footer } from "@/components/footer"

const patchNotes = [
  {
    version: "5.3.0",
    date: "24 Decembre 2024",
    isLatest: true,
    changes: [
      { type: "new", text: "Nouvelle page d'accueil avec sections de contenu" },
      { type: "new", text: "Footer complet avec liens et reseaux sociaux" },
      { type: "new", text: "Pages Terms of Service et Privacy Policy" },
      { type: "new", text: "Navigation centree dans le header" },
      { type: "improve", text: "Modal de creation de partie agrandi" },
      { type: "improve", text: "Meilleure organisation du contenu" },
      { type: "fix", text: "Correction du centrage des elements" },
    ],
  },
  {
    version: "5.2.0",
    date: "22 Decembre 2024",
    changes: [
      { type: "new", text: "Systeme de themes dynamiques complet" },
      { type: "new", text: "Provider de configuration globale" },
      { type: "new", text: "Status du serveur en temps reel" },
      { type: "improve", text: "Amelioration de la connexion au backend" },
      { type: "improve", text: "Optimisation des performances" },
      { type: "fix", text: "Correction des erreurs de build SSR" },
    ],
  },
  {
    version: "5.1.0",
    date: "20 Decembre 2024",
    changes: [
      { type: "new", text: "Backend HTTPS avec auto-configuration" },
      { type: "new", text: "Rate limiting et protection DDoS" },
      { type: "new", text: "Validation des origines WebSocket" },
      { type: "improve", text: "Documentation de deploiement amelioree" },
      { type: "improve", text: "Securite renforcee du serveur" },
      { type: "fix", text: "Correction des timeouts de connexion" },
    ],
  },
  {
    version: "5.0.0",
    date: "18 Decembre 2024",
    changes: [
      { type: "new", text: "Refonte complete de l'interface utilisateur" },
      { type: "new", text: "Systeme de comptes utilisateur avec Supabase" },
      { type: "new", text: "Panel d'administration avance" },
      { type: "new", text: "Systeme de moderation des pseudos" },
      { type: "improve", text: "Nouvelle architecture du projet" },
      { type: "fix", text: "Nombreuses corrections de bugs" },
    ],
  },
  {
    version: "4.5.0",
    date: "15 Decembre 2024",
    changes: [
      { type: "new", text: "10 nouveaux themes d'evenements" },
      { type: "new", text: "Systeme de messages globaux" },
      { type: "improve", text: "Interface du lobby modernisee" },
      { type: "fix", text: "Correction des deconnexions intempestives" },
    ],
  },
  {
    version: "4.4.0",
    date: "10 Decembre 2024",
    changes: [
      { type: "new", text: "Systeme anti-triche avance" },
      { type: "new", text: "Compteur de joueurs en ligne" },
      { type: "improve", text: "Amelioration du systeme de hints" },
      { type: "fix", text: "Correction du calcul des scores" },
    ],
  },
]

const typeConfig = {
  new: { icon: Plus, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Nouveau" },
  improve: { icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", label: "Amelioration" },
  fix: { icon: Bug, color: "text-red-400", bg: "bg-red-500/10", label: "Correction" },
}

export default function PatchNotesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d25] to-[#080818] flex flex-col">
      {/* Header */}
      <header className="glass-strong border-b border-white/5 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
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

      <main className="max-w-4xl mx-auto px-4 py-12 flex-1">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-500/10 px-4 py-2 rounded-full mb-6 border border-purple-500/20">
            <Sparkles className="w-4 h-4" />
            Patch Notes
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Historique des{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              mises a jour
            </span>
          </h1>
          <p className="text-lg text-white/50">Decouvrez toutes les nouveautes et ameliorations de Drawly.</p>
        </div>

        <div className="glass rounded-2xl p-6 mb-8 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Nouveautes de la v5.3.0</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <Globe className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="font-medium text-white">Nouvelle homepage</p>
                <p className="text-xs text-white/50">Contenu enrichi</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <Server className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="font-medium text-white">Status temps reel</p>
                <p className="text-xs text-white/50">Connexion au backend</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <Shield className="w-8 h-8 text-pink-400" />
              <div>
                <p className="font-medium text-white">Pages legales</p>
                <p className="text-xs text-white/50">Terms & Privacy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patch notes list */}
        <div className="space-y-6">
          {patchNotes.map((patch, i) => (
            <div key={i} className={`glass rounded-2xl p-6 ${patch.isLatest ? "ring-2 ring-purple-500/30" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white">v{patch.version}</span>
                  {patch.isLatest && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3" />
                      Actuelle
                    </span>
                  )}
                </div>
                <span className="text-sm text-white/40">{patch.date}</span>
              </div>

              <ul className="space-y-2">
                {patch.changes.map((change, j) => {
                  const config = typeConfig[change.type as keyof typeof typeConfig]
                  return (
                    <li key={j} className="flex items-start gap-3">
                      <div className={`${config.bg} rounded-lg p-1.5 shrink-0`}>
                        <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
                      </div>
                      <span className="text-sm text-white/70">{change.text}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
