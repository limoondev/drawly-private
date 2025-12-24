import { type NextRequest, NextResponse } from "next/server"

// Utility functions
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function generateAvatarColor(): string {
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

const BANNED_WORDS = ["admin", "moderator", "staff", "support", "drawly", "system"]

function isUsernameValid(username: string): { valid: boolean; reason?: string } {
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  // All game logic is now handled by the backend via Socket.IO
  // This endpoint only provides basic info
  switch (action) {
    case "health":
      return NextResponse.json({ status: "ok", message: "Use Socket.IO backend for game operations" })

    default:
      return NextResponse.json(
        {
          error: "Game operations are handled via Socket.IO",
          hint: "Connect to the backend server for real-time game functionality",
        },
        { status: 400 },
      )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    // Only username validation is handled here, everything else via Socket.IO
    if (action === "validate-username") {
      const { username } = body
      const result = isUsernameValid(username)
      return NextResponse.json(result)
    }

    return NextResponse.json(
      {
        error: "Game operations are handled via Socket.IO",
        hint: "Connect to the backend server for real-time game functionality",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Game API POST error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
