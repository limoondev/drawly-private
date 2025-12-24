"use client"

import { useState, useCallback } from "react"
import { LobbyScreen } from "@/components/lobby-screen"
import { GameScreen } from "@/components/game-screen"
import { GameProvider } from "@/components/game-context"

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [isHost, setIsHost] = useState(false)

  const handleJoinGame = useCallback((name: string, code: string, hosting: boolean) => {
    setPlayerName(name)
    setRoomCode(code)
    setIsHost(hosting)
    setGameStarted(true)
  }, [])

  const handleLeaveGame = useCallback(() => {
    setGameStarted(false)
    setPlayerName("")
    setRoomCode("")
    setIsHost(false)
  }, [])

  return (
    <GameProvider>
      {!gameStarted ? (
        <LobbyScreen onJoinGame={handleJoinGame} />
      ) : (
        <GameScreen playerName={playerName} roomCode={roomCode} isHost={isHost} onLeave={handleLeaveGame} />
      )}
    </GameProvider>
  )
}
