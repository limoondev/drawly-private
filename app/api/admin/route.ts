import { type NextRequest, NextResponse } from "next/server"
import { gameServer } from "@/lib/game-server"

// Simple admin authentication (in production, use proper auth)
const ADMIN_KEY = process.env.ADMIN_KEY || "drawly-admin-2024"

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization")
  return authHeader === `Bearer ${ADMIN_KEY}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  switch (action) {
    case "stats":
      return NextResponse.json({
        stats: gameServer.getStats(),
        rooms: gameServer.getAllRooms(),
        logs: gameServer.getLogs({ limit: 100 }),
      })

    case "logs":
      const type = searchParams.get("type") || undefined
      const limit = Number.parseInt(searchParams.get("limit") || "100")
      return NextResponse.json({ logs: gameServer.getLogs({ type, limit }) })

    case "rooms":
      return NextResponse.json({ rooms: gameServer.getAllRooms() })

    default:
      return NextResponse.json({ error: "Action invalide" }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case "broadcast": {
        // Global message to all players
        const { message, type } = body
        gameServer.addLog({
          roomCode: "GLOBAL",
          type: "warning",
          playerId: "ADMIN",
          playerName: "Admin",
          message,
          metadata: { type, broadcast: true },
        })
        return NextResponse.json({ success: true })
      }

      case "kick-from-room": {
        const { code, targetId, adminId } = body
        const room = gameServer.getRoom(code)
        if (room) {
          gameServer.kickPlayer(code, room.hostId, targetId)
        }
        return NextResponse.json({ success: true })
      }

      case "close-room": {
        const { code } = body
        const room = gameServer.getRoom(code)
        if (room) {
          room.players.forEach((p) => gameServer.leaveRoom(code, p.id))
        }
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: "Action invalide" }, { status: 400 })
    }
  } catch (error) {
    console.error("Admin API error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
