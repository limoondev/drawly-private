"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Wrench, Clock, AlertTriangle, RefreshCw, Shield, Activity, Wifi, WifiOff, Globe, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  type MaintenanceConfig,
  formatRemainingTime,
  initMaintenanceBroadcast,
  checkMaintenanceAPI,
  DEFAULT_MAINTENANCE_CONFIG,
} from "@/lib/maintenance-config"
import { useNetworkStats } from "@/lib/network-monitor"

interface MaintenanceScreenProps {
  config: MaintenanceConfig
  onCheckStatus: () => void
}

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 20,
        duration: 15 + Math.random() * 20,
        opacity: Math.random() * 0.2 + 0.05,
      })),
    [],
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 animate-float"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

function MiniPingGraph({ history }: { history: Array<{ latency: number; status: string }> }) {
  if (history.length < 3) return null

  const recent = history.slice(-12)
  const validPings = recent.filter((p) => p.latency > 0)
  if (validPings.length === 0) return null

  const maxPing = Math.max(...validPings.map((p) => p.latency), 80)

  return (
    <div className="flex items-end gap-[2px] h-5">
      {recent.map((ping, i) => {
        const height = ping.latency > 0 ? Math.max(3, (ping.latency / maxPing) * 20) : 2
        let color = "bg-red-500/30"
        if (ping.latency > 0) {
          if (ping.latency < 25) color = "bg-emerald-400"
          else if (ping.latency < 60) color = "bg-green-400"
          else if (ping.latency < 120) color = "bg-amber-400"
          else color = "bg-orange-400"
        }

        return <div key={i} className={`w-1.5 rounded-t transition-all ${color}`} style={{ height: `${height}px` }} />
      })}
    </div>
  )
}

export function MaintenanceScreen({ config: initialConfig, onCheckStatus }: MaintenanceScreenProps) {
  const [config, setConfig] = useState<MaintenanceConfig>(initialConfig || DEFAULT_MAINTENANCE_CONFIG)
  const [remainingTime, setRemainingTime] = useState<string>("")
  const [checking, setChecking] = useState(false)
  const [dots, setDots] = useState("")
  const [pulsePhase, setPulsePhase] = useState(0)
  const [mounted, setMounted] = useState(false)
  const networkStats = useNetworkStats()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Animated dots
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."))
    }, 400)
    return () => clearInterval(interval)
  }, [mounted])

  // Pulse animation
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setPulsePhase((p) => (p + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    const cleanup = initMaintenanceBroadcast((newConfig) => {
      if (newConfig) {
        setConfig(newConfig)
        if (!newConfig.enabled) {
          onCheckStatus()
        }
      }
    })

    return cleanup
  }, [mounted, onCheckStatus])

  // Timer countdown
  useEffect(() => {
    if (!mounted || !config?.estimatedEndTime) return

    const updateTimer = () => {
      if (config.estimatedEndTime) {
        setRemainingTime(formatRemainingTime(config.estimatedEndTime))
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [mounted, config?.estimatedEndTime])

  useEffect(() => {
    if (!mounted) return

    const checkAPI = async () => {
      try {
        const apiConfig = await checkMaintenanceAPI()
        if (apiConfig) {
          setConfig(apiConfig)
          if (!apiConfig.enabled) {
            onCheckStatus()
          }
        }
      } catch {
        // API check failed, keep current state
      }
    }

    // Initial check
    checkAPI()

    const interval = setInterval(checkAPI, 8000)
    return () => clearInterval(interval)
  }, [mounted, onCheckStatus])

  const handleCheck = useCallback(async () => {
    setChecking(true)
    try {
      const apiConfig = await checkMaintenanceAPI()
      if (apiConfig) {
        setConfig(apiConfig)
        if (!apiConfig.enabled) {
          onCheckStatus()
        }
      }
    } catch {
      // Check failed
    } finally {
      setTimeout(() => setChecking(false), 800)
    }
  }, [onCheckStatus])

  const getSeverityConfig = useCallback(() => {
    const severity = config?.severity || "info"
    switch (severity) {
      case "critical":
        return {
          gradient: "from-red-600/30 via-red-500/15 to-orange-600/30",
          border: "border-red-500/40",
          iconBg: "from-red-500 to-red-600",
          icon: <AlertTriangle className="w-8 h-8 text-white" />,
          glow: "shadow-2xl shadow-red-500/25",
          label: "Critique",
          labelColor: "text-red-400 bg-red-500/20 border-red-500/30",
          accentColor: "red",
        }
      case "warning":
        return {
          gradient: "from-amber-500/30 via-orange-500/15 to-yellow-500/30",
          border: "border-amber-500/40",
          iconBg: "from-amber-500 to-orange-500",
          icon: <AlertTriangle className="w-8 h-8 text-white" />,
          glow: "shadow-2xl shadow-amber-500/25",
          label: "Important",
          labelColor: "text-amber-400 bg-amber-500/20 border-amber-500/30",
          accentColor: "amber",
        }
      default:
        return {
          gradient: "from-primary/30 via-purple-500/15 to-secondary/30",
          border: "border-primary/40",
          iconBg: "from-primary to-purple-600",
          icon: <Wrench className="w-8 h-8 text-white" />,
          glow: "shadow-2xl shadow-primary/25",
          label: "Planifiee",
          labelColor: "text-primary bg-primary/20 border-primary/30",
          accentColor: "primary",
        }
    }
  }, [config?.severity])

  const severity = getSeverityConfig()

  const getPingStatusConfig = useCallback(() => {
    const status = networkStats?.status || "offline"
    switch (status) {
      case "excellent":
        return {
          color: "text-emerald-400",
          bg: "bg-emerald-500/20",
          border: "border-emerald-500/30",
          label: "Excellent",
        }
      case "good":
        return { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30", label: "Bon" }
      case "fair":
        return { color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", label: "Moyen" }
      case "poor":
        return { color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", label: "Faible" }
      default:
        return { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", label: "Hors ligne" }
    }
  }, [networkStats?.status])

  const pingStatus = getPingStatusConfig()

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${severity.gradient} opacity-50`} />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] animate-glow-pulse" />
        <div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px] animate-glow-pulse"
          style={{ animationDelay: "2s" }}
        />
        <FloatingParticles />
      </div>

      <div className="relative max-w-md w-full">
        {/* Main Card */}
        <div className={`relative glass-strong rounded-3xl overflow-hidden ${severity.glow}`}>
          {/* Animated top bar */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent relative overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              style={{ transform: `translateX(${pulsePhase - 50}%)` }}
            />
          </div>

          <div className="p-6">
            {/* Status badge */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="text-sm font-bold text-foreground">Maintenance{dots}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${severity.labelColor}`}>
                  {severity.label}
                </span>
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div
                  className={`w-24 h-24 bg-gradient-to-br ${severity.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  {severity.icon}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-foreground mb-2">Maintenance en cours</h1>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Nous ameliorons Drawly. Le service sera retabli rapidement.
              </p>
            </div>

            {/* Reason */}
            <div className="glass rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Raison</p>
                  <p className="text-sm text-foreground">
                    {config?.reason || "Maintenance programmee pour ameliorer la stabilite."}
                  </p>
                </div>
              </div>
            </div>

            {/* Timer */}
            {config?.estimatedEndTime && (
              <div className="glass rounded-xl p-4 mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-bold text-muted-foreground uppercase">Temps restant</span>
                </div>
                <div className="text-4xl font-black text-foreground font-mono tracking-wider">
                  {remainingTime || "--:--"}
                </div>
              </div>
            )}

            {/* Network status */}
            <div className={`glass rounded-xl p-3 mb-5 border ${pingStatus.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pingStatus.bg}`}>
                    {networkStats?.status === "offline" ? (
                      <WifiOff className="w-4 h-4 text-red-400" />
                    ) : (
                      <Wifi className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Connexion</p>
                    <p className={`text-sm font-bold ${pingStatus.color}`}>{pingStatus.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MiniPingGraph history={networkStats?.history || []} />
                  <div className="text-right">
                    <span className={`text-xl font-black font-mono ${pingStatus.color}`}>
                      {networkStats?.currentPing && networkStats.currentPing > 0 ? networkStats.currentPing : "---"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Check button */}
            <Button
              onClick={handleCheck}
              disabled={checking}
              className="w-full h-12 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 text-foreground border border-primary/30 rounded-xl font-bold transition-all"
              variant="outline"
            >
              {checking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verification...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verifier le statut
                </>
              )}
            </Button>

            {/* Footer */}
            <div className="text-center mt-5 space-y-2">
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  <span>Auto-sync 8s</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>Global</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/50">Drawly v4.1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
