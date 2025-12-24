"use client"

import { useGame } from "@/components/game-context"
import { useNetworkStats } from "@/lib/network-monitor"
import {
  Wifi,
  WifiOff,
  Shield,
  Activity,
  Signal,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle,
  Radio,
  Server,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { getServerInfo } from "@/lib/socket-client"

interface BackendStatus {
  connected: boolean
  serverOnline: boolean
  lastCheck: number
  error: string | null
  serverInfo: { version: string; connections: number } | null
}

export function ConnectionStatus() {
  const gameContext = useGame()
  const isConnected = gameContext.isConnected
  const isHost = gameContext.gameState?.players?.find((p) => p.id === gameContext.gameState?.playerId)?.isHost ?? false

  const networkStats = useNetworkStats()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    connected: false,
    serverOnline: false,
    lastCheck: 0,
    error: null,
    serverInfo: null,
  })

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const info = await getServerInfo()
        if (info) {
          setBackendStatus({
            connected: true,
            serverOnline: true,
            lastCheck: Date.now(),
            error: null,
            serverInfo: { version: info.version, connections: info.stats.connections },
          })
        } else {
          setBackendStatus({
            connected: false,
            serverOnline: false,
            lastCheck: Date.now(),
            error: "Serveur injoignable",
            serverInfo: null,
          })
        }
      } catch (error) {
        setBackendStatus({
          connected: false,
          serverOnline: false,
          lastCheck: Date.now(),
          error: error instanceof Error ? error.message : "Erreur",
          serverInfo: null,
        })
      }
    }

    checkBackend()
    const interval = setInterval(checkBackend, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await networkStats.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const getStatusConfig = () => {
    if (!backendStatus.serverOnline) {
      return {
        label: "Hors ligne",
        color: "text-red-400",
        bg: "bg-red-500/20",
        border: "border-red-500/30",
        glow: "shadow-red-500/20",
        gradient: "from-red-500 to-rose-500",
      }
    }

    switch (networkStats.status) {
      case "excellent":
        return {
          label: "Excellent",
          color: "text-emerald-400",
          bg: "bg-emerald-500/20",
          border: "border-emerald-500/30",
          glow: "shadow-emerald-500/20",
          gradient: "from-emerald-500 to-green-500",
        }
      case "good":
        return {
          label: "Bon",
          color: "text-green-400",
          bg: "bg-green-500/20",
          border: "border-green-500/30",
          glow: "shadow-green-500/20",
          gradient: "from-green-500 to-teal-500",
        }
      case "fair":
        return {
          label: "Moyen",
          color: "text-amber-400",
          bg: "bg-amber-500/20",
          border: "border-amber-500/30",
          glow: "shadow-amber-500/20",
          gradient: "from-amber-500 to-orange-500",
        }
      case "poor":
        return {
          label: "Faible",
          color: "text-orange-400",
          bg: "bg-orange-500/20",
          border: "border-orange-500/30",
          glow: "shadow-orange-500/20",
          gradient: "from-orange-500 to-red-500",
        }
      default:
        return {
          label: "Hors ligne",
          color: "text-red-400",
          bg: "bg-red-500/20",
          border: "border-red-500/30",
          glow: "shadow-red-500/20",
          gradient: "from-red-500 to-rose-500",
        }
    }
  }

  const statusConfig = getStatusConfig()
  const isReallyConnected = backendStatus.serverOnline && isConnected

  const getTrend = () => {
    if (networkStats.history.length < 5) return null
    const recent = networkStats.history.slice(-5).filter((p) => p.latency > 0)
    if (recent.length < 3) return null
    const first = recent.slice(0, 2).reduce((a, b) => a + b.latency, 0) / 2
    const last = recent.slice(-2).reduce((a, b) => a + b.latency, 0) / 2
    const diff = last - first
    if (Math.abs(diff) < 5) {
      return { icon: <Minus className="w-3 h-3" />, color: "text-muted-foreground", label: "Stable" }
    }
    if (diff > 0) {
      return { icon: <TrendingUp className="w-3 h-3" />, color: "text-orange-400", label: "Hausse" }
    }
    return { icon: <TrendingDown className="w-3 h-3" />, color: "text-emerald-400", label: "Baisse" }
  }

  const trend = getTrend()

  const renderPingGraph = () => {
    const history = networkStats.history.slice(-20)
    if (history.length < 2) return null
    const validPings = history.filter((p) => p.latency > 0)
    if (validPings.length === 0) return null
    const maxPing = Math.max(...validPings.map((p) => p.latency), 80)
    const graphHeight = 36

    return (
      <div className="relative h-9 flex items-end gap-[2px]">
        {history.map((ping, i) => {
          const height = ping.latency > 0 ? Math.max(4, (ping.latency / maxPing) * graphHeight) : 2
          const isLatest = i === history.length - 1
          let colorClass = "bg-red-500/30"
          if (ping.latency > 0) {
            if (ping.latency < 25) colorClass = "bg-gradient-to-t from-emerald-600 to-emerald-400"
            else if (ping.latency < 60) colorClass = "bg-gradient-to-t from-green-600 to-green-400"
            else if (ping.latency < 120) colorClass = "bg-gradient-to-t from-amber-600 to-amber-400"
            else colorClass = "bg-gradient-to-t from-orange-600 to-orange-400"
          }
          return (
            <div
              key={i}
              className={`flex-1 min-w-[3px] max-w-[8px] rounded-t-sm transition-all duration-200 ${colorClass} ${
                isLatest ? "opacity-100 scale-x-110" : "opacity-70"
              }`}
              style={{ height: `${height}px` }}
            />
          )
        })}
      </div>
    )
  }

  const renderQualityMeter = () => {
    const quality = backendStatus.serverOnline ? networkStats.connectionQuality : 0
    const segments = 5
    const filled = Math.round((quality / 100) * segments)

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i < filled
                ? quality >= 80
                  ? "bg-emerald-500 w-3"
                  : quality >= 60
                    ? "bg-green-500 w-3"
                    : quality >= 40
                      ? "bg-amber-500 w-3"
                      : "bg-orange-500 w-3"
                : "bg-muted/40 w-2"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="glass-glow rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  isReallyConnected
                    ? `bg-gradient-to-br ${statusConfig.gradient} shadow-lg ${statusConfig.glow}`
                    : "bg-gradient-to-br from-red-500/30 to-red-600/20 shadow-lg shadow-red-500/20"
                }`}
              >
                {isReallyConnected ? (
                  <Wifi className="w-5 h-5 text-white" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
              </div>
              {isReallyConnected && networkStats.status !== "offline" && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.bg} opacity-75`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${statusConfig.bg} border-2 border-background`}
                  />
                </span>
              )}
            </div>
            <div>
              <p className={`text-sm font-bold ${isReallyConnected ? statusConfig.color : "text-red-400"}`}>
                {isReallyConnected ? "Connecte" : "Deconnecte"}
              </p>
              <p className="text-xs text-muted-foreground">
                {backendStatus.serverOnline
                  ? `Socket.IO v${backendStatus.serverInfo?.version || "4.0"}`
                  : "Serveur hors ligne"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 text-xs font-bold rounded-full border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {!backendStatus.serverOnline && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">Serveur hors ligne</p>
              <p className="text-xs text-red-400/70 mt-1">
                {backendStatus.error || "Lancez le backend avec: node scripts/backend-v4.js"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main ping display */}
      {backendStatus.serverOnline && (
        <div className="p-4">
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${statusConfig.color}`} />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Latence</span>
              </div>
              {trend && (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 ${trend.color}`}>
                  {trend.icon}
                  <span className="text-xs font-medium">{trend.label}</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-black font-mono tracking-tight ${statusConfig.color}`}>
                {networkStats.currentPing > 0 ? networkStats.currentPing : "---"}
              </span>
              <span className="text-xl font-medium text-muted-foreground">ms</span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="text-xs text-muted-foreground">Qualite</span>
              <div className="flex items-center gap-2">
                {renderQualityMeter()}
                <span className="text-xs font-bold text-foreground">{networkStats.connectionQuality}%</span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              {
                icon: Activity,
                value: networkStats.averagePing > 0 ? networkStats.averagePing : "---",
                label: "Moy",
                color: "text-blue-400",
              },
              {
                icon: TrendingDown,
                value: networkStats.minPing > 0 ? networkStats.minPing : "---",
                label: "Min",
                color: "text-emerald-400",
              },
              {
                icon: TrendingUp,
                value: networkStats.maxPing > 0 ? networkStats.maxPing : "---",
                label: "Max",
                color: "text-orange-400",
              },
              { icon: Signal, value: networkStats.jitter, label: "Jitter", color: "text-purple-400" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-muted/30 rounded-xl p-2.5 text-center group hover:bg-muted/50 transition-colors"
              >
                <stat.icon
                  className={`w-3.5 h-3.5 mx-auto mb-1 ${stat.color} group-hover:scale-110 transition-transform`}
                />
                <p className="text-base font-bold font-mono text-foreground">{stat.value}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Ping graph */}
          <div className="bg-muted/20 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Historique
              </span>
              <div className="flex items-center gap-2">
                {networkStats.isStable && (
                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-[10px] font-medium">Stable</span>
                  </div>
                )}
                {networkStats.packetLoss > 0 && (
                  <div className="flex items-center gap-1 text-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-[10px] font-medium">{networkStats.packetLoss}%</span>
                  </div>
                )}
              </div>
            </div>
            {renderPingGraph()}
          </div>
        </div>
      )}

      {/* Backend status */}
      <div className="p-4 pt-0">
        <div
          className={`rounded-xl p-3 border ${
            backendStatus.serverOnline
              ? "bg-gradient-to-r from-emerald-500/10 to-green-500/5 border-emerald-500/20"
              : "bg-gradient-to-r from-red-500/10 to-rose-500/5 border-red-500/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  backendStatus.serverOnline ? "bg-emerald-500/20" : "bg-red-500/20"
                }`}
              >
                <Server className={`w-4 h-4 ${backendStatus.serverOnline ? "text-emerald-400" : "text-red-400"}`} />
              </div>
              <div>
                <span
                  className={`text-xs font-bold ${backendStatus.serverOnline ? "text-emerald-400" : "text-red-400"}`}
                >
                  {backendStatus.serverOnline ? "Backend Actif" : "Backend Hors Ligne"}
                </span>
                <p className={`text-[10px] ${backendStatus.serverOnline ? "text-emerald-400/60" : "text-red-400/60"}`}>
                  {backendStatus.serverOnline
                    ? `${backendStatus.serverInfo?.connections || 0} connexions`
                    : "Demarrez backend-v4.js"}
                </p>
              </div>
            </div>
            <div className="text-right">
              {backendStatus.serverOnline && networkStats.currentPing > 0 && (
                <span className="text-lg font-mono font-bold text-emerald-400">{networkStats.currentPing}ms</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Anti-triche</span>
          </div>
          <div className="flex items-center gap-2">
            {isHost && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                HOTE
              </span>
            )}
            <Radio className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  )
}
