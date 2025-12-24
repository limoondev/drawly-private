// Backend connection status - Socket.IO backend only (no Supabase)
import { getServerConfig, getBackendUrl, testBackendConnection } from "@/lib/server-config"

export interface BackendStatus {
  connected: boolean
  lastCheck: number
  latency: number
  error: string | null
  version?: string
  connections?: number
  rooms?: number
}

const DEFAULT_STATUS: BackendStatus = {
  connected: false,
  lastCheck: 0,
  latency: -1,
  error: null,
}

let currentStatus: BackendStatus = DEFAULT_STATUS
const statusListeners: Set<(status: BackendStatus) => void> = new Set()
let checkInterval: ReturnType<typeof setInterval> | null = null

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

// Check backend connection via REST API
export async function checkBackendConnection(): Promise<BackendStatus> {
  if (!isBrowser()) return DEFAULT_STATUS

  const config = getServerConfig()
  const url = getBackendUrl(config)

  if (!url) {
    currentStatus = {
      connected: false,
      lastCheck: Date.now(),
      latency: -1,
      error: "Backend non configure",
    }
    notifyListeners()
    return currentStatus
  }

  const result = await testBackendConnection(url)

  if (result.success && result.info) {
    currentStatus = {
      connected: true,
      lastCheck: Date.now(),
      latency: result.latency,
      error: null,
      version: result.info.version,
      connections: result.info.connections,
      rooms: result.info.rooms,
    }
  } else {
    currentStatus = {
      connected: false,
      lastCheck: Date.now(),
      latency: -1,
      error: result.error || "Connection failed",
    }
  }

  notifyListeners()
  return currentStatus
}

// Get current status
export function getBackendStatus(): BackendStatus {
  return currentStatus
}

// Check if backend is offline
export function isBackendOffline(): boolean {
  return !currentStatus.connected
}

// Subscribe to status changes
export function subscribeToBackendStatus(listener: (status: BackendStatus) => void): () => void {
  statusListeners.add(listener)
  listener(currentStatus)
  return () => statusListeners.delete(listener)
}

// Notify listeners
function notifyListeners(): void {
  statusListeners.forEach((listener) => {
    try {
      listener(currentStatus)
    } catch {
      // Ignore
    }
  })
}

// Start monitoring
export function startBackendMonitoring(intervalMs = 30000): () => void {
  if (!isBrowser()) return () => {}

  if (checkInterval) clearInterval(checkInterval)

  checkBackendConnection()

  checkInterval = setInterval(checkBackendConnection, intervalMs)

  return () => {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }
}

// Reset status
export function resetBackendStatus(): void {
  currentStatus = DEFAULT_STATUS
  if (isBrowser()) checkBackendConnection()
}
