"use client"

import { useGame } from "@/components/game-context"
import { Crown, Pencil, Check, Users, Sparkles } from "lucide-react"

export function PlayerList() {
  const { gameState, currentPlayerId } = useGame()
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score)

  return (
    <div className="glass-strong rounded-xl overflow-hidden h-full">
      <div className="p-2 md:p-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-white text-sm">Joueurs</span>
          </div>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            {gameState.players.length}/8
          </span>
        </div>
      </div>

      <div className="p-2 lg:space-y-1.5 lg:max-h-[400px] overflow-y-auto">
        <div className="flex lg:flex-col gap-2 lg:gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center gap-2 p-2 lg:p-2.5 rounded-xl transition-all shrink-0 lg:shrink min-w-[140px] lg:min-w-0 ${
                player.id === currentPlayerId
                  ? "bg-gradient-to-r from-primary/20 to-purple-500/10 border border-primary/30 shadow-lg shadow-primary/10"
                  : player.isDrawing
                    ? "bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20"
                    : "bg-white/5 hover:bg-white/10 border border-transparent"
              }`}
            >
              {/* Rank */}
              <span
                className={`w-5 h-5 lg:w-6 lg:h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                  index === 0 && gameState.phase !== "waiting" && player.score > 0
                    ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30"
                    : index === 1 && gameState.phase !== "waiting" && player.score > 0
                      ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
                      : index === 2 && gameState.phase !== "waiting" && player.score > 0
                        ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                        : "bg-white/10 text-white/50"
                }`}
              >
                {index === 0 && gameState.phase !== "waiting" && player.score > 0 ? (
                  <Crown className="w-3 h-3" />
                ) : (
                  index + 1
                )}
              </span>

              {/* Avatar */}
              <div
                className="w-7 h-7 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 relative shadow-lg"
                style={{
                  backgroundColor: player.avatar,
                  boxShadow: player.isDrawing ? `0 0 20px ${player.avatar}50` : undefined,
                }}
              >
                {player.name.substring(0, 2).toUpperCase()}
                {player.isDrawing && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 lg:w-4 lg:h-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-md flex items-center justify-center shadow-lg shadow-amber-500/50 animate-pulse">
                    <Pencil className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-white" />
                  </div>
                )}
                {player.hasGuessed && !player.isDrawing && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 lg:w-4 lg:h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-md flex items-center justify-center shadow-lg shadow-emerald-500/50">
                    <Check className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-white" />
                  </div>
                )}
              </div>

              {/* Name & Score */}
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-white truncate">
                  {player.name}
                  {player.id === currentPlayerId && (
                    <span className="text-primary ml-1 text-xs hidden lg:inline">(toi)</span>
                  )}
                </p>
                <p className="text-xs text-white/40 flex items-center gap-1">
                  {player.score > 0 && index === 0 && gameState.phase !== "waiting" && (
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  )}
                  {player.score} pts
                </p>
              </div>
            </div>
          ))}
        </div>

        {gameState.players.length === 0 && (
          <div className="text-center py-8 text-white/30">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun joueur</p>
          </div>
        )}
      </div>
    </div>
  )
}
