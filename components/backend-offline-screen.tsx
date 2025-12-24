"use client"

import { useState, useEffect, useMemo } from "react"
import { WifiOff, RefreshCw, Server, Clock, AlertTriangle, Activity, Zap, Globe, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { checkBackendConnection, type BackendStatus } from "@/lib/backend-status"

interface BackendOfflineScreenProps {
  onRetry: () => void
  lastStatus?: BackendStatus
}

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 6 + 2,
        delay: Math.random() * 20,
        duration: 15 + Math.random() * 25,
        opacity: Math.random() * 0.2 + 0.05,
      })),
    [],
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-br from-red-500/50 to-orange-500/50 animate-float"
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

function ServerStatusIndicator({ status }: { status: "checking" | "offline" | "error" }) {
  const statusConfig = {
    checking: { color: "bg-yellow-500", text: "Verification...", animate: true },
    offline: { color: "bg-red-500", text: "Hors ligne", animate: true },
    error: { color: "bg-red-600", text: "Erreur", animate: false },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2 px-4 py-2 glass rounded-full border border-red-500/30">
      <span className="relative flex h-2.5 w-2.5">
        {config.animate && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.color}`} />
      </span>
      <span className="text-sm font-bold text-foreground">{config.text}</span>
    </div>
  )
}

export function BackendOfflineScreen({ onRetry, lastStatus }: BackendOfflineScreenProps) {
  const [checking, setChecking] = useState(false)
  const [dots, setDots] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<string | null>(lastStatus?.error || null)
  const [autoRetryIn, setAutoRetryIn] = useState(30)
  const [showDebug, setShowDebug] = useState(false)
  const [connectionLogs, setConnectionLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setConnectionLogs((prev) => [...prev.slice(-9), `[${timestamp}] ${message}`])
  }

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."))
    }, 400)
    return () => clearInterval(interval)
  }, [])

  // Auto-retry countdown
  useEffect(() => {
    if (autoRetryIn <= 0) {
      handleRetry()
      setAutoRetryIn(30)
      return
    }

    const timer = setTimeout(() => {
      setAutoRetryIn((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [autoRetryIn])

  const handleRetry = async () => {
    setChecking(true)
    setRetryCount((prev) => prev + 1)
    addLog("Tentative de connexion...")

    try {
      const status = await checkBackendConnection()
      if (status.connected) {
        addLog("Connexion etablie!")
        onRetry()
      } else {
        addLog(`Echec: ${status.error || "Serveur inaccessible"}`)
        setLastError(status.error)
        setAutoRetryIn(Math.min(30 + retryCount * 5, 60)) // Increase wait time progressively
      }
    } catch (err) {
      addLog(`Erreur: ${err instanceof Error ? err.message : "Inconnue"}`)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-orange-500/10 to-red-600/20 opacity-50" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[150px] animate-glow-pulse" />
        <div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[120px] animate-glow-pulse"
          style={{ animationDelay: "2s" }}
        />
        <FloatingParticles />
      </div>

      <div className="relative max-w-lg w-full">
        {/* Main Card */}
        <div className="relative glass-strong rounded-3xl overflow-hidden shadow-2xl shadow-red-500/20">
          {/* Animated top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-shimmer" />

          <div className="p-6 sm:p-8">
            {/* Status badge */}
            <div className="flex justify-center mb-6">
              <ServerStatusIndicator status={checking ? "checking" : "offline"} />
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-red-500/30 transform rotate-3">
                  <WifiOff className="w-14 h-14 text-white" />
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 glass rounded-2xl flex items-center justify-center border border-red-500/30 shadow-lg">
                  <Server className="w-6 h-6 text-red-400" />
                </div>
                {/* Pulse ring */}
                <div
                  className="absolute inset-0 rounded-3xl border-2 border-red-500/30 animate-ping"
                  style={{ animationDuration: "2s" }}
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2">Serveur inaccessible</h1>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Le serveur de jeu est temporairement hors ligne. Nous tentons de retablir la connexion{dots}
              </p>
            </div>

            {/* Error info */}
            {lastError && (
              <div className="glass rounded-xl p-4 mb-4 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Derniere erreur
                    </p>
                    <p className="text-sm text-foreground break-words">{lastError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-retry countdown */}
            <div className="glass rounded-xl p-5 mb-5 text-center border border-white/5">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Prochaine tentative
                </span>
              </div>
              <div className="text-5xl font-black text-foreground font-mono tabular-nums">{autoRetryIn}s</div>
              <div className="mt-3 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                  style={{ width: `${(autoRetryIn / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="glass rounded-xl p-3 text-center">
                <Activity className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground tabular-nums">{retryCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Tentatives</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <Zap className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">---</p>
                <p className="text-[10px] text-muted-foreground uppercase">Latence</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <Globe className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-red-400">OFF</p>
                <p className="text-[10px] text-muted-foreground uppercase">Status</p>
              </div>
            </div>

            {/* Retry button */}
            <Button
              onClick={handleRetry}
              disabled={checking}
              className="w-full h-14 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all text-base shadow-lg shadow-red-500/20"
            >
              {checking ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Verification en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reessayer maintenant
                </>
              )}
            </Button>

            {/* Debug toggle */}
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="w-full mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <Terminal className="w-3 h-3" />
              {showDebug ? "Masquer" : "Afficher"} les logs de connexion
            </button>

            {/* Debug logs */}
            {showDebug && (
              <div className="mt-3 glass rounded-lg p-3 max-h-32 overflow-y-auto">
                <div className="space-y-1 font-mono text-[10px]">
                  {connectionLogs.length === 0 ? (
                    <p className="text-muted-foreground/50">Aucun log disponible</p>
                  ) : (
                    connectionLogs.map((log, i) => (
                      <p key={i} className="text-muted-foreground">
                        {log}
                      </p>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-5">
              <p className="text-[10px] text-muted-foreground/50">
                Drawly v3.2.0 - Le serveur devrait etre disponible sous peu
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
