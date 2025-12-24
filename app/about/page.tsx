"use client"

import {
  ArrowLeft,
  Pencil,
  Users,
  Zap,
  Shield,
  Globe,
  Heart,
  Code,
  Sparkles,
  Trophy,
  Palette,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function AboutPage() {
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-500/10 px-4 py-2 rounded-full mb-6 border border-purple-500/20">
            <Sparkles className="w-4 h-4" />A Propos
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bienvenue sur{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Drawly
            </span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Le jeu de dessin multijoueur en temps reel qui reunit creativite, competition et plaisir dans une ambiance
            cosmique unique.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: "10K+", label: "Joueurs", icon: Users },
            { value: "50K+", label: "Parties", icon: Trophy },
            { value: "100+", label: "Mots", icon: MessageCircle },
            { value: "10", label: "Themes", icon: Palette },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4 text-center">
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            {
              icon: Users,
              title: "Multijoueur en temps reel",
              description: "Jouez avec vos amis ou des joueurs du monde entier. Jusqu'a 8 joueurs par partie.",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              icon: Zap,
              title: "Ultra rapide",
              description: "Synchronisation instantanee des dessins et des messages. Aucun delai perceptible.",
              gradient: "from-amber-500 to-orange-500",
            },
            {
              icon: Shield,
              title: "Anti-triche",
              description:
                "Systeme de protection avance contre la triche. Detection automatique des comportements suspects.",
              gradient: "from-emerald-500 to-teal-500",
            },
            {
              icon: Globe,
              title: "Accessible partout",
              description: "Jouez depuis n'importe quel appareil avec un navigateur web moderne.",
              gradient: "from-purple-500 to-pink-500",
            },
          ].map((feature, i) => (
            <div key={i} className="glass rounded-xl p-6 hover:bg-white/5 transition-all">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/50">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="glass rounded-2xl p-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">Notre Histoire</h2>
          </div>
          <div className="space-y-4 text-white/70">
            <p>
              Drawly est ne d'une passion simple : creer un espace ou les gens peuvent s'amuser ensemble en dessinant et
              en devinant. Inspire par les grands classiques du genre, nous avons voulu creer quelque chose de plus
              moderne, plus beau et plus accessible.
            </p>
            <p>
              Notre equipe travaille constamment pour ameliorer l'experience de jeu, ajouter de nouvelles
              fonctionnalites et creer les meilleurs moments de fun pour notre communaute grandissante.
            </p>
            <p>
              Que vous soyez un artiste talentueux ou que vous dessiniez comme un enfant de 5 ans (comme nous), Drawly
              est fait pour vous. L'important c'est de s'amuser !
            </p>
          </div>
        </div>

        {/* Tech */}
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Technologies</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Next.js 16",
              "React 19",
              "TypeScript",
              "Tailwind CSS",
              "Supabase",
              "WebSocket",
              "Canvas API",
              "Vercel",
            ].map((tech, i) => (
              <div key={i} className="bg-white/5 rounded-lg px-4 py-3 text-center">
                <span className="text-sm font-medium text-white/70">{tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Version */}
        <div className="text-center mt-12">
          <p className="text-sm text-white/30">Version 1.104.0</p>
          <p className="text-xs text-white/20 mt-1">Made with love for the community</p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
