"use client"

import { useEffect, useState, useMemo } from "react"
import { useGame } from "@/components/game-context"
import { DrawingCanvas } from "@/components/drawing-canvas"
import { PlayerList } from "@/components/player-list"
import { ChatPanel } from "@/components/chat-panel"
import { GameHeader } from "@/components/game-header"
import { WaitingRoom } from "@/components/waiting-room"
import { RoundEndModal } from "@/components/round-end-modal"
import { GameEndModal } from "@/components/game-end-modal"
import { Loader2, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GameScreenProps {
  playerName: string
  roomCode: string
  isHost: boolean
  onLeave: () => void
}

function GameStarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 3,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
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
            boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.3)`,
          }}
        />
      ))}
    </div>
  )
}

export function GameScreen({ playerName, roomCode, isHost, onLeave }: GameScreenProps) {
  const { gameState, isConnected, connectionError, startGame, nextRound, leaveGame } = useGame()

  const [showRoundEnd, setShowRoundEnd] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [lastPhase, setLastPhase] = useState(gameState.phase)

  useEffect(() => {
    const connect = async () => {
      try {
        setIsConnecting(true)
        const initGame = (
          window as unknown as { initGame?: (name: string, code: string, host: boolean) => Promise<void> }
        ).initGame
        if (initGame) {
          await initGame(playerName, roomCode, isHost)
        }
      } catch (err) {
        console.error("[v0] Connection error:", err)
      } finally {
        setTimeout(() => setIsConnecting(false), 1000)
      }
    }

    connect()
    return () => {
      leaveGame()
    }
  }, [playerName, roomCode, isHost, leaveGame])

  useEffect(() => {
    if (gameState.phase === "roundEnd" && lastPhase !== "roundEnd") {
      setShowRoundEnd(true)
    }
    if (gameState.phase === "drawing" && lastPhase === "roundEnd") {
      setShowRoundEnd(false)
    }
    setLastPhase(gameState.phase)
  }, [gameState.phase, lastPhase])

  const handleStartGame = () => startGame()

  const handleNextRound = () => {
    setShowRoundEnd(false)
    nextRound()
  }

  const handleLeave = () => {
    leaveGame()
    onLeave()
  }

  const currentPlayer = gameState.players.find((p) => p.id === gameState.playerId)
  const isCurrentPlayerDrawing = currentPlayer?.isDrawing || false

  if (isConnecting && !isConnected) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <GameStarField />
        <div className="relative text-center glass-strong rounded-2xl p-6 md:p-8 max-w-sm w-full mx-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/40 to-secondary/40 rounded-full blur-xl animate-pulse" />
            </div>
            <div className="relative w-16 h-16 mx-auto">
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full animate-spin opacity-50"
                style={{ animationDuration: "3s" }}
              />
              <div className="absolute inset-1 bg-[#0a0a1a] rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white mb-2">Connexion en cours...</h2>
          <p className="text-sm text-white/50 mb-5">Preparation de la partie</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
            <span className="text-xs text-white/50">Code:</span>
            <span className="font-mono font-bold text-transparent bg-gradient-to-r from-primary to-cyan-400 bg-clip-text tracking-wider">
              {roomCode}
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (connectionError) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <GameStarField />
        <div className="relative glass-strong rounded-2xl p-6 md:p-8 max-w-sm w-full text-center mx-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white mb-2">Erreur de connexion</h2>
          <p className="text-sm text-white/50 mb-6">{connectionError}</p>
          <div className="space-y-2">
            <Button
              onClick={handleLeave}
              className="w-full bg-gradient-to-r from-primary to-purple-500 hover:opacity-90"
            >
              Retour au lobby
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/10 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reessayer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      <div className="relative z-10 flex flex-col h-screen">
        <GameHeader roomCode={roomCode} onLeave={handleLeave} />

        <main className="flex-1 flex flex-col lg:flex-row gap-2 md:gap-3 p-2 md:p-3 max-w-[1600px] mx-auto w-full overflow-hidden min-h-0">
          {/* Player list - horizontal on mobile, vertical on desktop */}
          <aside className="lg:w-64 shrink-0 order-2 lg:order-1">
            <PlayerList />
          </aside>

          {/* Canvas - main area */}
          <div className="flex-1 min-w-0 min-h-0 order-1 lg:order-2">
            {gameState.phase === "waiting" ? (
              <WaitingRoom onStartGame={handleStartGame} roomCode={roomCode} isHost={isHost} />
            ) : (
              <DrawingCanvas isDrawing={isCurrentPlayerDrawing} currentWord={gameState.currentWord} />
            )}
          </div>

          {/* Chat panel */}
          <aside className="lg:w-72 xl:w-80 shrink-0 order-3 h-[250px] lg:h-auto">
            <ChatPanel disabled={isCurrentPlayerDrawing} />
          </aside>
        </main>
      </div>

      {showRoundEnd && gameState.phase === "roundEnd" && (
        <RoundEndModal word={gameState.currentWord} onNext={handleNextRound} isHost={isHost} />
      )}
      {gameState.phase === "gameEnd" && <GameEndModal onPlayAgain={handleLeave} />}
    </div>
  )
}
