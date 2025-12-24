// Game Server - Core game logic and state management
import { v4 as uuidv4 } from "uuid"

export interface Player {
  id: string
  name: string
  score: number
  avatar: string
  isDrawing: boolean
  hasGuessed: boolean
  isHost: boolean
  isBanned: boolean
  strikes: number
  joinedAt: number
  isPremium: boolean
}

export interface Room {
  code: string
  hostId: string
  players: Player[]
  phase: "waiting" | "drawing" | "roundEnd" | "gameEnd"
  currentDrawer: string | null
  currentWord: string
  maskedWord: string
  round: number
  maxRounds: number
  drawTime: number
  timeLeft: number
  createdAt: number
  theme: string
  isPrivate: boolean
  customCode: string | null
  maxPlayers: number
}

export interface GameLog {
  id: string
  roomCode: string
  type: "join" | "leave" | "start" | "end" | "guess" | "kick" | "ban" | "warning"
  playerId: string
  playerName: string
  message: string
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface ServerStats {
  totalGames: number
  totalPlayers: number
  activeRooms: number
  activePlayers: number
  peakPlayers: number
  totalDrawings: number
  uptime: number
  lastRestart: number
}

// In-memory storage (in production, use Redis or database)
const rooms = new Map<string, Room>()
const gameLogs: GameLog[] = []
const bannedUsers = new Set<string>()
const warnings = new Map<string, number>()
const serverStats: ServerStats = {
  totalGames: 0,
  totalPlayers: 0,
  activeRooms: 0,
  activePlayers: 0,
  peakPlayers: 0,
  totalDrawings: 0,
  uptime: Date.now(),
  lastRestart: Date.now(),
}

// Word lists
const WORDS_FR = [
  "chat",
  "chien",
  "maison",
  "voiture",
  "arbre",
  "soleil",
  "lune",
  "etoile",
  "fleur",
  "oiseau",
  "poisson",
  "montagne",
  "riviere",
  "plage",
  "foret",
  "nuage",
  "pluie",
  "neige",
  "feu",
  "eau",
  "pizza",
  "gateau",
  "glace",
  "bonbon",
  "fruit",
  "legume",
  "pain",
  "fromage",
  "cafe",
  "the",
  "football",
  "basket",
  "tennis",
  "velo",
  "ski",
  "natation",
  "danse",
  "musique",
  "guitare",
  "piano",
  "livre",
  "stylo",
  "ecole",
  "bureau",
  "ordinateur",
  "telephone",
  "television",
  "camera",
  "photo",
  "film",
  "avion",
  "bateau",
  "train",
  "bus",
  "moto",
  "helicoptere",
  "fusee",
  "robot",
  "alien",
  "fantome",
  "dragon",
  "licorne",
  "sirene",
  "pirate",
  "ninja",
  "cowboy",
  "princesse",
  "roi",
  "reine",
  "chateau",
  "pont",
  "tour",
  "pyramide",
  "statue",
  "fontaine",
  "parc",
  "jardin",
  "ferme",
  "zoo",
  "cirque",
  "cinema",
  "theatre",
  "restaurant",
  "hotel",
  "hopital",
  "police",
  "pompier",
  "docteur",
  "astronaute",
  "scientifique",
  "artiste",
  "chef",
  "magicien",
  "clown",
  "superhero",
  "vampire",
  "zombie",
  "sorciere",
  "fee",
]

// Banned words for username moderation
const BANNED_WORDS = [
  "admin",
  "moderator",
  "staff",
  "support",
  "drawly",
  "system",
  // Add inappropriate words here
]

// Username moderation
export function isUsernameValid(username: string): { valid: boolean; reason?: string } {
  const normalized = username.toLowerCase().trim()

  if (normalized.length < 2) {
    return { valid: false, reason: "Le pseudo doit contenir au moins 2 caractères" }
  }

  if (normalized.length > 16) {
    return { valid: false, reason: "Le pseudo ne peut pas dépasser 16 caractères" }
  }

  if (!/^[a-zA-Z0-9_\-\s]+$/.test(username)) {
    return { valid: false, reason: "Le pseudo contient des caractères non autorisés" }
  }

  for (const word of BANNED_WORDS) {
    if (normalized.includes(word)) {
      return { valid: false, reason: "Ce pseudo n'est pas autorisé" }
    }
  }

  return { valid: true }
}

// Generate room code
export function generateRoomCode(custom?: string): string {
  if (custom) {
    // Validate custom code
    if (/^[A-Z0-9]{4,8}$/i.test(custom)) {
      return custom.toUpperCase()
    }
  }
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Generate avatar color
export function generateAvatarColor(): string {
  const colors = [
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
  return colors[Math.floor(Math.random() * colors.length)]
}

// Create room
export function createRoom(
  hostId: string,
  hostName: string,
  options?: {
    isPrivate?: boolean
    customCode?: string
    maxPlayers?: number
    theme?: string
  },
): Room {
  const code = generateRoomCode(options?.customCode)

  const room: Room = {
    code,
    hostId,
    players: [
      {
        id: hostId,
        name: hostName,
        score: 0,
        avatar: generateAvatarColor(),
        isDrawing: false,
        hasGuessed: false,
        isHost: true,
        isBanned: false,
        strikes: 0,
        joinedAt: Date.now(),
        isPremium: false,
      },
    ],
    phase: "waiting",
    currentDrawer: null,
    currentWord: "",
    maskedWord: "",
    round: 0,
    maxRounds: 3,
    drawTime: 80,
    timeLeft: 80,
    createdAt: Date.now(),
    theme: options?.theme || "galaxy",
    isPrivate: options?.isPrivate || false,
    customCode: options?.customCode || null,
    maxPlayers: options?.maxPlayers || 8,
  }

  rooms.set(code, room)
  serverStats.activeRooms++
  serverStats.totalGames++

  addLog({
    roomCode: code,
    type: "join",
    playerId: hostId,
    playerName: hostName,
    message: `${hostName} a créé la partie`,
  })

  return room
}

// Join room
export function joinRoom(
  code: string,
  playerId: string,
  playerName: string,
): { success: boolean; room?: Room; error?: string } {
  const room = rooms.get(code.toUpperCase())

  if (!room) {
    return { success: false, error: "Partie introuvable" }
  }

  if (room.players.length >= room.maxPlayers) {
    return { success: false, error: "La partie est pleine" }
  }

  if (room.phase !== "waiting") {
    return { success: false, error: "La partie a déjà commencé" }
  }

  if (bannedUsers.has(playerId)) {
    return { success: false, error: "Vous êtes banni de cette partie" }
  }

  const usernameCheck = isUsernameValid(playerName)
  if (!usernameCheck.valid) {
    return { success: false, error: usernameCheck.reason }
  }

  const player: Player = {
    id: playerId,
    name: playerName,
    score: 0,
    avatar: generateAvatarColor(),
    isDrawing: false,
    hasGuessed: false,
    isHost: false,
    isBanned: false,
    strikes: 0,
    joinedAt: Date.now(),
    isPremium: false,
  }

  room.players.push(player)
  serverStats.activePlayers++
  serverStats.totalPlayers++

  if (serverStats.activePlayers > serverStats.peakPlayers) {
    serverStats.peakPlayers = serverStats.activePlayers
  }

  addLog({
    roomCode: code,
    type: "join",
    playerId,
    playerName,
    message: `${playerName} a rejoint la partie`,
  })

  return { success: true, room }
}

// Leave room
export function leaveRoom(code: string, playerId: string): void {
  const room = rooms.get(code)
  if (!room) return

  const player = room.players.find((p) => p.id === playerId)
  if (!player) return

  room.players = room.players.filter((p) => p.id !== playerId)
  serverStats.activePlayers--

  addLog({
    roomCode: code,
    type: "leave",
    playerId,
    playerName: player.name,
    message: `${player.name} a quitté la partie`,
  })

  // If host left, transfer to next player
  if (player.isHost && room.players.length > 0) {
    room.players[0].isHost = true
    room.hostId = room.players[0].id
  }

  // Delete room if empty
  if (room.players.length === 0) {
    rooms.delete(code)
    serverStats.activeRooms--
  }
}

// Kick player
export function kickPlayer(code: string, hostId: string, targetId: string): { success: boolean; error?: string } {
  const room = rooms.get(code)
  if (!room) return { success: false, error: "Partie introuvable" }

  if (room.hostId !== hostId) {
    return { success: false, error: "Seul l'hôte peut expulser des joueurs" }
  }

  const target = room.players.find((p) => p.id === targetId)
  if (!target) return { success: false, error: "Joueur introuvable" }

  if (target.isHost) return { success: false, error: "Impossible d'expulser l'hôte" }

  room.players = room.players.filter((p) => p.id !== targetId)
  serverStats.activePlayers--

  addLog({
    roomCode: code,
    type: "kick",
    playerId: targetId,
    playerName: target.name,
    message: `${target.name} a été expulsé`,
  })

  return { success: true }
}

// Ban player
export function banPlayer(code: string, hostId: string, targetId: string): { success: boolean; error?: string } {
  const result = kickPlayer(code, hostId, targetId)
  if (!result.success) return result

  bannedUsers.add(targetId)

  const room = rooms.get(code)
  if (room) {
    addLog({
      roomCode: code,
      type: "ban",
      playerId: targetId,
      playerName: "Unknown",
      message: `Joueur banni de la partie`,
    })
  }

  return { success: true }
}

// Add warning
export function addWarning(playerId: string, reason: string): number {
  const current = warnings.get(playerId) || 0
  warnings.set(playerId, current + 1)
  return current + 1
}

// Get random word
export function getRandomWord(): string {
  return WORDS_FR[Math.floor(Math.random() * WORDS_FR.length)]
}

// Mask word
export function maskWord(word: string): string {
  return word
    .split("")
    .map((c) => (c === " " ? " " : "_"))
    .join("")
}

// Add log
export function addLog(log: Omit<GameLog, "id" | "timestamp">): void {
  gameLogs.push({
    ...log,
    id: uuidv4(),
    timestamp: Date.now(),
  })

  // Keep only last 1000 logs
  if (gameLogs.length > 1000) {
    gameLogs.shift()
  }
}

// Get logs
export function getLogs(filter?: { roomCode?: string; type?: string; limit?: number }): GameLog[] {
  let result = [...gameLogs]

  if (filter?.roomCode) {
    result = result.filter((l) => l.roomCode === filter.roomCode)
  }

  if (filter?.type) {
    result = result.filter((l) => l.type === filter.type)
  }

  result.sort((a, b) => b.timestamp - a.timestamp)

  if (filter?.limit) {
    result = result.slice(0, filter.limit)
  }

  return result
}

// Get room
export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase())
}

// Get all rooms
export function getAllRooms(): Room[] {
  return Array.from(rooms.values())
}

// Get stats
export function getStats(): ServerStats {
  return {
    ...serverStats,
    activeRooms: rooms.size,
    activePlayers: Array.from(rooms.values()).reduce((sum, r) => sum + r.players.length, 0),
  }
}

// Export for API
export const gameServer = {
  createRoom,
  joinRoom,
  leaveRoom,
  kickPlayer,
  banPlayer,
  addWarning,
  getRandomWord,
  maskWord,
  isUsernameValid,
  generateRoomCode,
  getRoom,
  getAllRooms,
  getLogs,
  getStats,
  addLog,
}
