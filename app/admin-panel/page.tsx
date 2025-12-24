"use client"

import { useState, useEffect } from "react"
import { useThemeEvent, THEME_STYLES, type ThemeEvent } from "@/lib/theme-events"
import { useGlobalConfig } from "@/components/global-config-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Shield,
  Lock,
  Unlock,
  Palette,
  Megaphone,
  Sparkles,
  Send,
  Check,
  AlertTriangle,
  PartyPopper,
  Info,
  Trash2,
  Globe,
  Zap,
  Clock,
  RefreshCw,
  TrendingUp,
  Gamepad2,
  Pencil,
  Settings,
  Bell,
  BarChart3,
  Server,
  Wifi,
  WifiOff,
  Database,
  Users,
  Timer,
  ChevronRight,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"

const ADMIN_PASSWORD = "Abuse"

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}j ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "themes" | "messages" | "settings">("overview")
  const {
    currentTheme,
    setTheme,
    sendGlobalMessage,
    onlineCount,
    globalMessages,
    clearAllMessages,
    serverStats,
    isConnected,
    refreshStats,
  } = useThemeEvent()
  const { backendStatus, backendUrl, checkBackendStatus } = useGlobalConfig()
  const [messageText, setMessageText] = useState("")
  const [messageType, setMessageType] = useState<"info" | "alert" | "celebration" | "event">("info")
  const [messageDuration, setMessageDuration] = useState(60)
  const [themeDuration, setThemeDuration] = useState(15)
  const [mounted, setMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setMounted(true)
    const auth = sessionStorage.getItem("drawly_admin_auth")
    if (auth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem("drawly_admin_auth", "true")
      setError("")
    } else {
      setError("Mot de passe incorrect")
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("drawly_admin_auth")
  }

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendGlobalMessage(messageText.trim(), messageType, messageDuration * 1000)
      setMessageText("")
    }
  }

  const handleSetTheme = (theme: ThemeEvent) => {
    setTheme(theme, themeDuration * 60 * 1000)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([refreshStats(), checkBackendStatus()])
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const quickMessages = [
    { text: "Nouvel evenement en cours !", type: "event" as const, icon: Sparkles },
    { text: "Maintenance dans 5 minutes", type: "alert" as const, icon: AlertTriangle },
    { text: "Bienvenue aux nouveaux joueurs !", type: "celebration" as const, icon: PartyPopper },
    { text: "Double XP active pour 1 heure", type: "info" as const, icon: Zap },
    { text: "Nouveau theme disponible !", type: "event" as const, icon: Palette },
    { text: "Serveur mis a jour avec succes", type: "info" as const, icon: Check },
  ]

  const themes: Array<{ key: ThemeEvent; label: string }> = [
    { key: "galaxy", label: "Galaxy" },
    { key: "lava", label: "Lava" },
    { key: "candy", label: "Candy" },
    { key: "ocean", label: "Ocean" },
    { key: "forest", label: "Forest" },
    { key: "neon", label: "Neon" },
    { key: "sunset", label: "Sunset" },
    { key: "aurora", label: "Aurora" },
    { key: "ice", label: "Ice" },
    { key: "rainbow", label: "Rainbow" },
  ]

  const tabs = [
    { id: "overview" as const, label: "Vue d'ensemble", icon: BarChart3 },
    { id: "themes" as const, label: "Themes", icon: Palette },
    { id: "messages" as const, label: "Messages", icon: Megaphone },
    { id: "settings" as const, label: "Parametres", icon: Settings },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#080812] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d20] to-[#080818] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl blur-xl opacity-50" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mt-6 mb-2">Admin Panel</h1>
              <p className="text-white/50 text-sm">Acces restreint - Authentification requise</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez le mot de passe..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="pl-12 pr-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {error && (
                  <p className="text-red-400 text-sm mt-3 flex items-center gap-2 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              <Button
                onClick={handleLogin}
                className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white font-bold rounded-xl"
              >
                <Unlock className="w-5 h-5 mr-2" />
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d20] to-[#080818]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Drawly Admin</h1>
                <p className="text-xs text-white/40">Panneau d'administration</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                  isConnected
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                {isConnected ? (
                  <>
                    <div className="relative">
                      <Wifi className="w-4 h-4 text-emerald-400" />
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                    <span className="text-xs text-emerald-400 font-medium">Backend en ligne</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400 font-medium">Backend hors ligne</span>
                  </>
                )}
              </div>

              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="icon"
                className="text-white/50 hover:text-white hover:bg-white/10"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>

              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-white/50 hover:text-white hover:bg-white/10 text-sm"
              >
                <Lock className="w-4 h-4 mr-2" />
                Deconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl p-5 border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-xs text-emerald-400/70 font-medium">Joueurs en ligne</span>
                </div>
                <div className="text-3xl font-bold text-white tabular-nums">{isConnected ? onlineCount : "-"}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-5 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-xs text-purple-400/70 font-medium">Parties actives</span>
                </div>
                <div className="text-3xl font-bold text-white tabular-nums">
                  {isConnected ? serverStats.activeRooms : "-"}
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-2xl p-5 border border-cyan-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Pencil className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-xs text-cyan-400/70 font-medium">Total dessins</span>
                </div>
                <div className="text-3xl font-bold text-white tabular-nums">
                  {isConnected ? serverStats.totalDrawings.toLocaleString() : "-"}
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-2xl p-5 border border-amber-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-xs text-amber-400/70 font-medium">Pic joueurs</span>
                </div>
                <div className="text-3xl font-bold text-white tabular-nums">
                  {isConnected ? serverStats.peakPlayers : "-"}
                </div>
              </div>
            </div>

            {/* Server Info Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-400" />
                Informations du serveur
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                    <Globe className="w-4 h-4" />
                    URL Backend
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-white text-sm font-mono truncate flex-1">
                      {backendUrl || "Non configure"}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(backendUrl || "")}
                      className="text-white/30 hover:text-white/60 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                    <Timer className="w-4 h-4" />
                    Uptime
                  </div>
                  <p className="text-white font-medium">
                    {isConnected ? formatUptime(serverStats.uptime) : "Indisponible"}
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                    <Database className="w-4 h-4" />
                    Version
                  </div>
                  <p className="text-white font-medium">{backendStatus?.version || "Inconnue"}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                    <Gamepad2 className="w-4 h-4" />
                    Total parties jouees
                  </div>
                  <p className="text-white font-medium tabular-nums">
                    {isConnected ? serverStats.totalGames.toLocaleString() : "-"}
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                    <Palette className="w-4 h-4" />
                    Theme actif
                  </div>
                  <p className="text-white font-medium capitalize">{currentTheme}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                    <Bell className="w-4 h-4" />
                    Messages actifs
                  </div>
                  <p className="text-white font-medium tabular-nums">{globalMessages.length}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Actions rapides
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab("themes")}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">Changer le theme</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                </button>

                <button
                  onClick={() => setActiveTab("messages")}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium">Envoyer un message</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw className={`w-5 h-5 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
                    <span className="text-white font-medium">Rafraichir les stats</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                </button>

                <a
                  href={backendUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-orange-400" />
                    <span className="text-white font-medium">Ouvrir le backend</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Themes Tab */}
        {activeTab === "themes" && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  Themes disponibles
                </h3>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/40" />
                  <Input
                    type="number"
                    value={themeDuration}
                    onChange={(e) => setThemeDuration(Number(e.target.value))}
                    className="w-20 h-8 bg-white/5 border-white/10 text-white text-sm"
                    min={1}
                    max={120}
                  />
                  <span className="text-sm text-white/40">min</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {themes.map((theme) => {
                  const style = THEME_STYLES[theme.key]
                  const isActive = currentTheme === theme.key
                  return (
                    <button
                      key={theme.key}
                      onClick={() => handleSetTheme(theme.key)}
                      className={`relative p-4 rounded-xl border transition-all ${
                        isActive
                          ? "border-white/30 bg-white/10"
                          : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${style.gradient} mb-3`} />
                      <p className="text-sm font-medium text-white">{theme.label}</p>
                      {isActive && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-cyan-400" />
                Envoyer un message global
              </h3>

              <div className="space-y-4">
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Ecris ton message..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-24"
                />

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/50">Type:</span>
                    {(["info", "alert", "celebration", "event"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setMessageType(type)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          messageType === type
                            ? type === "info"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : type === "alert"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : type === "celebration"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {type === "info" && <Info className="w-3 h-3 inline mr-1" />}
                        {type === "alert" && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                        {type === "celebration" && <PartyPopper className="w-3 h-3 inline mr-1" />}
                        {type === "event" && <Sparkles className="w-3 h-3 inline mr-1" />}
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/40" />
                    <Input
                      type="number"
                      value={messageDuration}
                      onChange={(e) => setMessageDuration(Number(e.target.value))}
                      className="w-20 h-8 bg-white/5 border-white/10 text-white text-sm"
                      min={5}
                      max={3600}
                    />
                    <span className="text-sm text-white/40">sec</span>
                  </div>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>

            {/* Quick Messages */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Messages rapides
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {quickMessages.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMessageText(msg.text)
                      setMessageType(msg.type)
                    }}
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <msg.icon className="w-5 h-5 text-white/50" />
                    <span className="text-sm text-white">{msg.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Messages */}
            {globalMessages.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-emerald-400" />
                    Messages actifs ({globalMessages.length})
                  </h3>
                  <Button
                    onClick={clearAllMessages}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Tout supprimer
                  </Button>
                </div>

                <div className="space-y-2">
                  {globalMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl border ${
                        msg.type === "alert"
                          ? "bg-red-500/10 border-red-500/20"
                          : msg.type === "celebration"
                            ? "bg-amber-500/10 border-amber-500/20"
                            : msg.type === "event"
                              ? "bg-purple-500/10 border-purple-500/20"
                              : "bg-blue-500/10 border-blue-500/20"
                      }`}
                    >
                      <p className="text-sm text-white">{msg.text}</p>
                      <p className="text-xs text-white/40 mt-1">
                        Expire dans {Math.max(0, Math.round((msg.expiresAt - Date.now()) / 1000))}s
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-white/50" />
                Configuration
              </h3>

              <p className="text-white/50 text-sm">
                Les parametres avances seront disponibles dans une prochaine version.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
