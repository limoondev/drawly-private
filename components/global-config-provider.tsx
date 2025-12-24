"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import {
  getGlobalConfig,
  updateGlobalConfig,
  subscribeToConfigChanges,
  type GlobalServerConfig,
} from "@/lib/global-config"
import { MaintenanceScreen } from "@/components/maintenance-screen"
import { DEFAULT_MAINTENANCE_CONFIG } from "@/lib/maintenance-config"
import { setBackendUrl } from "@/lib/socket-client"

interface BackendStatus {
  online: boolean
  maintenance: boolean
  maintenanceMessage?: string
  maintenanceSeverity?: string
  version?: string
  stats?: {
    rooms: number
    players: number
    connections: number
    uptime: number
  }
}

interface GlobalConfigContextType {
  config: GlobalServerConfig | null
  backendStatus: BackendStatus | null
  isLoading: boolean
  backendUrl: string | null
  isInMaintenance: boolean
  refreshConfig: () => Promise<void>
  checkBackendStatus: () => Promise<void>
}

const GlobalConfigContext = createContext<GlobalConfigContextType>({
  config: null,
  backendStatus: null,
  isLoading: true,
  backendUrl: null,
  isInMaintenance: false,
  refreshConfig: async () => {},
  checkBackendStatus: async () => {},
})

export function useGlobalConfig() {
  return useContext(GlobalConfigContext)
}

const EXCLUDED_PATHS = ["/admin", "/auth", "/setup", "/status"]

const DEFAULT_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://limoonfn.cloud/drawly/api"

interface GlobalConfigProviderProps {
  children: ReactNode
}

export function GlobalConfigProvider({ children }: GlobalConfigProviderProps) {
  const pathname = usePathname()
  const [config, setConfig] = useState<GlobalServerConfig | null>(null)
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isExcludedPath = EXCLUDED_PATHS.some((path) => pathname?.startsWith(path))

  const getBackendUrlFromConfig = useCallback(() => {
    return config?.backend_url || DEFAULT_BACKEND_URL
  }, [config])

  const fetchConfig = useCallback(async () => {
    try {
      const data = await getGlobalConfig()
      setConfig(data)

      const backendUrl = data?.backend_url || DEFAULT_BACKEND_URL
      setBackendUrl(backendUrl)

      return data
    } catch (error) {
      console.error("[GlobalConfig] Failed to fetch:", error)
      setBackendUrl(DEFAULT_BACKEND_URL)
      return null
    }
  }, [])

  const checkBackendStatus = useCallback(async () => {
    const backendUrl = getBackendUrlFromConfig()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const statusRes = await fetch(`${backendUrl}/status`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      if (!statusRes.ok) {
        throw new Error(`Status ${statusRes.status}`)
      }

      const statusData = await statusRes.json()

      const newStatus: BackendStatus = {
        online: statusData.status === "ok" || statusData.status === "maintenance",
        maintenance: statusData.maintenance?.enabled || false,
        maintenanceMessage: statusData.maintenance?.message,
        maintenanceSeverity: statusData.maintenance?.severity,
        version: statusData.version,
        stats: statusData.stats
          ? {
              rooms: statusData.stats.activeRooms || statusData.rooms || 0,
              players: statusData.stats.players || statusData.players || 0,
              connections: statusData.stats.connections || statusData.stats.currentConnections || 0,
              uptime: statusData.stats.uptime || statusData.uptime || 0,
            }
          : undefined,
      }

      setBackendStatus(newStatus)

      // Update global config if status changed
      if (config && config.backend_online !== newStatus.online) {
        await updateGlobalConfig({ backend_online: newStatus.online })
      }
    } catch (error) {
      console.error("[GlobalConfig] Backend status check failed:", error)
      setBackendStatus({ online: false, maintenance: false })

      if (config && config.backend_online !== false) {
        await updateGlobalConfig({ backend_online: false })
      }
    } finally {
      setIsLoading(false)
    }
  }, [config, getBackendUrlFromConfig])

  useEffect(() => {
    const init = async () => {
      await fetchConfig()
      await checkBackendStatus()
    }
    init()

    const unsubscribe = subscribeToConfigChanges((newConfig) => {
      setConfig(newConfig)
      if (newConfig?.backend_url) {
        setBackendUrl(newConfig.backend_url)
      }
      checkBackendStatus()
    })

    const interval = setInterval(checkBackendStatus, 15000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [fetchConfig, checkBackendStatus])

  const isInMaintenance = !isExcludedPath && config?.maintenance_mode === true

  const value: GlobalConfigContextType = {
    config,
    backendStatus,
    isLoading,
    backendUrl: getBackendUrlFromConfig(),
    isInMaintenance,
    refreshConfig: fetchConfig,
    checkBackendStatus,
  }

  if (isInMaintenance) {
    return (
      <GlobalConfigContext.Provider value={value}>
        <MaintenanceScreen
          config={{
            ...DEFAULT_MAINTENANCE_CONFIG,
            enabled: true,
            reason: config?.maintenance_message || "Maintenance en cours",
            severity: (config?.maintenance_severity as "info" | "warning" | "critical") || "warning",
          }}
          onCheckStatus={checkBackendStatus}
        />
      </GlobalConfigContext.Provider>
    )
  }

  return <GlobalConfigContext.Provider value={value}>{children}</GlobalConfigContext.Provider>
}
