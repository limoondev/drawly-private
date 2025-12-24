"use client"

import { useGame } from "@/components/game-context"
import { useNetworkStats } from "@/lib/network-monitor"
import { Button } from "@/components/ui/button"
import { Users, Copy, Check, Loader2, Crown, Share2, Sparkles, Rocket, Signal, Wifi, WifiOff } from "lucide-react"
import { useState, useMemo } from "react"

interface WaitingRoomProps {
  onStartGame: () => void
  roomCode: string
  isHost: boolean
}

function MiniStarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

export function WaitingRoom({ onStartGame, roomCode, isHost }: WaitingRoomProps) {
  const { gameState, currentPlayerId } = useGame()
  const networkStats = useNetworkStats()
  const [copied, setCopied] = useState(false)

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareRoom = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Drawly",
          text: `Rejoins ma partie ! Code: ${roomCode}`,
          url: window.location.href,
        })
      } catch {
        copyRoomCode()
      }
    } else {
      copyRoomCode()
    }
  }

  const canStart = gameState.players.length >= 2

  const getConnectionStatus = () => {
    switch (networkStats.status) {
      case "excellent":
        return { color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Excellent" }
      case "good":
        return { color: "text-green-400", bg: "bg-green-500/20", label: "Bon" }
      case "fair":
        return { color: "text-amber-400", bg: "bg-amber-500/20", label: "Moyen" }
      case "poor":
        return { color: "text-orange-400", bg: "bg-orange-500/20", label: "Faible" }
      default:
        return { color: "text-red-400", bg: "bg-red-500/20", label: "Hors ligne" }
    }
  }

  const connectionStatus = getConnectionStatus()

  return (
    <div className="glass-strong rounded-xl overflow-hidden h-full flex flex-col relative">
      <MiniStarField />

      <div className="relative z-10 p-5 border-b border-white/5 text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur-lg opacity-50" />
          <div className="relative w-14 h-14 bg-gradient-to-br from-primary via-purple-500 to-secondary rounded-xl flex items-center justify-center shadow-2xl">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="text-xl font-black text-white mt-4">Salle d'attente</h2>
        <p className="text-sm text-white/50 mt-1">
          {isHost ? "Partage le code avec tes amis" : "En attente du lancement..."}
        </p>
      </div>

      <div className="relative z-10 flex-1 p-5 flex flex-col items-center justify-center overflow-y-auto">
        {/* Room code */}
        <div className="mb-6 text-center w-full max-w-sm">
          <p className="text-xs text-white/40 mb-2 uppercase tracking-wide font-bold">Code de la partie</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-3 px-6 py-4 glass rounded-xl transition-all flex-1 justify-center group hover:bg-white/10"
            >
              <span className="text-3xl font-mono font-black bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-[0.3em] group-hover:from-white group-hover:to-purple-200">
                {roomCode}
              </span>
              {copied ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5 text-white/40 group-hover:text-white/70" />
              )}
            </button>
            <Button
              onClick={shareRoom}
              variant="outline"
              size="icon"
              className="h-auto w-14 border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
          {copied && <p className="text-xs text-emerald-400 mt-2 font-bold animate-pulse">Code copie !</p>}
        </div>

        {/* Connection status */}
        <div className={`mb-6 w-full max-w-md p-3 rounded-xl ${connectionStatus.bg} border border-white/10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {networkStats.status === "offline" ? (
                <WifiOff className="w-4 h-4 text-red-400" />
              ) : (
                <Wifi className="w-4 h-4 text-emerald-400" />
              )}
              <span className={`text-sm font-bold ${connectionStatus.color}`}>{connectionStatus.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <Signal className="w-3 h-3 text-muted-foreground" />
              <span className={`text-sm font-mono font-bold ${connectionStatus.color}`}>
                {networkStats.currentPing > 0 ? `${networkStats.currentPing}ms` : "---"}
              </span>
            </div>
          </div>
        </div>

        {/* Players */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white">Joueurs connectes</p>
            <span className="text-xs text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 font-mono">
              {gameState.players.length}/8
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {gameState.players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-2.5 p-3 rounded-xl transition-all ${
                  player.id === currentPlayerId
                    ? "bg-gradient-to-r from-primary/20 to-purple-500/10 border border-primary/30 shadow-lg shadow-primary/10"
                    : "glass"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg"
                  style={{
                    backgroundColor: player.avatar,
                    boxShadow: `0 4px 20px ${player.avatar}50`,
                  }}
                >
                  {player.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {player.name}
                    {player.id === currentPlayerId && <span className="text-primary ml-1 text-xs">(toi)</span>}
                  </p>
                  {index === 0 && (
                    <p className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                      <Crown className="w-3 h-3" /> Hote
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 4 - gameState.players.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-dashed border-white/10"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white/20" />
                </div>
                <p className="text-xs text-white/30">En attente...</p>
              </div>
            ))}
          </div>
        </div>

        {/* Start or waiting */}
        {!isHost ? (
          <div className="flex items-center gap-2 px-5 py-3 glass rounded-xl">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm text-white/60 font-medium">En attente de l'hote...</span>
          </div>
        ) : (
          <Button
            onClick={onStartGame}
            disabled={!canStart}
            className={`h-14 px-10 text-lg font-black transition-all rounded-xl ${
              canStart
                ? "bg-gradient-to-r from-primary via-purple-500 to-primary hover:opacity-90 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5"
                : "bg-white/10 cursor-not-allowed"
            }`}
          >
            {canStart ? (
              <>
                <Rocket className="w-5 h-5 mr-2" />
                Demarrer la partie
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />2 joueurs minimum
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
