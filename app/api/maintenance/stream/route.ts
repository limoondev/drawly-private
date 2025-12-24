// SSE endpoint for real-time maintenance updates
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Global state shared with main maintenance route
let globalMaintenanceConfig = {
  enabled: false,
  reason: "",
  estimatedEndTime: null as number | null,
  startedAt: null as number | null,
  severity: "info" as "info" | "warning" | "critical",
  allowAdmins: false,
  version: 0,
}

const clients = new Set<ReadableStreamDefaultController>()

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller)

      // Send initial state
      const initialMessage = `data: ${JSON.stringify({ type: "maintenance_update", config: globalMaintenanceConfig })}\n\n`
      controller.enqueue(new TextEncoder().encode(initialMessage))

      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`: heartbeat\n\n`))
        } catch {
          clearInterval(heartbeat)
          clients.delete(controller)
        }
      }, 30000)
    },
    cancel(controller) {
      clients.delete(controller)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}

// Export for other routes to broadcast
export function broadcastMaintenanceUpdate(config: typeof globalMaintenanceConfig) {
  globalMaintenanceConfig = config
  const message = `data: ${JSON.stringify({ type: "maintenance_update", config })}\n\n`
  clients.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(message))
    } catch {
      clients.delete(controller)
    }
  })
}
