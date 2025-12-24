"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Pencil,
  Users,
  Loader2,
  Palette,
  Sparkles,
  Zap,
  Star,
  Trophy,
  Gamepad2,
  PartyPopper,
  Rocket,
  Wand2,
  Settings,
  Plus,
  WifiOff,
  ChevronRight,
  Clock,
  Target,
  MessageCircle,
  Award,
  TrendingUp,
  Play,
  ArrowRight,
} from "lucide-react"
import { SettingsModal } from "@/components/settings-modal"
import { NavigationBar } from "@/components/navigation-bar"
import { isValidUsername } from "@/lib/words"
import { useGlobalConfig } from "@/components/global-config-provider"
import { Footer } from "@/components/footer"

interface LobbyScreenProps {
  onJoinGame: (name: string, roomCode: string, isHost: boolean) => void
}

const CURRENT_VERSION = "5.3.0"

const TIPS = [
  "Dessine vite mais clairement !",
  "Les premiers a deviner gagnent plus de points",
  "Utilise le chat pour deviner le mot",
  "Le dessinateur ne peut pas parler",
  "Plus tu devines vite, plus tu gagnes !",
  "Partage le code avec tes amis !",
]

function FloatingIcons() {
  const icons = useMemo(() => {
    const iconTypes = [Pencil, Star, Zap, Trophy, Gamepad2, PartyPopper, Rocket, Wand2]
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      Icon: iconTypes[i % iconTypes.length],
      left: `${5 + Math.random() * 90}%`,
      top: `${5 + Math.random() * 90}%`,
      size: 16 + Math.random() * 20,
      delay: Math.random() * 15,
      duration: 20 + Math.random() * 15,
      rotation: Math.random() * 360,
      opacity: 0.1 + Math.random() * 0.15,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((item) => (
        <item.Icon
          key={item.id}
          className="absolute text-primary animate-float-smooth"
          style={{
            left: item.left,
            top: item.top,
            width: item.size,
            height: item.size,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            transform: `rotate(${item.rotation}deg)`,
            opacity: item.opacity,
          }}
        />
      ))}
    </div>
  )
}

function ServerStatus() {
  const { backendStatus, isLoading } = useGlobalConfig()

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-full border border-white/10">
        <Loader2 className="w-3 h-3 animate-spin text-white/50" />
        <span className="text-[10px] text-white/50">...</span>
      </div>
    )
  }

  if (!backendStatus?.online) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
      <div className="relative">
        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
        <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
      </div>
      <div className="flex items-center gap-1">
        <Users className="w-3 h-3 text-white/50" />
        <span className="text-[10px] text-white/70">{backendStatus.players || 0}</span>
      </div>
    </div>
  )
}

function HowToPlaySection() {
  const steps = [
    {
      icon: Users,
      title: "Creer ou rejoindre",
      description: "Cree une partie privee ou rejoins une partie existante avec un code",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Pencil,
      title: "Dessiner",
      description: "Quand c'est ton tour, dessine le mot secret pour les autres joueurs",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: MessageCircle,
      title: "Deviner",
      description: "Quand les autres dessinent, devine le mot le plus vite possible",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Trophy,
      title: "Gagner",
      description: "Accumule des points et deviens le meilleur dessinateur",
      gradient: "from-emerald-500 to-teal-500",
    },
  ]

  return (
    <section className="py-20 px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 bg-cyan-500/10 px-4 py-2 rounded-full mb-4 border border-cyan-500/20">
          <Target className="w-4 h-4" />
          Comment jouer
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Simple a comprendre,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            amusant a jouer
          </span>
        </h2>
        <p className="text-white/50 max-w-2xl mx-auto">
          Drawly est un jeu de dessin multijoueur ou tu dois dessiner et deviner des mots avec tes amis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${step.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-4xl font-black text-white/10">0{i + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-white/50">{step.description}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                <ChevronRight className="w-6 h-6 text-white/20" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Temps reel",
      description: "Dessins synchronises instantanement entre tous les joueurs",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Palette,
      title: "30+ couleurs",
      description: "Une palette complete pour exprimer ta creativite",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Users,
      title: "Jusqu'a 10 joueurs",
      description: "Invite tous tes amis pour des parties epiques",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      icon: Clock,
      title: "Rounds personnalisables",
      description: "Choisis la duree et le nombre de rounds",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Award,
      title: "Systeme de points",
      description: "Plus tu devines vite, plus tu gagnes de points",
      gradient: "from-purple-500 to-violet-500",
    },
    {
      icon: Gamepad2,
      title: "Sans inscription",
      description: "Joue immediatement, aucun compte requis",
      gradient: "from-cyan-500 to-blue-500",
    },
  ]

  return (
    <section className="py-20 px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-purple-300 bg-purple-500/10 px-4 py-2 rounded-full mb-4 border border-purple-500/20">
          <Sparkles className="w-4 h-4" />
          Fonctionnalites
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Tout ce qu'il faut pour{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">s'amuser</span>
        </h2>
        <p className="text-white/50 max-w-2xl mx-auto">
          Drawly est concu pour offrir la meilleure experience de jeu de dessin en ligne.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className="group p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            <div
              className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
            >
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-white/50">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function PatchNotesPreview() {
  const recentUpdates = [
    { version: "5.3.0", title: "Nouvelle page d'accueil et footer", date: "Dec 2024" },
    { version: "5.2.0", title: "Systeme de themes dynamiques", date: "Dec 2024" },
    { version: "5.1.0", title: "Backend HTTPS securise", date: "Dec 2024" },
  ]

  return (
    <section className="py-20 px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 px-4 py-2 rounded-full mb-4 border border-amber-500/20">
            <TrendingUp className="w-4 h-4" />
            Mises a jour
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Toujours en{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              evolution
            </span>
          </h2>
          <p className="text-white/50 mb-6">
            Nous ameliorons constamment Drawly avec de nouvelles fonctionnalites, corrections de bugs et optimisations.
          </p>
          <a
            href="/patch-notes"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-medium"
          >
            Voir toutes les mises a jour
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="space-y-4">
          {recentUpdates.map((update, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-300 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                    v{update.version}
                  </span>
                  <span className="text-xs text-white/30">{update.date}</span>
                </div>
                <p className="text-sm text-white font-medium truncate">{update.title}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection({ onScrollToTop }: { onScrollToTop: () => void }) {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/20 via-purple-500/20 to-secondary/20 p-8 md:p-12 lg:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(124,58,237,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.2),transparent_60%)]" />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">Pret a jouer ?</h2>
          <p className="text-white/60 mb-8 text-lg">
            Rejoins des milliers de joueurs et commence a dessiner maintenant. C'est gratuit !
          </p>
          <Button
            onClick={onScrollToTop}
            size="lg"
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-1"
          >
            <Play className="w-5 h-5 mr-2" />
            Jouer maintenant
          </Button>
        </div>
      </div>
    </section>
  )
}

export function LobbyScreen({ onJoinGame }: LobbyScreenProps) {
  const [username, setUsername] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [mode, setMode] = useState<"create" | "join">("create")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentTip, setCurrentTip] = useState("")
  const [error, setError] = useState("")

  const { backendStatus, isLoading: isCheckingBackend } = useGlobalConfig()

  useEffect(() => {
    setMounted(true)

    const savedName = localStorage.getItem("drawly_player_name")
    if (savedName) setUsername(savedName)

    const interval = setInterval(() => {
      setCurrentTip(TIPS[Math.floor(Math.random() * TIPS.length)])
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const generateRoomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleJoin = () => {
    if (!backendStatus?.online) {
      setError("Le serveur est hors ligne. Reessayez plus tard.")
      return
    }

    const validation = isValidUsername(username)
    if (!validation.valid) {
      setError(validation.reason || "Pseudo invalide")
      return
    }
    setError("")

    if (mode === "create") {
      const code = generateRoomCode()
      localStorage.setItem("drawly_player_name", username.trim())
      setIsLoading(true)
      setTimeout(() => onJoinGame(username.trim(), code, true), 300)
    } else {
      if (!roomCode.trim()) {
        setError("Entre un code de salon valide")
        return
      }
      localStorage.setItem("drawly_player_name", username.trim())
      setIsLoading(true)
      setTimeout(() => onJoinGame(username.trim(), roomCode.trim(), false), 300)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const canJoin = mode === "create" || (mode === "join" && roomCode.trim().length >= 4)

  const isBackendOffline = !isCheckingBackend && !backendStatus?.online

  return (
    <div className="min-h-screen bg-background text-white flex flex-col relative overflow-x-hidden">
      <FloatingIcons />

      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/20 rounded-full blur-[120px] animate-glow-pulse"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-glow-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <header
        className={`sticky top-0 z-50 h-14 px-4 border-b border-white/5 bg-black/90 backdrop-blur-xl transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0 -translate-y-2"}`}
      >
        <div className="h-full flex items-center max-w-7xl mx-auto relative">
          {/* Logo - left */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-500 to-secondary rounded-lg blur opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative w-7 h-7 bg-gradient-to-br from-primary via-purple-500 to-secondary rounded-lg flex items-center justify-center">
                <Pencil className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Drawly
            </span>
            <span className="text-[10px] text-white/30 font-medium hidden sm:inline">v{CURRENT_VERSION}</span>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
            <NavigationBar />
          </div>

          {/* Right side - status + settings */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:block">
              <ServerStatus />
            </div>
            <SettingsModal>
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8">
                <Settings className="w-4 h-4" />
              </Button>
            </SettingsModal>
          </div>
        </div>
      </header>

      {isBackendOffline && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-300">
              Le serveur de jeu est actuellement hors ligne. Les parties ne sont pas disponibles.
            </span>
          </div>
        </div>
      )}

      {/* Hero Section - Main Content */}
      <section className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-3.5rem)]">
        {/* Left - Hero */}
        <div
          className={`flex-1 flex flex-col justify-center transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
        >
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-300 bg-purple-500/10 px-3 md:px-4 py-2 rounded-full mb-4 md:mb-6 border border-purple-500/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">Jeu multijoueur gratuit - Aucun compte requis</span>
              <span className="sm:hidden">Gratuit - Sans inscription</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 leading-tight tracking-tight">
              Dessine, devine
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                et gagne
              </span>{" "}
              <Sparkles className="inline w-8 h-8 md:w-10 md:h-10 text-amber-400 animate-pulse" />
            </h1>

            <p className="text-base md:text-lg text-white/50 leading-relaxed max-w-lg mb-6 md:mb-10">
              Le jeu de dessin multijoueur en temps reel. Choisis un pseudo, cree ou rejoins une partie, et c'est parti
              !
            </p>

            {/* Features - responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-6 md:mb-8">
              {[
                { icon: Palette, label: "30 couleurs", sub: "Palette pro", gradient: "from-pink-500 to-rose-500" },
                { icon: Users, label: "10 joueurs", sub: "Par partie", gradient: "from-blue-500 to-cyan-500" },
                { icon: Zap, label: "Temps reel", sub: "Ultra rapide", gradient: "from-amber-500 to-orange-500" },
                { icon: Trophy, label: "Classement", sub: "Live scores", gradient: "from-purple-500 to-violet-500" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group p-3 md:p-4 glass rounded-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 cursor-default"
                >
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br ${item.gradient} rounded-lg flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <item.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="font-bold text-white text-xs md:text-sm">{item.label}</div>
                  <div className="text-[10px] md:text-xs text-white/40">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Game Card - Made taller */}
        <div
          className={`w-full lg:w-[480px] transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
        >
          <div className="relative h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-500/20 to-secondary/30 rounded-3xl blur-xl opacity-50" />

            <div className="relative glass rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col min-h-[580px]">
              {/* Mode Tabs */}
              <div className="flex gap-2 p-1.5 bg-white/5 rounded-xl mb-6">
                {(["create", "join"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
                      mode === m
                        ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {m === "create" ? (
                      <span className="flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        Creer
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        Rejoindre
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Form content with flex-1 to fill space */}
              <div className="flex-1 flex flex-col">
                {/* Username */}
                <div className="space-y-2 mb-5">
                  <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Ton pseudo
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.slice(0, 20))}
                    placeholder="Entre ton pseudo..."
                    maxLength={20}
                    className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-primary/20 rounded-xl text-base font-medium"
                    disabled={isBackendOffline}
                  />
                  {username && !isValidUsername(username) && (
                    <p className="text-xs text-red-400">Pseudo invalide ou inapproprie</p>
                  )}
                </div>

                {/* Room Code for Join */}
                {mode === "join" && (
                  <div className="space-y-2 mb-5">
                    <label className="text-sm font-semibold text-white/70 flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-cyan-400" />
                      Code de la partie
                    </label>
                    <Input
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                      placeholder="XXXXXX"
                      maxLength={6}
                      className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:ring-primary/20 rounded-xl text-center text-xl font-mono tracking-[0.3em] uppercase"
                      disabled={isBackendOffline}
                    />
                  </div>
                )}

                {/* Tip Box */}
                <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1">Astuce du jour</p>
                      <p className="text-xs text-white/50">{currentTip}</p>
                    </div>
                  </div>
                </div>

                {/* Spacer to push button down */}
                <div className="flex-1" />

                {/* Action Button */}
                <Button
                  onClick={handleJoin}
                  disabled={!canJoin || isLoading || isBackendOffline}
                  size="lg"
                  className="w-full h-16 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connexion...
                    </>
                  ) : isBackendOffline ? (
                    <>
                      <WifiOff className="mr-2 h-5 w-5" />
                      Serveur hors ligne
                    </>
                  ) : mode === "create" ? (
                    <>
                      <Rocket className="mr-2 h-5 w-5" />
                      Creer la partie
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Rejoindre
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HowToPlaySection />
      <FeaturesSection />
      <PatchNotesPreview />
      <CTASection onScrollToTop={scrollToTop} />

      {/* Footer info */}
      <div className="text-center py-6">
        <p className="text-xs text-white/30">
          En jouant, tu acceptes nos{" "}
          <a href="/terms" className="text-white/50 hover:text-white transition-colors underline">
            conditions d'utilisation
          </a>
        </p>
      </div>

      <Footer />
    </div>
  )
}
