// Socket.IO Client for Drawly - Auto-configured
import { io, type Socket } from "socket.io-client"

let cachedBackendUrl: string | null = null

export function setBackendUrl(url: string | null) {
  cachedBackendUrl = url
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}

export const getBackendUrl = () => {
  if (cachedBackendUrl) {
    if (!cachedBackendUrl.includes("://")) {
      return `https://${cachedBackendUrl}`
    }
    return cachedBackendUrl
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || "https://limoonfn.cloud/drawly/api"
}

const getSocketPath = () => {
  const url = getBackendUrl()
  try {
    const parsed = new URL(url)
    return `${parsed.pathname}/socket.io`.replace(/\/+/g, "/")
  } catch {
    return "/drawly/api/socket.io"
  }
}

// Types
export interface Player {
  id: string
  name: string
  score: number
  isHost: boolean
  isDrawing: boolean
  hasGuessed: boolean
  avatar: string
  isConnected?: boolean
}

export interface Room {
  id: string
  code: string
  phase: "lobby" | "waiting" | "choosing" | "drawing" | "roundEnd" | "gameEnd"
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
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
  isCorrect?: boolean
  isClose?: boolean
  isSystem?: boolean
  isGuess?: boolean
}

export interface DrawStroke {
  points: { x: number; y: number }[]
  color: string
  size: number
  tool: "brush" | "eraser"
}

export interface User {
  id: string
  email: string
  username?: string
  displayName: string
  avatarUrl?: string
  isPremium: boolean
  isAdmin: boolean
}

export interface Session {
  token: string
  expiresAt: number
}

// Socket events
export interface ServerToClientEvents {
  // Room events
  "room:sync": (data: { room: Room; players: Player[] }) => void
  "room:closed": (data: { reason: string }) => void
  "player:joined": (data: { id: string; name: string }) => void
  "player:disconnected": (data: { playerId: string; reason: string }) => void
  "host:changed": (data: { newHostId: string; newHostName: string }) => void

  // Game events
  "game:starting": (data: { countdown: number }) => void
  "game:choose_word": (data: { words: string[] }) => void
  "game:word": (data: { word: string }) => void
  "game:turn_start": (data: { drawerId: string; wordLength: number; maskedWord: string; timeLeft: number }) => void
  "game:time_update": (data: { timeLeft: number }) => void
  "game:hint": (data: { maskedWord: string }) => void
  "game:correct_guess": (data: { playerId: string; playerName: string; points: number }) => void
  "game:close_guess": (data: { message: string }) => void
  "game:turn_end": (data: { word: string; allGuessed: boolean }) => void
  "game:round_end": (data: { round: number }) => void
  "game:ended": (data: {
    rankings: { rank: number; id: string; name: string; score: number; userId?: string }[]
  }) => void
  "game:error": (data: { message: string }) => void
  "game:event": (data: { type: string; payload: Record<string, unknown> }) => void

  // Chat
  "chat:message": (data: ChatMessage) => void
  "chat:error": (data: { message: string }) => void

  // Drawing
  "draw:stroke": (data: DrawStroke) => void
  "draw:clear": () => void
  "draw:undo": () => void

  // Moderation
  "player:kicked": (data: { reason: string }) => void
  "player:banned": (data: { reason: string }) => void

  // Maintenance
  "maintenance:active": (data: { reason: string; severity: string }) => void
  "maintenance:update": (data: { enabled: boolean; reason: string; severity: string }) => void

  // Server
  "server:shutdown": (data: { message: string }) => void

  // Auth
  "auth:login": (data: { success: boolean; user?: User; error?: string }) => void

  // Error
  error: (data: { message: string; reason?: string }) => void
}

export interface ClientToServerEvents {
  // Auth
  "auth:login": (data: { token: string }, cb: (res: { success: boolean; user?: User; error?: string }) => void) => void

  // Room
  "room:create": (
    data: {
      playerName: string
      settings?: {
        isPrivate?: boolean
        maxPlayers?: number
        drawTime?: number
        rounds?: number
        theme?: string
        avatar?: string
      }
    },
    cb: (res: { success: boolean; roomCode?: string; roomId?: string; playerId?: string; error?: string }) => void,
  ) => void
  "room:join": (
    data: { roomCode: string; playerName: string; password?: string; playerId?: string },
    cb: (res: {
      success: boolean
      roomCode?: string
      roomId?: string
      playerId?: string
      room?: Room
      messages?: ChatMessage[]
      error?: string
    }) => void,
  ) => void
  "room:leave": () => void
  "room:settings": (data: { drawTime?: number; maxRounds?: number }, cb: (res: { success: boolean }) => void) => void

  // Game
  "game:start": (data: undefined, cb: (res: { success: boolean; error?: string }) => void) => void
  "game:select_word": (data: { word: string }) => void
  "game:next_round": (data: undefined, cb: (res: { success: boolean }) => void) => void
  "game:play_again": (data: undefined, cb: (res: { success: boolean }) => void) => void

  // Chat
  "chat:message": (data: { message: string }) => void

  // Drawing
  "draw:stroke": (data: DrawStroke) => void
  "draw:clear": () => void
  "draw:undo": () => void

  // Player management
  "player:kick": (data: { playerId: string }, cb: (res: { success: boolean; error?: string }) => void) => void
  "player:ban": (
    data: { playerId: string; reason?: string },
    cb: (res: { success: boolean; error?: string }) => void,
  ) => void
  "player:report": (
    data: { playerId: string; reason: string; details?: string },
    cb: (res: { success: boolean }) => void,
  ) => void
}

// Singleton socket instance
let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socketInstance) {
    const backendUrl = getBackendUrl()
    const socketPath = getSocketPath()

    socketInstance = io(backendUrl, {
      path: socketPath,
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })
  }
  return socketInstance
}

export function recreateSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}

export function connectSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    recreateSocket()
    const socket = getSocket()

    if (socket.connected) {
      resolve()
      return
    }

    const onConnect = () => {
      socket.off("connect", onConnect)
      socket.off("connect_error", onError)
      resolve()
    }

    const onError = (err: Error) => {
      socket.off("connect", onConnect)
      socket.off("connect_error", onError)
      reject(err)
    }

    socket.on("connect", onConnect)
    socket.on("connect_error", onError)
    socket.connect()

    // Timeout after 10 seconds
    setTimeout(() => {
      socket.off("connect", onConnect)
      socket.off("connect_error", onError)
      if (!socket.connected) {
        reject(new Error("Connection timeout"))
      }
    }, 10000)
  })
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect()
  }
}

export function isConnected(): boolean {
  return socketInstance?.connected ?? false
}

// Auth API calls (REST)
export async function registerUser(data: {
  email: string
  password: string
  username?: string
  displayName?: string
}): Promise<{ success: boolean; user?: User; session?: Session; error?: string }> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return res.json()
  } catch {
    return { success: false, error: "Erreur de connexion" }
  }
}

export async function loginUser(data: {
  email: string
  password: string
}): Promise<{ success: boolean; user?: User; session?: Session; error?: string }> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return res.json()
  } catch {
    return { success: false, error: "Erreur de connexion" }
  }
}

export async function logoutUser(token: string): Promise<void> {
  try {
    await fetch(`${getBackendUrl()}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {}
}

export async function getCurrentUser(
  token: string,
): Promise<{ user?: User; profile?: Record<string, unknown> } | null> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function updateProfile(
  token: string,
  data: { displayName?: string; avatarUrl?: string; bio?: string; country?: string },
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    return res.json()
  } catch {
    return { success: false, error: "Erreur de connexion" }
  }
}

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; session?: Session; error?: string }> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    return res.json()
  } catch {
    return { success: false, error: "Erreur de connexion" }
  }
}

// Server info
export async function getServerInfo(): Promise<{
  name: string
  version: string
  publicUrl: string
  ssl: boolean
  stats: { rooms: number; players: number; connections: number; uptime: number }
} | null> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/info`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function getMaintenanceStatus(): Promise<{
  enabled: boolean
  reason: string
  severity: string
  endsAt?: number
} | null> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/maintenance`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// Session storage
const SESSION_KEY = "drawly_session"

export function saveSession(session: Session): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
}

export function getStoredSession(): Session | null {
  if (typeof window === "undefined") return null
  try {
    const data = localStorage.getItem(SESSION_KEY)
    if (!data) return null
    const session = JSON.parse(data) as Session
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY)
  }
}
