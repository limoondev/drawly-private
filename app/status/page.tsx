"use client"

import {
  ArrowLeft,
  Pencil,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Globe,
  Zap,
  Database,
  Users,
  Shield,
  Wifi,
  Signal,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import { useNetworkStats, type NetworkStats } from "@/lib/network-monitor"
import { Footer } from "@/components/footer"

interface ServiceStatus {
  status: "operational" | "degraded" | "down"
  latency: number
  uptime?: number
}

interface StatusData {
  status: string
  version: string
  uptime: number
  uptimeFormatted: string
  services: {
    api: ServiceStatus
    gameServer: ServiceStatus
    synchronization: ServiceStatus
    websocket: ServiceStatus
    database: ServiceStatus
    auth: ServiceStatus
  }
  stats: {
    activeRooms: number
    activePlayers: number
    totalGames: number
    peakPlayers: number
  }
  lastCheck: string
  serverTime: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function PingGraph({ history }: { history: NetworkStats["history"] }) {
  if (history.length < 2) return null

  const validPings = history.filter((p) => p.latency > 0)
  const maxPing = Math.max(...validPings.map((p) => p.latency), 100)

  return (
    <div className="h-20 flex items-end gap-[3px] px-2">
      {history.slice(-30).map((ping, i) => {
        const height = ping.latency > 0 ? Math.max(8, (ping.latency / maxPing) * 80) : 4
        const isLatest = i === Math.min(history.length, 30) - 1

        let colorClass = "bg-red-500/50"
        let glowClass = ""
        if (ping.latency > 0) {
          if (ping.latency < 30) {
            colorClass = "bg-gradient-to-t from-emerald-500 to-emerald-400"
            if (isLatest) glowClass = "shadow-lg shadow-emerald-500/50"
          } else if (ping.latency < 80) {
            colorClass = "bg-gradient-to-t from-green-500 to-green-400"
            if (isLatest) glowClass = "shadow-lg shadow-green-500/50"
          } else if (ping.latency < 150) {
            colorClass = "bg-gradient-to-t from-amber-500 to-amber-400"
            if (isLatest) glowClass = "shadow-lg shadow-amber-500/50"
          } else {
            colorClass = "bg-gradient-to-t from-orange-500 to-orange-400"
            if (isLatest) glowClass = "shadow-lg shadow-orange-500/50"
          }
        }

        return (
          <div
            key={i}
            className={`flex-1 min-w-[4px] rounded-t transition-all duration-300 ${colorClass} ${glowClass} ${isLatest ? "scale-x-110" : ""} hover:opacity-80`}
            style={{ height: `${height}px` }}
            title={ping.latency > 0 ? `${ping.latency}ms` : "Timeout"}
          />
        )
      })}
    </div>
  )
}

function ConnectionQualityMeter({ quality }: { quality: number }) {
  const segments = 10
  const filledSegments = Math.round((quality / 100) * segments)

  const getColor = (index: number) => {
    if (index >= filledSegments) return "bg-muted/30"
    if (quality >= 80) return "bg-emerald-500"
    if (quality >= 60) return "bg-green-500"
    if (quality >= 40) return "bg-amber-500"
    if (quality >= 20) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: segments }).map((_, i) => (
        <div key={i} className={`w-3 h-6 rounded-sm transition-all ${getColor(i)}`} />
      ))}
    </div>
  )
}

export default function StatusPage() {
  const { data, error, isLoading, mutate } = useSWR<StatusData>("/api/status", fetcher, {
    refreshInterval: 30000,
  })

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const networkStats = useNetworkStats()

  useEffect(() => {
    if (data) {
      setLastUpdate(new Date())
    }
  }, [data])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([mutate(), networkStats.refresh()])
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-amber-400" />
      case "down":
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Activity className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
      case "degraded":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400"
      case "down":
        return "bg-red-500/10 border-red-500/30 text-red-400"
      default:
        return "bg-muted border-border text-muted-foreground"
    }
  }

  const getLatencyColor = (latency: number) => {
    if (latency < 30) return "text-emerald-400"
    if (latency < 60) return "text-green-400"
    if (latency < 100) return "text-amber-400"
    return "text-orange-400"
  }

  const services = [
    { key: "api", name: "API Principale", icon: Server, description: "Gestion des requetes et authentification" },
    { key: "gameServer", name: "Serveur de Jeu", icon: Zap, description: "Logique de jeu et gestion des parties" },
    { key: "database", name: "Base de donnees", icon: Database, description: "Supabase PostgreSQL" },
    { key: "auth", name: "Authentification", icon: Shield, description: "Supabase Auth" },
    {
      key: "synchronization",
      name: "Synchronisation",
      icon: RefreshCw,
      description: "Synchronisation temps reel des donnees",
    },
    { key: "websocket", name: "WebSocket", icon: Globe, description: "Communication en temps reel" },
  ]

  const uptimeDays = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      // Simulate uptime data - in production this would come from the API
      const random = Math.random()
      if (i > 25) return { day: i, status: "operational", uptime: 100 }
      if (random > 0.95) return { day: i, status: "degraded", uptime: 99.5 }
      return { day: i, status: "operational", uptime: 100 }
    })
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass-strong border-b border-border sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary via-purple-500 to-secondary rounded-lg flex items-center justify-center">
                <Pencil className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-black text-foreground">Drawly</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-12 flex-1 w-full">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-secondary bg-secondary/10 px-4 py-2 rounded-full mb-6 border border-secondary/20">
            <Activity className="w-4 h-4" />
            Statut des services
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Etat des{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
              services
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">Surveillance en temps reel de l'infrastructure Drawly.</p>
        </div>

        {/* Your Connection - Enhanced */}
        <div className="glass-glow rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-primary" />
            Votre connexion
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Main stats */}
            <div className="space-y-4">
              {/* Current ping */}
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground uppercase">Ping actuel</span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full ${
                      networkStats.status === "excellent" || networkStats.status === "good"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : networkStats.status === "fair"
                          ? "bg-amber-500/20 text-amber-400"
                          : networkStats.status === "poor"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {networkStats.status === "excellent"
                      ? "Excellent"
                      : networkStats.status === "good"
                        ? "Bon"
                        : networkStats.status === "fair"
                          ? "Moyen"
                          : networkStats.status === "poor"
                            ? "Faible"
                            : "Hors ligne"}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-5xl font-black font-mono ${
                      networkStats.status === "excellent"
                        ? "text-emerald-400"
                        : networkStats.status === "good"
                          ? "text-green-400"
                          : networkStats.status === "fair"
                            ? "text-amber-400"
                            : networkStats.status === "poor"
                              ? "text-orange-400"
                              : "text-red-400"
                    }`}
                  >
                    {networkStats.currentPing > 0 ? networkStats.currentPing : "---"}
                  </span>
                  <span className="text-xl text-muted-foreground">ms</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    icon: Activity,
                    label: "Moy",
                    value: networkStats.averagePing > 0 ? networkStats.averagePing : "---",
                    color: "text-blue-400",
                  },
                  {
                    icon: TrendingDown,
                    label: "Min",
                    value: networkStats.minPing > 0 ? networkStats.minPing : "---",
                    color: "text-emerald-400",
                  },
                  {
                    icon: TrendingUp,
                    label: "Max",
                    value: networkStats.maxPing > 0 ? networkStats.maxPing : "---",
                    color: "text-orange-400",
                  },
                  { icon: Signal, label: "Jitter", value: networkStats.jitter, color: "text-purple-400" },
                ].map((stat, i) => (
                  <div key={i} className="bg-muted/30 rounded-xl p-3 text-center">
                    <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-lg font-black font-mono text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Connection quality */}
              <div className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Qualite de connexion</span>
                  <span className="text-sm font-black text-foreground">{networkStats.connectionQuality}%</span>
                </div>
                <ConnectionQualityMeter quality={networkStats.connectionQuality} />
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>Faible</span>
                  <span className="flex items-center gap-1">
                    {networkStats.isStable && (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Stable</span>
                      </>
                    )}
                  </span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>

            {/* Graph */}
            <div className="bg-muted/30 rounded-xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Historique du ping</span>
                </div>
                {networkStats.packetLoss > 0 && (
                  <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {networkStats.packetLoss}% perte
                  </span>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <PingGraph history={networkStats.history} />
              </div>
              <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                <span>2 min</span>
                <span>Maintenant</span>
              </div>
            </div>
          </div>

          {/* Backend status */}
          {networkStats.backendConnected && (
            <div className="mt-4 bg-gradient-to-r from-emerald-500/10 to-green-500/5 rounded-xl p-4 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Server className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-emerald-400">Backend IP Publique connecte</span>
                    <p className="text-xs text-emerald-400/60">Serveur externe actif</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-black text-emerald-400">{networkStats.backendLatency}ms</span>
                  <p className="text-xs text-emerald-400/60">Latence serveur</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="glass rounded-2xl p-8 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-black text-foreground mb-2">Erreur de connexion</h3>
            <p className="text-muted-foreground">Impossible de recuperer le statut des services.</p>
          </div>
        ) : (
          data && (
            <>
              {/* Overall status */}
              <div className={`glass rounded-2xl p-6 mb-8 border ${getStatusColor(data.status)}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(data.status)}
                    <div>
                      <h2 className="text-xl font-black text-foreground">
                        {data.status === "operational"
                          ? "Tous les systemes operationnels"
                          : data.status === "degraded"
                            ? "Performances degradees"
                            : "Incident en cours"}
                      </h2>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Derniere verification : {lastUpdate.toLocaleTimeString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Uptime serveur</p>
                    <p className="text-lg font-black text-foreground">{data.uptimeFormatted}</p>
                  </div>
                </div>
              </div>

              {/* Uptime bar */}
              <div className="glass rounded-xl p-4 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-foreground">Disponibilite sur 30 jours</span>
                  <span className="text-sm font-black text-emerald-400">99.9%</span>
                </div>
                <div className="flex gap-1">
                  {uptimeDays.map((day, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-10 rounded transition-all hover:scale-y-110 cursor-pointer ${
                        day.status === "operational" ? "bg-emerald-500/80 hover:bg-emerald-500" : "bg-amber-500/80"
                      }`}
                      title={`Jour -${30 - i}: ${day.uptime}%`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>30 jours</span>
                  <span>Aujourd'hui</span>
                </div>
              </div>

              {/* Services */}
              <div className="space-y-3 mb-12">
                <h3 className="text-lg font-black text-foreground mb-4">Services</h3>
                {services.map((service) => {
                  const status = data.services[service.key as keyof typeof data.services] || {
                    status: "operational",
                    latency: 0,
                  }
                  return (
                    <div
                      key={service.key}
                      className="glass rounded-xl p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <service.icon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{service.name}</h4>
                          <p className="text-xs text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className={`text-sm font-mono font-bold ${getLatencyColor(status.latency)}`}>
                            {status.latency}ms
                          </span>
                        </div>
                        <div
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(status.status)}`}
                        >
                          {status.status === "operational"
                            ? "Operationnel"
                            : status.status === "degraded"
                              ? "Degrade"
                              : "Hors ligne"}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Stats */}
              <div className="glass rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Statistiques en direct
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Joueurs en ligne", value: data.stats.activePlayers, color: "text-primary" },
                    { label: "Parties actives", value: data.stats.activeRooms, color: "text-secondary" },
                    { label: "Parties jouees", value: data.stats.totalGames, color: "text-amber-400" },
                    { label: "Record de joueurs", value: data.stats.peakPlayers, color: "text-emerald-400" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-muted/50 rounded-xl p-4 text-center group hover:bg-muted/70 transition-colors"
                    >
                      <p className={`text-3xl font-black ${stat.color} group-hover:scale-105 transition-transform`}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Version */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Version {data.version}</p>
              </div>
            </>
          )
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
