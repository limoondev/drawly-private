"use client"

import { useGame } from "@/components/game-context"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Star, Crown, Sparkles, Rocket } from "lucide-react"
import confetti from "canvas-confetti"
import { useEffect, useMemo } from "react"

interface GameEndModalProps {
  onPlayAgain: () => void
}

function CelebrationStars() {
  const stars = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 1,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
            boxShadow: `0 0 ${star.size * 3}px rgba(255,255,255,0.5)`,
          }}
        />
      ))}
    </div>
  )
}

export function GameEndModal({ onPlayAgain }: GameEndModalProps) {
  const { gameState } = useGame()

  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score)
  const winner = sortedPlayers[0]

  useEffect(() => {
    // Multiple confetti bursts
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#a855f7", "#6366f1", "#22d3ee", "#f59e0b", "#ec4899"],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#a855f7", "#6366f1", "#22d3ee", "#f59e0b", "#ec4899"],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [])

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-[#0d0d20] via-[#0a0a1a] to-[#0d0d20] rounded-2xl border border-white/10 p-6 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
        <CelebrationStars />

        {/* Header */}
        <div className="relative z-10 mb-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-amber-400/40 to-amber-600/40 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative">
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2 animate-pulse" />
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/40">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        <h2 className="relative z-10 text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
          Partie terminee !
        </h2>
        <p className="relative z-10 text-white/60 mb-6">
          <span className="font-semibold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            {winner?.name}
          </span>{" "}
          gagne avec <span className="text-white font-bold">{winner?.score} pts</span>
        </p>

        {/* Podium */}
        <div className="relative z-10 flex items-end justify-center gap-3 mb-6">
          {/* 2nd */}
          {sortedPlayers[1] && (
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm mx-auto mb-2 shadow-xl"
                style={{ backgroundColor: sortedPlayers[1].avatar }}
              >
                {sortedPlayers[1].name.substring(0, 2).toUpperCase()}
              </div>
              <div className="bg-gradient-to-t from-slate-600 to-slate-500 rounded-t-xl p-3 h-20 flex flex-col justify-end shadow-lg">
                <Medal className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                <p className="text-xs font-medium text-white truncate w-16">{sortedPlayers[1].name}</p>
                <p className="text-xs text-white/60">{sortedPlayers[1].score}</p>
              </div>
            </div>
          )}

          {/* 1st */}
          {sortedPlayers[0] && (
            <div className="text-center -mt-4">
              <Crown className="w-6 h-6 text-amber-400 mx-auto mb-1 animate-bounce" />
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-base mx-auto mb-2 ring-4 ring-amber-400/50 shadow-2xl"
                style={{
                  backgroundColor: sortedPlayers[0].avatar,
                  boxShadow: `0 0 30px ${sortedPlayers[0].avatar}80`,
                }}
              >
                {sortedPlayers[0].name.substring(0, 2).toUpperCase()}
              </div>
              <div className="bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-xl p-3 h-24 flex flex-col justify-end shadow-xl shadow-amber-500/30">
                <Trophy className="w-6 h-6 text-amber-100 mx-auto mb-1" />
                <p className="text-sm font-bold text-white truncate w-18">{sortedPlayers[0].name}</p>
                <p className="text-sm text-amber-100 font-semibold">{sortedPlayers[0].score}</p>
              </div>
            </div>
          )}

          {/* 3rd */}
          {sortedPlayers[2] && (
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm mx-auto mb-2 shadow-xl"
                style={{ backgroundColor: sortedPlayers[2].avatar }}
              >
                {sortedPlayers[2].name.substring(0, 2).toUpperCase()}
              </div>
              <div className="bg-gradient-to-t from-amber-800 to-amber-700 rounded-t-xl p-3 h-16 flex flex-col justify-end shadow-lg">
                <Star className="w-5 h-5 text-amber-300 mx-auto mb-1" />
                <p className="text-xs font-medium text-white truncate w-16">{sortedPlayers[2].name}</p>
                <p className="text-xs text-amber-200/60">{sortedPlayers[2].score}</p>
              </div>
            </div>
          )}
        </div>

        {/* Other players */}
        {sortedPlayers.length > 3 && (
          <div className="relative z-10 mb-5 space-y-1.5">
            {sortedPlayers.slice(3).map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-2.5 glass rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 w-5">#{index + 4}</span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg"
                    style={{ backgroundColor: player.avatar }}
                  >
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-white">{player.name}</span>
                </div>
                <span className="text-white/50">{player.score} pts</span>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={onPlayAgain}
          className="relative z-10 w-full h-12 bg-gradient-to-r from-primary via-purple-500 to-primary hover:opacity-90 shadow-xl shadow-primary/30 text-white font-semibold transition-all hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5"
        >
          <Rocket className="w-5 h-5 mr-2" />
          Retour au lobby
        </Button>
      </div>
    </div>
  )
}
