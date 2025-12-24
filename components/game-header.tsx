"use client"

import { useGame } from "@/components/game-context"
import { useNetworkStats } from "@/lib/network-monitor"
import { Button } from "@/components/ui/button"
import { Pencil, LogOut, Copy, Check, Clock, Sparkles, Signal, Wifi } from "lucide-react"
import { useState } from "react"

interface GameHeaderProps {
  roomCode: string
  onLeave: () => void
}

export function GameHeader({ roomCode, onLeave }: GameHeaderProps) {
  const { gameState } = useGame()
  const networkStats = useNetworkStats()
  const [copied, setCopied] = useState(false)

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentDrawer = gameState.players.find((p) => p.isDrawing)
  const wordHint =
    gameState.phase === "drawing" && gameState.currentWord
      ? gameState.currentWord
          .split("")
          .map((c) => (c === " " ? "  " : "_"))
          .join(" ")
      : ""

  const timerProgress = (gameState.timeLeft / 80) * 100
  const isLowTime = gameState.timeLeft <= 15

  const getPingColor = () => {
    switch (networkStats.status) {
      case "excellent":
        return "text-emerald-400"
      case "good":
        return "text-green-400"
      case "fair":
        return "text-amber-400"
      case "poor":
        return "text-orange-400"
      default:
        return "text-red-400"
    }
  }

  const getPingBg = () => {
    switch (networkStats.status) {
      case "excellent":
        return "bg-emerald-500"
      case "good":
        return "bg-green-500"
      case "fair":
        return "bg-amber-500"
      case "poor":
        return "bg-orange-500"
      default:
        return "bg-red-500"
    }
  }

  return (
    <header className="glass-strong border-b border-white/5 sticky top-0 z-20">
      <div className="max-w-[1600px] mx-auto px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg blur-md opacity-50" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary via-purple-500 to-secondary rounded-lg flex items-center justify-center shadow-xl">
                <Pencil className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Drawly
              </span>
              {gameState.phase === "drawing" && (
                <p className="text-xs text-white/40">
                  Round {gameState.round}/{gameState.maxRounds * gameState.players.length}
                </p>
              )}
            </div>
          </div>

          {/* Game info */}
          {gameState.phase === "drawing" && (
            <div className="flex items-center gap-4 flex-1 justify-center">
              {/* Timer */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  isLowTime ? "bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/20" : "glass border-white/10"
                }`}
              >
                <Clock className={`w-4 h-4 ${isLowTime ? "text-red-400 animate-pulse" : "text-white/50"}`} />
                <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isLowTime
                        ? "bg-gradient-to-r from-red-500 to-orange-500"
                        : "bg-gradient-to-r from-primary to-cyan-400"
                    }`}
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
                <span
                  className={`text-sm font-mono font-black min-w-[3ch] ${isLowTime ? "text-red-400" : "text-white"}`}
                >
                  {gameState.timeLeft}s
                </span>
              </div>

              {/* Word hint */}
              <div className="hidden md:block text-center">
                <p className="text-xs text-white/40 mb-0.5 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {currentDrawer?.name} dessine
                </p>
                <p className="text-xl font-mono tracking-[0.3em] font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {wordHint}
                </p>
              </div>
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Connection indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
              <div className="relative">
                <div className={`w-2 h-2 rounded-full ${getPingBg()}`} />
                {networkStats.status !== "offline" && (
                  <div className={`absolute inset-0 w-2 h-2 rounded-full ${getPingBg()} animate-ping opacity-75`} />
                )}
              </div>
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3 text-muted-foreground" />
                <span className={`text-xs font-mono font-bold ${getPingColor()}`}>
                  {networkStats.currentPing > 0 ? `${networkStats.currentPing}ms` : "---"}
                </span>
              </div>
              {networkStats.isStable && <Wifi className="w-3 h-3 text-emerald-400" />}
            </div>

            {/* Room code */}
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-2 px-3 py-2 glass rounded-xl hover:bg-white/10 transition-all group"
            >
              <span className="text-xs text-white/40">Code:</span>
              <span className="font-mono font-black bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent text-sm group-hover:from-white group-hover:to-purple-200 transition-all">
                {roomCode}
              </span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70" />
              )}
            </button>

            {/* Leave button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onLeave}
              className="text-white/40 hover:text-red-400 hover:bg-red-500/10 h-9 w-9 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile word hint */}
        {gameState.phase === "drawing" && (
          <div className="md:hidden mt-2 text-center py-2 glass rounded-xl">
            <p className="text-xs text-white/40">{currentDrawer?.name} dessine</p>
            <p className="text-lg font-mono tracking-[0.25em] font-black text-white">{wordHint}</p>
          </div>
        )}
      </div>
    </header>
  )
}
