import { NextResponse } from "next/server"

// In-memory maintenance state with version tracking
let globalMaintenanceConfig = {
  enabled: false,
  reason: "",
  estimatedEndTime: null as number | null,
  startedAt: null as number | null,
  severity: "info" as "info" | "warning" | "critical",
  allowAdmins: false,
  version: 0,
}

// SSE clients for real-time broadcast
const sseClients = new Set<ReadableStreamDefaultController>()

// Broadcast to all SSE clients
function broadcastToClients(config: typeof globalMaintenanceConfig) {
  const message = `data: ${JSON.stringify({ type: "maintenance_update", config })}\n\n`
  sseClients.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(message))
    } catch {
      sseClients.delete(controller)
    }
  })
}

export async function GET() {
  return NextResponse.json({
    config: globalMaintenanceConfig,
    timestamp: Date.now(),
    clients: sseClients.size,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const config = body.config || body
    const adminKey = body.adminKey

    // Simple admin key validation for protected changes
    if (body.adminKey && adminKey !== process.env.ADMIN_KEY && adminKey !== "drawly-admin-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update config with new version
    globalMaintenanceConfig = {
      ...globalMaintenanceConfig,
      ...config,
      version: Date.now(),
    }

    // Broadcast to all connected clients
    broadcastToClients(globalMaintenanceConfig)

    return NextResponse.json({
      success: true,
      config: globalMaintenanceConfig,
    })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
