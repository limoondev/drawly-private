"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import {
  getSocket,
  connectSocket,
  disconnectSocket,
  setBackendUrl,
  type Player,
  type ChatMessage,
  type DrawStroke,
} from "@/lib/socket-client"
import { isValidUsername } from "@/lib/words"
import type { Socket } from "socket.io-client"
import type { ServerToClientEvents, ClientToServerEvents } from "@/lib/socket-client"
import { useGlobalConfig } from "@/components/global-config-provider"

// Re-export types
export type { Player, ChatMessage, DrawStroke }

export interface GameState {
  phase: "lobby" | "waiting" | "choosing" | "drawing" | "roundEnd" | "gameEnd"
  players: Player[]
  currentDrawer: string | null
  currentWord: string
  maskedWord: string
  timeLeft: number
  round: number
  maxRounds: number
  messages: ChatMessage[]
  canvasStrokes: DrawStroke[]
  roomCode: string
  roomId: string
  playerId: string
  drawTime: number
  wordChoices: string[]
}

interface GameContextType {
  gameState: GameState
  currentPlayerId: string
  isConnected: boolean
  connectionError: string | null
  sendChatMessage: (message: string) => void
  addCanvasStroke: (stroke: DrawStroke) => void
  clearCanvas: () => void
  undoCanvas: () => void
  startGame: () => void
  nextRound: () => void
  playAgain: () => void
  selectWord: (word: string) => void
  leaveGame: () => void
  setDrawTime: (time: number) => void
  setMaxRounds: (rounds: number) => void
  kickPlayer: (playerId: string) => void
  banPlayer: (playerId: string, reason?: string) => void
  reportPlayer: (playerId: string, reason: string, details?: string) => void
  checkForCheat: (message: string) => { isCheat: boolean }
  triggerBan: () => void
  recordPasteEvent: () => void
}

const GameContext = createContext<GameContextType | null>(null)

function generateAvatarColor(): string {
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899"]
  return colors[Math.floor(Math.random() * colors.length)]
}

const initialState: GameState = {
  phase: "lobby",
  players: [],
  currentDrawer: null,
  currentWord: "",
  maskedWord: "",
  timeLeft: 80,
  round: 1,
  maxRounds: 3,
  messages: [],
  canvasStrokes: [],
  roomCode: "",
  roomId: "",
  playerId: "",
  drawTime: 80,
  wordChoices: [],
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialState)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const { backendUrl } = useGlobalConfig()

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const isHostRef = useRef(false)
  const gameStateRef = useRef(gameState)

  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  useEffect(() => {
    if (backendUrl) {
      setBackendUrl(backendUrl)
    }
  }, [backendUrl])

  // Setup socket event listeners
  const setupSocketListeners = useCallback((socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
    // Connection events
    socket.on("connect", () => {
      setIsConnected(true)
      setConnectionError(null)
    })

    socket.on("disconnect", (reason) => {
      setIsConnected(false)
      if (reason === "io server disconnect") {
        setConnectionError("Deconnecte par le serveur")
      }
    })

    socket.on("error", (data) => {
      setConnectionError(data.reason || data.message)
    })

    // Room sync
    socket.on("room:sync", (data) => {
      setGameState((prev) => ({
        ...prev,
        phase: data.room.phase as GameState["phase"],
        players: data.players,
        round: data.room.round,
        maxRounds: data.room.maxRounds,
        timeLeft: data.room.timeLeft,
        drawTime: data.room.drawTime,
        currentDrawer: data.room.currentDrawer,
        maskedWord: data.room.maskedWord || "",
      }))
    })

    socket.on("room:closed", (data) => {
      setConnectionError(data.reason)
      setGameState(initialState)
    })

    socket.on("host:changed", (data) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.id === data.newHostId ? { ...p, isHost: true } : { ...p, isHost: false })),
      }))
      if (gameStateRef.current.playerId === data.newHostId) {
        isHostRef.current = true
      }
    })

    // Game events
    socket.on("game:starting", () => {
      setGameState((prev) => ({
        ...prev,
        phase: "waiting",
        canvasStrokes: [],
      }))
    })

    socket.on("game:choose_word", (data) => {
      setGameState((prev) => ({
        ...prev,
        phase: "choosing",
        wordChoices: data.words,
      }))
    })

    socket.on("game:word", (data) => {
      setGameState((prev) => ({
        ...prev,
        currentWord: data.word,
      }))
    })

    socket.on("game:turn_start", (data) => {
      setGameState((prev) => ({
        ...prev,
        phase: "drawing",
        currentDrawer: data.drawerId,
        maskedWord: data.maskedWord,
        timeLeft: data.timeLeft,
        canvasStrokes: [],
        wordChoices: [],
        players: prev.players.map((p) => ({
          ...p,
          isDrawing: p.id === data.drawerId,
          hasGuessed: false,
        })),
      }))
    })

    socket.on("game:time_update", (data) => {
      setGameState((prev) => ({ ...prev, timeLeft: data.timeLeft }))
    })

    socket.on("game:hint", (data) => {
      setGameState((prev) => ({ ...prev, maskedWord: data.maskedWord }))
    })

    socket.on("game:correct_guess", (data) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === data.playerId ? { ...p, score: p.score + data.points, hasGuessed: true } : p,
        ),
      }))
    })

    socket.on("game:turn_end", (data) => {
      setGameState((prev) => ({
        ...prev,
        phase: "roundEnd",
        currentWord: data.word,
      }))
    })

    socket.on("game:round_end", () => {
      setGameState((prev) => ({
        ...prev,
        phase: "roundEnd",
      }))
    })

    socket.on("game:ended", () => {
      setGameState((prev) => ({
        ...prev,
        phase: "gameEnd",
      }))
    })

    // Chat
    socket.on("chat:message", (msg) => {
      setGameState((prev) => {
        if (prev.messages.some((m) => m.id === msg.id)) return prev
        return {
          ...prev,
          messages: [...prev.messages, msg],
        }
      })
    })

    // Drawing
    socket.on("draw:stroke", (stroke) => {
      setGameState((prev) => ({
        ...prev,
        canvasStrokes: [...prev.canvasStrokes, stroke],
      }))
    })

    socket.on("draw:clear", () => {
      setGameState((prev) => ({ ...prev, canvasStrokes: [] }))
    })

    socket.on("draw:undo", () => {
      setGameState((prev) => ({
        ...prev,
        canvasStrokes: prev.canvasStrokes.slice(0, -1),
      }))
    })

    // Moderation
    socket.on("player:kicked", (data) => {
      setConnectionError(data.reason)
      setGameState(initialState)
    })

    socket.on("player:banned", (data) => {
      setConnectionError(`Banni: ${data.reason}`)
      setGameState(initialState)
    })

    // Maintenance
    socket.on("maintenance:active", (data) => {
      setConnectionError(`Maintenance: ${data.reason}`)
    })

    socket.on("server:shutdown", () => {
      setConnectionError("Le serveur redemarre")
    })
  }, [])

  // Initialize game
  const initializeGame = useCallback(
    async (playerName: string, roomCode: string, hosting: boolean) => {
      const validation = isValidUsername(playerName)
      if (!validation.valid) {
        setConnectionError(validation.reason || "Pseudo invalide")
        return
      }

      try {
        await connectSocket()
        const socket = getSocket()
        socketRef.current = socket
        setupSocketListeners(socket)

        isHostRef.current = hosting
        const avatar = generateAvatarColor()

        if (hosting) {
          socket.emit(
            "room:create",
            {
              playerName,
              settings: { avatar },
            },
            (res) => {
              if (res.success && res.roomCode && res.roomId && res.playerId) {
                setGameState((prev) => ({
                  ...prev,
                  phase: "waiting",
                  roomCode: res.roomCode!,
                  roomId: res.roomId!,
                  playerId: res.playerId!,
                  players: [
                    {
                      id: res.playerId!,
                      name: playerName,
                      score: 0,
                      avatar,
                      isDrawing: false,
                      hasGuessed: false,
                      isHost: true,
                    },
                  ],
                }))
              } else {
                setConnectionError(res.error || "Erreur creation")
              }
            },
          )
        } else {
          // Get stored player ID for reconnection
          const storedPlayerId = localStorage.getItem(`drawly_player_${roomCode}`)

          socket.emit(
            "room:join",
            {
              roomCode,
              playerName,
              playerId: storedPlayerId || undefined,
            },
            (res) => {
              if (res.success && res.roomCode && res.roomId && res.playerId) {
                // Store player ID for reconnection
                localStorage.setItem(`drawly_player_${res.roomCode}`, res.playerId!)

                setGameState((prev) => ({
                  ...prev,
                  phase: res.room?.phase || "waiting",
                  roomCode: res.roomCode!,
                  roomId: res.roomId!,
                  playerId: res.playerId!,
                  drawTime: res.room?.drawTime || 80,
                  maxRounds: res.room?.maxRounds || 3,
                  messages: res.messages || [],
                }))
              } else {
                setConnectionError(res.error || "Erreur connexion")
              }
            },
          )
        }
      } catch (error) {
        console.error("[v0] Initialize error:", error)
        setConnectionError("Erreur de connexion au serveur")
      }
    },
    [setupSocketListeners],
  )

  // Send chat message
  const sendChatMessage = useCallback((message: string) => {
    if (!message.trim() || !socketRef.current) return
    socketRef.current.emit("chat:message", { message: message.trim() })
  }, [])

  // Drawing
  const addCanvasStroke = useCallback((stroke: DrawStroke) => {
    if (!socketRef.current) return
    setGameState((prev) => ({
      ...prev,
      canvasStrokes: [...prev.canvasStrokes, stroke],
    }))
    socketRef.current.emit("draw:stroke", stroke)
  }, [])

  const clearCanvas = useCallback(() => {
    if (!socketRef.current) return
    setGameState((prev) => ({ ...prev, canvasStrokes: [] }))
    socketRef.current.emit("draw:clear")
  }, [])

  const undoCanvas = useCallback(() => {
    if (!socketRef.current) return
    setGameState((prev) => ({
      ...prev,
      canvasStrokes: prev.canvasStrokes.slice(0, -1),
    }))
    socketRef.current.emit("draw:undo")
  }, [])

  // Game controls
  const startGame = useCallback(() => {
    if (!isHostRef.current || !socketRef.current) return
    socketRef.current.emit("game:start", undefined, (res) => {
      if (!res.success) {
        setConnectionError(res.error || "Erreur demarrage")
      }
    })
  }, [])

  const selectWord = useCallback((word: string) => {
    if (!socketRef.current) return
    socketRef.current.emit("game:select_word", { word })
  }, [])

  const nextRound = useCallback(() => {
    if (!isHostRef.current || !socketRef.current) return
    socketRef.current.emit("game:next_round", undefined, () => {})
  }, [])

  const playAgain = useCallback(() => {
    if (!socketRef.current) return
    socketRef.current.emit("game:play_again", undefined, () => {})
  }, [])

  // Settings
  const setDrawTime = useCallback((time: number) => {
    if (!isHostRef.current || !socketRef.current) return
    socketRef.current.emit("room:settings", { drawTime: time }, () => {})
    setGameState((prev) => ({ ...prev, drawTime: time }))
  }, [])

  const setMaxRounds = useCallback((rounds: number) => {
    if (!isHostRef.current || !socketRef.current) return
    socketRef.current.emit("room:settings", { maxRounds: rounds }, () => {})
    setGameState((prev) => ({ ...prev, maxRounds: rounds }))
  }, [])

  // Player management
  const kickPlayer = useCallback((playerId: string) => {
    if (!isHostRef.current || !socketRef.current) return
    socketRef.current.emit("player:kick", { playerId }, () => {})
  }, [])

  const banPlayer = useCallback((playerId: string, reason?: string) => {
    if (!isHostRef.current || !socketRef.current) return
    socketRef.current.emit("player:ban", { playerId, reason }, () => {})
  }, [])

  const reportPlayer = useCallback((playerId: string, reason: string, details?: string) => {
    if (!socketRef.current) return
    socketRef.current.emit("player:report", { playerId, reason, details }, () => {})
  }, [])

  // Leave game
  const leaveGame = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("room:leave")
      disconnectSocket()
      socketRef.current = null
    }

    isHostRef.current = false
    setGameState(initialState)
    setIsConnected(false)
    setConnectionError(null)
  }, [])

  // Anti-cheat stubs
  const checkForCheat = useCallback(() => ({ isCheat: false }), [])
  const triggerBan = useCallback(() => {}, [])
  const recordPasteEvent = useCallback(() => {}, [])

  // Expose to window
  useEffect(() => {
    ;(window as unknown as { initGame: typeof initializeGame }).initGame = initializeGame
  }, [initializeGame])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("room:leave")
        disconnectSocket()
      }
    }
  }, [])

  return (
    <GameContext.Provider
      value={{
        gameState,
        currentPlayerId: gameState.playerId,
        isConnected,
        connectionError,
        sendChatMessage,
        addCanvasStroke,
        clearCanvas,
        undoCanvas,
        startGame,
        nextRound,
        playAgain,
        selectWord,
        leaveGame,
        setDrawTime,
        setMaxRounds,
        kickPlayer,
        banPlayer,
        reportPlayer,
        checkForCheat,
        triggerBan,
        recordPasteEvent,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error("useGame must be used within GameProvider")
  return context
}
