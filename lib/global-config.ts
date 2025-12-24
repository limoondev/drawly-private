// Global server configuration stored in Supabase
// This is shared across all instances of the site

import { createClient } from "@/lib/supabase/client"

export interface GlobalServerConfig {
  id: string
  backend_url: string | null
  backend_online: boolean
  maintenance_mode: boolean
  maintenance_message: string | null
  maintenance_severity: "info" | "warning" | "critical" | null
  updated_at: string
  updated_by: string | null
}

let cachedConfig: GlobalServerConfig | null = null
let lastFetch = 0
const CACHE_TTL = 5000 // 5 seconds cache

// Get global config from Supabase
export async function getGlobalConfig(): Promise<GlobalServerConfig | null> {
  // Return cached if fresh
  if (cachedConfig && Date.now() - lastFetch < CACHE_TTL) {
    return cachedConfig
  }

  try {
    const res = await fetch("/api/admin/config", {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      console.error("[GlobalConfig] API error:", res.status)
      return cachedConfig
    }

    const data = await res.json()

    if (data.error) {
      console.error("[GlobalConfig] Error fetching:", data.error)
      return cachedConfig
    }

    cachedConfig = data as GlobalServerConfig
    lastFetch = Date.now()
    return cachedConfig
  } catch (error) {
    console.error("[GlobalConfig] Error:", error)
    return cachedConfig
  }
}

export async function updateGlobalConfig(
  updates: Partial<
    Pick<
      GlobalServerConfig,
      "backend_url" | "backend_online" | "maintenance_mode" | "maintenance_message" | "maintenance_severity"
    >
  >,
  updatedBy?: string,
): Promise<{ success: boolean; error?: string; data?: GlobalServerConfig }> {
  try {
    console.log("[GlobalConfig] Updating via API:", updates)

    const res = await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...updates,
        updated_by: updatedBy || null,
      }),
    })

    const data = await res.json()

    if (!res.ok || data.error) {
      console.error("[GlobalConfig] Update error:", data.error)
      return { success: false, error: data.error || "Failed to update config" }
    }

    // Update cache
    cachedConfig = data as GlobalServerConfig
    lastFetch = Date.now()

    console.log("[GlobalConfig] Update successful:", data)
    return { success: true, data: cachedConfig }
  } catch (error) {
    console.error("[GlobalConfig] Update error:", error)
    return { success: false, error: "Failed to update config" }
  }
}

// Subscribe to config changes in real-time
export function subscribeToConfigChanges(callback: (config: GlobalServerConfig) => void): () => void {
  const supabase = createClient()

  const channel = supabase
    .channel("server_config_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "server_config",
        filter: "id=eq.main",
      },
      (payload) => {
        const newConfig = payload.new as GlobalServerConfig
        cachedConfig = newConfig
        lastFetch = Date.now()
        callback(newConfig)
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Get backend URL from global config
export async function getGlobalBackendUrl(): Promise<string | null> {
  const config = await getGlobalConfig()
  return config?.backend_url || null
}

// Check if system is in maintenance mode
export async function isSystemInMaintenance(): Promise<{
  inMaintenance: boolean
  message?: string
  severity?: "info" | "warning" | "critical"
}> {
  const config = await getGlobalConfig()

  if (!config) {
    return { inMaintenance: false }
  }

  if (config.maintenance_mode) {
    return {
      inMaintenance: true,
      message: config.maintenance_message || "Maintenance en cours",
      severity: config.maintenance_severity || "warning",
    }
  }

  return { inMaintenance: false }
}
