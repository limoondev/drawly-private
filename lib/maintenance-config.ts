export interface MaintenanceConfig {
  enabled: boolean
  reason: string
  estimatedEndTime: number | null
  startedAt: number | null
  severity: "info" | "warning" | "critical"
  allowAdmins: boolean
  version: number
}

export const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  enabled: false,
  reason: "",
  estimatedEndTime: null,
  startedAt: null,
  severity: "info",
  allowAdmins: false,
  version: 0,
}

const MAINTENANCE_CHANNEL = "drawly_maintenance_v3"
const STORAGE_KEY = "drawly_maintenance_config_v3"
const API_CHECK_INTERVAL = 8000

// Global state
let sseConnection: EventSource | null = null
let sseReconnectTimer: ReturnType<typeof setTimeout> | null = null
let sseReconnectAttempts = 0
let lastConfig: MaintenanceConfig = DEFAULT_MAINTENANCE_CONFIG
let maintenanceChannel: BroadcastChannel | null = null
const listeners: Set<(config: MaintenanceConfig) => void> = new Set()

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

function safeGetItem(key: string): string | null {
  if (!isBrowser()) return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignore storage errors
  }
}

export function initMaintenanceBroadcast(onUpdate: (config: MaintenanceConfig) => void): () => void {
  if (!isBrowser()) return () => {}

  listeners.add(onUpdate)

  // Send current config immediately
  const currentConfig = getMaintenanceConfig()
  if (currentConfig && currentConfig.version > 0) {
    onUpdate(currentConfig)
  }

  try {
    // Initialize BroadcastChannel for cross-tab sync
    if (!maintenanceChannel) {
      maintenanceChannel = new BroadcastChannel(MAINTENANCE_CHANNEL)

      maintenanceChannel.onmessage = (event) => {
        if (event.data?.type === "maintenance_update") {
          const config = event.data.config as MaintenanceConfig
          if (config && config.version > lastConfig.version) {
            lastConfig = config
            saveMaintenanceConfigLocal(config)
            notifyListeners(config)
          }
        }
      }
    }

    // Initialize SSE for real-time global updates
    initSSE()

    // Also check backend if configured
    checkBackendMaintenance()

    // Poll API as fallback
    const pollInterval = setInterval(async () => {
      try {
        const apiConfig = await checkMaintenanceAPI()
        if (apiConfig && apiConfig.version > lastConfig.version) {
          lastConfig = apiConfig
          notifyListeners(apiConfig)
          broadcastMaintenanceUpdate(apiConfig)
        }
      } catch {
        // Ignore polling errors
      }
    }, API_CHECK_INTERVAL)

    return () => {
      listeners.delete(onUpdate)
      if (listeners.size === 0) {
        try {
          maintenanceChannel?.close()
        } catch {
          // Ignore errors
        }
        maintenanceChannel = null
        closeSSE()
      }
      clearInterval(pollInterval)
    }
  } catch {
    return () => {
      listeners.delete(onUpdate)
    }
  }
}

function notifyListeners(config: MaintenanceConfig): void {
  if (!config) return
  listeners.forEach((listener) => {
    try {
      listener(config)
    } catch {
      // Ignore listener errors
    }
  })
}

function initSSE(): void {
  if (!isBrowser() || sseConnection) return

  try {
    sseConnection = new EventSource("/api/maintenance/stream")

    sseConnection.onopen = () => {
      sseReconnectAttempts = 0
    }

    sseConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === "maintenance" || data.type === "maintenance_update") {
          const config = (data.data || data.config) as MaintenanceConfig
          if (config && config.version > lastConfig.version) {
            lastConfig = config
            saveMaintenanceConfigLocal(config)
            notifyListeners(config)
            broadcastMaintenanceUpdate(config)
          }
        }
      } catch {
        // Ignore parse errors
      }
    }

    sseConnection.onerror = () => {
      closeSSE()
      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      const delay = Math.min(1000 * Math.pow(2, sseReconnectAttempts), 30000)
      sseReconnectAttempts++
      sseReconnectTimer = setTimeout(() => initSSE(), delay)
    }
  } catch {
    // EventSource not supported or error
  }
}

function closeSSE(): void {
  if (sseConnection) {
    try {
      sseConnection.close()
    } catch {
      // Ignore errors
    }
    sseConnection = null
  }
  if (sseReconnectTimer) {
    clearTimeout(sseReconnectTimer)
    sseReconnectTimer = null
  }
}

async function checkBackendMaintenance(): Promise<void> {
  if (!isBrowser()) return

  try {
    const { getServerConfig, getBackendUrl } = await import("./server-config")
    const config = getServerConfig()
    const backendUrl = getBackendUrl(config)

    if (!backendUrl) return

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${backendUrl}/api/maintenance`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (response.ok) {
      const data = await response.json()
      if (data.config && data.config.version > lastConfig.version) {
        lastConfig = data.config
        saveMaintenanceConfigLocal(data.config)
        notifyListeners(data.config)
        broadcastMaintenanceUpdate(data.config)
      }
    }
  } catch {
    // Backend not available, ignore
  }
}

export function broadcastMaintenanceUpdate(config: MaintenanceConfig): void {
  if (!isBrowser() || !config) return

  try {
    const bc = new BroadcastChannel(MAINTENANCE_CHANNEL)
    bc.postMessage({ type: "maintenance_update", config })
    bc.close()
  } catch {
    // BroadcastChannel not supported
  }
}

function saveMaintenanceConfigLocal(config: MaintenanceConfig): void {
  if (!config) return
  safeSetItem(STORAGE_KEY, JSON.stringify(config))
}

export function getMaintenanceConfig(): MaintenanceConfig {
  if (!isBrowser()) return DEFAULT_MAINTENANCE_CONFIG

  try {
    const saved = safeGetItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_MAINTENANCE_CONFIG, ...parsed }
    }
  } catch {
    // Ignore parse errors
  }

  return DEFAULT_MAINTENANCE_CONFIG
}

export function saveMaintenanceConfig(config: MaintenanceConfig): void {
  if (!config) return
  const newConfig = { ...config, version: Date.now() }
  lastConfig = newConfig
  saveMaintenanceConfigLocal(newConfig)
  broadcastMaintenanceUpdate(newConfig)

  // Notify local API
  fetch("/api/maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newConfig),
  }).catch(() => {})

  notifyBackendMaintenance(newConfig)
}

async function notifyBackendMaintenance(config: MaintenanceConfig): Promise<void> {
  try {
    await fetch("/api/maintenance/notify-backend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })
  } catch {
    // Ignore errors
  }
}

export function formatRemainingTime(endTime: number | null | undefined): string {
  if (!endTime) return "--:--"

  const now = Date.now()
  const remaining = endTime - now

  if (remaining <= 0) return "Imminente"

  const seconds = Math.floor(remaining / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}j ${hours % 24}h ${minutes % 60}m`
  }
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
  }
  if (minutes > 0) {
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`
  }
  return `${seconds}s`
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}j ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export async function checkMaintenanceAPI(): Promise<MaintenanceConfig | null> {
  if (!isBrowser()) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch("/api/maintenance", {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (response.ok) {
      const data = await response.json()
      if (data.config) {
        return data.config as MaintenanceConfig
      }
      return data as MaintenanceConfig
    }
  } catch {
    // API not available
  }

  return null
}
