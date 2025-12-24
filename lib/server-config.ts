// Server configuration - Backend only (no Supabase)

export interface ServerConfig {
  mode: "backend"
  backendUrl: string | null
  updatedAt?: string
  updatedBy?: string
}

const STORAGE_KEY = "drawly_server_config"

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  mode: "backend",
  backendUrl: null,
}

// Get server config from localStorage
export function getServerConfig(): ServerConfig {
  if (typeof window === "undefined") return DEFAULT_SERVER_CONFIG

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return { ...DEFAULT_SERVER_CONFIG, ...JSON.parse(saved) }
    }
  } catch {}

  return DEFAULT_SERVER_CONFIG
}

// Save server config to localStorage
export function saveServerConfig(config: ServerConfig): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent("server-config-changed", { detail: config }))
  } catch {}
}

// Get backend URL
export function getBackendUrl(config: ServerConfig): string {
  return config.backendUrl || ""
}

// Validate server address
export function isValidServerAddress(address: string): boolean {
  if (!address) return false

  try {
    if (address.includes("://")) {
      new URL(address)
      return true
    } else {
      const parts = address.split(":")
      if (parts.length === 2) {
        const port = Number.parseInt(parts[1])
        return port > 0 && port < 65536
      }
      return address.length > 0
    }
  } catch {}

  return false
}

// Test backend connection
export async function testBackendConnection(url: string): Promise<{
  success: boolean
  latency: number
  info?: {
    version: string
    connections: number
    rooms: number
    features?: string[]
    maintenance?: { enabled: boolean; reason: string }
  }
  error?: string
}> {
  const startTime = performance.now()

  try {
    let normalizedUrl = url
    if (!url.includes("://")) {
      normalizedUrl = `http://${url}`
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${normalizedUrl}/api/info`, {
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const latency = Math.round(performance.now() - startTime)

    return {
      success: true,
      latency,
      info: {
        version: data.version || "unknown",
        connections: data.stats?.connections || 0,
        rooms: data.stats?.rooms || 0,
        features: data.features || [],
        maintenance: data.maintenance,
      },
    }
  } catch (error) {
    return {
      success: false,
      latency: -1,
      error: error instanceof Error ? error.message : "Connection failed",
    }
  }
}
