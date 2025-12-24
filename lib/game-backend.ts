// Game Backend Client - Socket.IO based (no Supabase)
import { io, type Socket } from "socket.io-client"
import { getServerConfig, getBackendUrl } from "./server-config"

// Types
export interface Player {
  id: string
  name: string
  score: number
  roundScore: number
  avatar: string
  avatarColor: string
  isDrawing: boolean
  hasGuessed: boolean
  isHost: boolean
  isConnected: boolean
  isSpectator: boolean
  isMuted: boolean
}

export interface Room {
  id: string
  code: string
  phase: "waiting" | "choosing" | "drawing" | "roundEnd" | "gameEnd"
  round: number
  turn: number
  maxRounds: number
  timeLeft: number
  drawTime: number
  currentDrawer: string | null
  wordLength: number
  maskedWord: string
  theme: string
  isPrivate: boolean
  maxPlayers: number
  language: string
  players: Player[]
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  isCorrect: boolean
  isClose: boolean
  isSystem: boolean
  timestamp: number
}

export interface CanvasStroke {
  points: { x: number; y: number }[]
  color: string
  width: number
  tool: "pen" | "eraser"
}

export interface GameEvent {
  type: string
  payload: unknown
}

// Utility functions
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

export function isUsernameValid(username: string): { valid: boolean; reason?: string } {
  const BANNED_WORDS = ["admin", "modo", "moderateur", "system", "drawly", "bot", "server"]
  const normalized = username.toLowerCase().trim()

  if (normalized.length < 2) {
    return { valid: false, reason: "Le pseudo doit contenir au moins 2 caracteres" }
  }
  if (normalized.length > 16) {
    return { valid: false, reason: "Le pseudo ne peut pas depasser 16 caracteres" }
  }
  if (!/^[a-zA-Z0-9_\-\s]+$/.test(username)) {
    return { valid: false, reason: "Le pseudo contient des caracteres non autorises" }
  }
  for (const word of BANNED_WORDS) {
    if (normalized.includes(word)) {
      return { valid: false, reason: "Ce pseudo n'est pas autorise" }
    }
  }
  return { valid: true }
}

// Avatar colors
const AVATAR_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
]

export function generateAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

// Game Backend Service using Socket.IO
export class GameBackend {
  private socket: Socket | null = null
  private playerId: string
  private roomCode = ""
  private connected = false
  private reconnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private authToken: string | null = null

  // Event callbacks
  onRoomUpdate: ((room: Room) => void) | null = null
  onPlayersUpdate: ((players: Player[]) => void) | null = null
  onNewMessage: ((message: ChatMessage) => void) | null = null
  onCanvasStroke: ((stroke: CanvasStroke) => void) | null = null
  onCanvasClear: (() => void) | null = null
  onCanvasUndo: (() => void) | null = null
  onGameEvent: ((event: GameEvent) => void) | null = null
  onError: ((error: string) => void) | null = null
  onConnected: (() => void) | null = null
  onDisconnected: (() => void) | null = null
  onWordChoices: ((words: string[]) => void) | null = null
  onCurrentWord: ((word: string) => void) | null = null
  onCorrectGuess: ((data: { playerId: string; playerName: string; points: number }) => void) | null = null
  onTurnStart: ((data: { drawerId: string; wordLength: number; maskedWord: string; timeLeft: number }) => void) | null =
    null
  onTurnEnd: ((data: { word: string; allGuessed: boolean }) => void) | null = null
  onGameEnd: ((data: { rankings: Player[] }) => void) | null = null
  onTimeUpdate: ((timeLeft: number) => void) | null = null
  onHint: ((maskedWord: string) => void) | null = null
  onKicked: ((reason: string) => void) | null = null

  constructor(playerId: string) {
    this.playerId = playerId
    // Try to get auth token from localStorage
    if (typeof window !== "undefined") {
      this.authToken = localStorage.getItem("drawly_auth_token")
    }
  }

  private getBackendUrl(): string {
    const config = getServerConfig()
    let url = getBackendUrl(config)
    if (url && !url.includes("://")) {
      url = `http://${url}`
    }
    return url
  }

  private connect(): Promise<boolean> {
    return new Promise((resolve) => {
      const url = this.getBackendUrl()
      if (!url) {
        this.onError?.("Backend non configure")
        resolve(false)
        return
      }

      if (this.socket?.connected) {
        resolve(true)
        return
      }

      this.socket = io(url, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        auth: {
          token: this.authToken,
          playerId: this.playerId,
        },
      })

      const timeout = setTimeout(() => {
        if (!this.connected) {
          this.socket?.disconnect()
          this.onError?.("Connexion timeout")
          resolve(false)
        }
      }, 10000)

      this.socket.on("connect", () => {
        clearTimeout(timeout)
        this.connected = true
        this.reconnecting = false
        this.reconnectAttempts = 0
        console.log("[GameBackend] Connected to server")
        this.onConnected?.()
        resolve(true)
      })

      this.socket.on("disconnect", (reason) => {
        console.log("[GameBackend] Disconnected:", reason)
        this.connected = false
        this.onDisconnected?.()
      })

      this.socket.on("connect_error", (error) => {
        console.error("[GameBackend] Connection error:", error.message)
        if (!this.reconnecting) {
          this.onError?.(`Erreur de connexion: ${error.message}`)
        }
      })

      // Room events
      this.socket.on("room:sync", (data: { room: Room; players: Player[]; strokeCount: number }) => {
        this.onRoomUpdate?.(data.room)
        this.onPlayersUpdate?.(data.players)
      })

      this.socket.on("room:player_joined", (data: { player: Player }) => {
        this.onGameEvent?.({ type: "player_joined", payload: data })
      })

      this.socket.on("room:player_left", (data: { playerId: string; playerName: string }) => {
        this.onGameEvent?.({ type: "player_left", payload: data })
      })

      // Game events
      this.socket.on("game:choose_word", (data: { words: string[] }) => {
        this.onWordChoices?.(data.words)
      })

      this.socket.on("game:word", (data: { word: string }) => {
        this.onCurrentWord?.(data.word)
      })

      this.socket.on("game:turn_start", (data) => {
        this.onTurnStart?.(data)
      })

      this.socket.on("game:turn_end", (data) => {
        this.onTurnEnd?.(data)
      })

      this.socket.on("game:time_update", (data: { timeLeft: number }) => {
        this.onTimeUpdate?.(data.timeLeft)
      })

      this.socket.on("game:hint", (data: { maskedWord: string }) => {
        this.onHint?.(data.maskedWord)
      })

      this.socket.on("game:correct_guess", (data) => {
        this.onCorrectGuess?.(data)
      })

      this.socket.on("game:close_guess", () => {
        // Handle close guess notification
      })

      this.socket.on("game:ended", (data) => {
        this.onGameEnd?.(data)
      })

      this.socket.on("game:round_end", (data) => {
        this.onGameEvent?.({ type: "round_end", payload: data })
      })

      this.socket.on("game:error", (data: { message: string }) => {
        this.onError?.(data.message)
      })

      // Chat events
      this.socket.on("chat:message", (message: ChatMessage) => {
        this.onNewMessage?.(message)
      })

      this.socket.on("chat:history", (data: { messages: ChatMessage[] }) => {
        data.messages.forEach((msg) => this.onNewMessage?.(msg))
      })

      // Canvas events
      this.socket.on("draw:stroke", (stroke: CanvasStroke) => {
        this.onCanvasStroke?.(stroke)
      })

      this.socket.on("draw:clear", () => {
        this.onCanvasClear?.()
      })

      this.socket.on("draw:undo", () => {
        this.onCanvasUndo?.()
      })

      this.socket.on("draw:history", (data: { strokes: CanvasStroke[] }) => {
        data.strokes.forEach((stroke) => this.onCanvasStroke?.(stroke))
      })

      // Moderation events
      this.socket.on("player:kicked", (data: { reason: string }) => {
        this.onKicked?.(data.reason)
      })

      this.socket.on("player:banned", (data: { reason: string }) => {
        this.onKicked?.(`Banni: ${data.reason}`)
      })
    })
  }

  // Create a new room
  async createRoom(
    hostName: string,
    options?: {
      isPrivate?: boolean
      maxPlayers?: number
      theme?: string
      password?: string
      drawTime?: number
      maxRounds?: number
    },
  ): Promise<{ success: boolean; room?: Room; error?: string }> {
    const connected = await this.connect()
    if (!connected || !this.socket) {
      return { success: false, error: "Connexion au serveur impossible" }
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, error: "Timeout" })
      }, 10000)

      this.socket!.emit("room:create", {
        hostName,
        ...options,
      })

      this.socket!.once("room:created", (data: { room: Room; players: Player[] }) => {
        clearTimeout(timeout)
        this.roomCode = data.room.code
        resolve({ success: true, room: { ...data.room, players: data.players } })
      })

      this.socket!.once("room:error", (data: { error: string }) => {
        clearTimeout(timeout)
        resolve({ success: false, error: data.error })
      })
    })
  }

  // Join an existing room
  async joinRoom(
    code: string,
    playerName: string,
    password?: string,
  ): Promise<{ success: boolean; room?: Room; error?: string }> {
    const connected = await this.connect()
    if (!connected || !this.socket) {
      return { success: false, error: "Connexion au serveur impossible" }
    }

    // Validate username
    const usernameCheck = isUsernameValid(playerName)
    if (!usernameCheck.valid) {
      return { success: false, error: usernameCheck.reason }
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, error: "Timeout" })
      }, 10000)

      this.socket!.emit("room:join", {
        code: code.toUpperCase(),
        playerName,
        password,
      })

      this.socket!.once("room:joined", (data: { room: Room; players: Player[] }) => {
        clearTimeout(timeout)
        this.roomCode = data.room.code
        resolve({ success: true, room: { ...data.room, players: data.players } })
      })

      this.socket!.once("room:error", (data: { error: string }) => {
        clearTimeout(timeout)
        resolve({ success: false, error: data.error })
      })
    })
  }

  // Leave the current room
  async leaveRoom(): Promise<void> {
    if (this.socket?.connected) {
      this.socket.emit("room:leave")
    }
    this.roomCode = ""
  }

  // Disconnect from server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.connected = false
    this.roomCode = ""
  }

  // Send a chat message
  async sendMessage(message: string, playerName: string): Promise<void> {
    if (!this.socket?.connected) return
    this.socket.emit("chat:message", { message, playerName })
  }

  // Add stroke to canvas
  async addStroke(stroke: CanvasStroke): Promise<void> {
    if (!this.socket?.connected) return
    this.socket.emit("draw:stroke", stroke)
  }

  // Clear canvas
  async clearCanvas(): Promise<void> {
    if (!this.socket?.connected) return
    this.socket.emit("draw:clear")
  }

  // Undo last stroke
  async undoStroke(): Promise<void> {
    if (!this.socket?.connected) return
    this.socket.emit("draw:undo")
  }

  // Start the game (host only)
  async startGame(): Promise<void> {
    if (!this.socket?.connected) return
    this.socket.emit("game:start")
  }

  // Select a word (drawer only)
  async selectWord(word: string): Promise<void> {
    if (!this.socket?.connected) return
    this.socket.emit("game:select_word", { word })
  }

  // Skip turn (host only)
  async skipTurn(): Promise<void> {
    if (!this.socket?.connected) return
    this.socket.emit("game:skip")
  }

  // Kick a player (host only)
  async kickPlayer(targetPlayerId: string, reason?: string): Promise<void> {
    if (!this.socket?.connected) return
    this.socket.emit("player:kick", { targetPlayerId, reason })
  }

  // Ban a player (host only)
  async banPlayer(targetPlayerId: string, reason: string): Promise<void> {
    if (!this.socket?.connected) return
    this.socket.emit("player:ban", { targetPlayerId, reason })
  }

  // Report a player
  async reportPlayer(reportedId: string, reason: string, details?: string): Promise<void> {
    if (!this.socket?.connected) return
    this.socket.emit("player:report", { reportedId, reason, details })
  }

  // Update room settings (host only)
  async updateSettings(settings: {
    maxPlayers?: number
    drawTime?: number
    maxRounds?: number
    theme?: string
  }): Promise<void> {
    if (!this.socket?.connected) return
    this.socket.emit("room:settings", settings)
  }

  // Return to lobby after game ends (host only)
  async returnToLobby(): Promise<void> {
    if (!this.socket?.connected) return
    this.socket.emit("game:return_to_lobby")
  }

  // Get room code
  getRoomCode(): string {
    return this.roomCode
  }

  // Get player ID
  getPlayerId(): string {
    return this.playerId
  }

  // Check if connected
  isConnected(): boolean {
    return this.connected && !!this.socket?.connected
  }

  // Set auth token
  setAuthToken(token: string | null): void {
    this.authToken = token
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("drawly_auth_token", token)
      } else {
        localStorage.removeItem("drawly_auth_token")
      }
    }
  }
}

// Fetch public rooms from backend
export async function getPublicRooms(): Promise<{ rooms: Room[]; error?: string }> {
  try {
    const config = getServerConfig()
    let url = getBackendUrl(config)
    if (!url) return { rooms: [], error: "Backend non configure" }
    if (!url.includes("://")) url = `http://${url}`

    const response = await fetch(`${url}/api/rooms`, { timeout: 5000 } as RequestInit)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()
    return { rooms: data.rooms || [] }
  } catch (error) {
    return { rooms: [], error: error instanceof Error ? error.message : "Erreur" }
  }
}

// Get server stats
export async function getServerStats(): Promise<{
  rooms: number
  players: number
  activeRooms: number
  uptime: number
} | null> {
  try {
    const config = getServerConfig()
    let url = getBackendUrl(config)
    if (!url) return null
    if (!url.includes("://")) url = `http://${url}`

    const response = await fetch(`${url}/api/info`)
    if (!response.ok) return null

    const data = await response.json()
    return {
      rooms: data.stats?.rooms || 0,
      players: data.stats?.connections || 0,
      activeRooms: data.stats?.activeRooms || 0,
      uptime: data.stats?.uptime || 0,
    }
  } catch {
    return null
  }
}

// Get leaderboard
export async function getLeaderboard(limit = 50): Promise<{
  leaderboard: Array<{
    rank: number
    id: string
    username: string
    displayName: string
    avatarColor: string
    totalScore: number
    gamesWon: number
    gamesPlayed: number
  }>
  error?: string
}> {
  try {
    const config = getServerConfig()
    let url = getBackendUrl(config)
    if (!url) return { leaderboard: [], error: "Backend non configure" }
    if (!url.includes("://")) url = `http://${url}`

    const response = await fetch(`${url}/api/leaderboard?limit=${limit}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()
    return { leaderboard: data.leaderboard || [] }
  } catch (error) {
    return { leaderboard: [], error: error instanceof Error ? error.message : "Erreur" }
  }
}
