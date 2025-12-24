"use client"

import { useGame } from "@/components/game-context"
import { Trophy, ArrowRight, Clock, Crown, Sparkles, Rocket } from "lucide-react"
import { useEffect, useState, useRef, useMemo, useCallback } from "react"

interface RoundEndModalProps {
  word: string
  onNext: () => void
  isHost: boolean
}

function ModalStars() {
  const stars = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 2,
      duration: Math.random() * 2 + 1,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
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

export function RoundEndModal({ word, onNext, isHost }: RoundEndModalProps) {
  const { gameState } = useGame()
  const [countdown, setCountdown] = useState(5)
  const hasTriggeredRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score)

  const triggerNext = useCallback(() => {
    if (!hasTriggeredRef.current && isHost) {
      hasTriggeredRef.current = true
      onNext()
    }
  }, [isHost, onNext])

  useEffect(() => {
    hasTriggeredRef.current = false
    setCountdown(5)

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          // Host triggers next round after countdown
          if (isHost) {
            setTimeout(triggerNext, 200)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isHost, triggerNext])

  const handleManualNext = () => {
    if (isHost && !hasTriggeredRef.current) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      hasTriggeredRef.current = true
      onNext()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="relative bg-gradient-to-br from-[#0d0d20] via-[#0a0a1a] to-[#0d0d20] rounded-2xl border border-white/10 p-6 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
        <ModalStars />

        {/* Header */}
        <div className="relative z-10 mb-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400/30 to-amber-600/30 rounded-full blur-2xl animate-pulse" />
          </div>
          <div className="relative w-18 h-18 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl blur-lg opacity-50" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <h2 className="relative z-10 text-xl font-bold text-white mb-2">Fin du round !</h2>
        <p className="relative z-10 text-white/60 mb-5">
          Le mot etait :{" "}
          <span className="font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            {word}
          </span>
        </p>

        {/* Leaderboard */}
        <div className="relative z-10 glass rounded-xl p-4 mb-5">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">Classement</p>
          </div>
          <div className="space-y-2">
            {sortedPlayers.slice(0, 5).map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2.5 rounded-lg transition-all ${
                  index === 0
                    ? "bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-500/30 shadow-lg shadow-amber-500/10"
                    : "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                      index === 0
                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30"
                        : index === 1
                          ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
                          : index === 2
                            ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                            : "bg-white/10 text-white/60"
                    }`}
                  >
                    {index === 0 ? <Crown className="w-3.5 h-3.5" /> : index + 1}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg"
                    style={{ backgroundColor: player.avatar }}
                  >
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white">{player.name}</span>
                </div>
                <span className={`text-sm font-bold ${index === 0 ? "text-amber-400" : "text-white/60"}`}>
                  {player.score} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div className="relative z-10 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary/10 to-cyan-500/10 rounded-xl border border-primary/20 mb-4">
          <Clock className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm text-white">
            {countdown > 0 ? (
              <>
                Prochain round dans{" "}
                <span className="font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent text-lg tabular-nums">
                  {countdown}s
                </span>
              </>
            ) : (
              <span className="text-cyan-400 animate-pulse">Demarrage...</span>
            )}
          </span>
        </div>

        {isHost && (
          <button
            onClick={handleManualNext}
            className="relative z-10 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary via-purple-500 to-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Rocket className="w-4 h-4" />
            Passer maintenant
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
