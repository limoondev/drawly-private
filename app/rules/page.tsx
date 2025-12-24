"use client"

import {
  ArrowLeft,
  Pencil,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sparkles,
  Users,
  Clock,
  MessageCircle,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function RulesPage() {
  const rules = [
    {
      icon: Users,
      title: "Rejoindre une partie",
      content:
        "Créez une nouvelle partie ou rejoignez-en une existante avec un code. Partagez le code avec vos amis pour jouer ensemble. Les parties peuvent accueillir jusqu'à 8 joueurs.",
    },
    {
      icon: Palette,
      title: "Dessiner",
      content:
        "Quand c'est votre tour, vous avez 80 secondes pour dessiner le mot qui vous est attribué. Utilisez les différents outils (pinceau, gomme, remplissage) et les 30 couleurs disponibles.",
    },
    {
      icon: MessageCircle,
      title: "Deviner",
      content:
        "Quand un autre joueur dessine, tapez vos réponses dans le chat. Plus vous devinez vite, plus vous gagnez de points ! Les réponses proches vous donneront un indice.",
    },
    {
      icon: Clock,
      title: "Temps et indices",
      content:
        "Des lettres du mot seront révélées progressivement si personne ne trouve. Restez attentif aux indices pour maximiser vos chances !",
    },
  ]

  const dos = [
    "Jouer fair-play et respecter les autres joueurs",
    "Dessiner clairement pour que les autres puissent deviner",
    "Utiliser un pseudo approprié",
    "Signaler tout comportement suspect",
    "S'amuser et passer un bon moment !",
  ]

  const donts = [
    "Écrire le mot dans le dessin",
    "Utiliser des outils externes pour tricher",
    "Insulter ou harceler les autres joueurs",
    "Copier-coller les réponses",
    "Utiliser des pseudos inappropriés",
  ]

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

      {/* How to play */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-500/10 px-4 py-2 rounded-full mb-6 border border-purple-500/20">
            <BookOpen className="w-4 h-4" />
            Règles du Jeu
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Comment{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              jouer
            </span>
          </h1>
          <p className="text-lg text-white/50">Tout ce que vous devez savoir pour profiter de Drawly.</p>
        </div>

        {/* How to play */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {rules.map((rule, i) => (
            <div key={i} className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <rule.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-white">{rule.title}</h3>
              </div>
              <p className="text-sm text-white/60">{rule.content}</p>
            </div>
          ))}
        </div>

        {/* Scoring */}
        <div className="glass rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Système de points
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">+250</div>
              <p className="text-sm text-white/60">Première réponse correcte</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">+100-200</div>
              <p className="text-sm text-white/60">Réponse correcte (selon rapidité)</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">+50</div>
              <p className="text-sm text-white/60">Bonus dessinateur par devineur</p>
            </div>
          </div>
        </div>

        {/* Do's and Don'ts */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-bold text-white">A faire</h3>
            </div>
            <ul className="space-y-3">
              {dos.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-white/70">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-white">A ne pas faire</h3>
            </div>
            <ul className="space-y-3">
              {donts.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-white/70">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-8 glass rounded-xl p-6 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white mb-1">Avertissement</h4>
              <p className="text-sm text-white/60">
                Les comportements non respectueux ou la triche peuvent entraîner un bannissement temporaire ou
                permanent. Notre système anti-triche détecte automatiquement les comportements suspects.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
