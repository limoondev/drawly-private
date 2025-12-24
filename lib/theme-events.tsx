"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type ThemeEvent =
  | "default"
  | "galaxy"
  | "lava"
  | "candy"
  | "ocean"
  | "forest"
  | "neon"
  | "sunset"
  | "aurora"
  | "ice"
  | "rainbow"

export const THEME_STYLES: Record<
  ThemeEvent,
  {
    gradient: string
    accent: string
    name: string
    bgGradient: string
    starColor: string
    primaryColor: string
    secondaryColor: string
    nebulaColors: string[]
    particleType: string
    overlayEffect?: string
    icon: string
  }
> = {
  default: {
    gradient: "from-purple-600 to-cyan-500",
    accent: "purple",
    name: "Default",
    bgGradient: "from-slate-900 via-purple-900 to-slate-900",
    starColor: "#a78bfa",
    primaryColor: "#a78bfa",
    secondaryColor: "#22d3ee",
    nebulaColors: ["#7c3aed40", "#06b6d440", "#ec489940"],
    particleType: "stars",
    icon: "✨",
  },
  galaxy: {
    gradient: "from-indigo-900 via-purple-800 to-pink-700",
    accent: "indigo",
    name: "Galaxy",
    bgGradient: "from-slate-950 via-indigo-950 to-purple-950",
    starColor: "#c4b5fd",
    primaryColor: "#818cf8",
    secondaryColor: "#f0abfc",
    nebulaColors: ["#4f46e540", "#7c3aed40", "#c026d340"],
    particleType: "stars",
    icon: "🌌",
  },
  lava: {
    gradient: "from-red-600 via-orange-500 to-yellow-400",
    accent: "red",
    name: "Lava",
    bgGradient: "from-stone-950 via-red-950 to-orange-950",
    starColor: "#fbbf24",
    primaryColor: "#ef4444",
    secondaryColor: "#f97316",
    nebulaColors: ["#dc262640", "#ea580c40", "#ca8a0440"],
    particleType: "embers",
    overlayEffect: "radial-gradient(ellipse at bottom, rgba(239,68,68,0.15) 0%, transparent 70%)",
    icon: "🌋",
  },
  candy: {
    gradient: "from-pink-400 via-purple-400 to-cyan-400",
    accent: "pink",
    name: "Candy",
    bgGradient: "from-pink-950 via-fuchsia-950 to-violet-950",
    starColor: "#f9a8d4",
    primaryColor: "#ec4899",
    secondaryColor: "#a855f7",
    nebulaColors: ["#ec489940", "#d946ef40", "#8b5cf640"],
    particleType: "sparkles",
    icon: "🍬",
  },
  ocean: {
    gradient: "from-blue-900 via-cyan-700 to-teal-500",
    accent: "blue",
    name: "Ocean",
    bgGradient: "from-slate-950 via-blue-950 to-cyan-950",
    starColor: "#67e8f9",
    primaryColor: "#0ea5e9",
    secondaryColor: "#14b8a6",
    nebulaColors: ["#0284c740", "#0891b240", "#06b6d440"],
    particleType: "bubbles",
    overlayEffect: "linear-gradient(180deg, transparent 0%, rgba(6,182,212,0.1) 100%)",
    icon: "🌊",
  },
  forest: {
    gradient: "from-green-900 via-emerald-700 to-lime-500",
    accent: "green",
    name: "Forest",
    bgGradient: "from-stone-950 via-green-950 to-emerald-950",
    starColor: "#86efac",
    primaryColor: "#22c55e",
    secondaryColor: "#84cc16",
    nebulaColors: ["#16a34a40", "#059669", "#65a30d40"],
    particleType: "leaves",
    icon: "🌲",
  },
  neon: {
    gradient: "from-fuchsia-500 via-violet-600 to-cyan-400",
    accent: "fuchsia",
    name: "Neon",
    bgGradient: "from-gray-950 via-violet-950 to-fuchsia-950",
    starColor: "#e879f9",
    primaryColor: "#d946ef",
    secondaryColor: "#22d3ee",
    nebulaColors: ["#d946ef40", "#8b5cf640", "#06b6d440"],
    particleType: "prisms",
    overlayEffect: "linear-gradient(135deg, rgba(217,70,239,0.1) 0%, rgba(34,211,238,0.1) 100%)",
    icon: "💫",
  },
  sunset: {
    gradient: "from-orange-500 via-pink-500 to-purple-600",
    accent: "orange",
    name: "Sunset",
    bgGradient: "from-orange-950 via-rose-950 to-purple-950",
    starColor: "#fdba74",
    primaryColor: "#f97316",
    secondaryColor: "#ec4899",
    nebulaColors: ["#ea580c40", "#db277740", "#9333ea40"],
    particleType: "fireflies",
    overlayEffect: "linear-gradient(180deg, rgba(249,115,22,0.15) 0%, rgba(147,51,234,0.1) 100%)",
    icon: "🌅",
  },
  aurora: {
    gradient: "from-green-400 via-cyan-500 to-blue-600",
    accent: "cyan",
    name: "Aurora",
    bgGradient: "from-slate-950 via-teal-950 to-cyan-950",
    starColor: "#5eead4",
    primaryColor: "#14b8a6",
    secondaryColor: "#3b82f6",
    nebulaColors: ["#0d948840", "#0891b240", "#2563eb40"],
    particleType: "waves",
    icon: "🌌",
  },
  ice: {
    gradient: "from-blue-200 via-cyan-300 to-white",
    accent: "sky",
    name: "Ice",
    bgGradient: "from-slate-900 via-sky-950 to-cyan-950",
    starColor: "#bae6fd",
    primaryColor: "#38bdf8",
    secondaryColor: "#e0f2fe",
    nebulaColors: ["#0ea5e920", "#22d3ee20", "#e0f2fe20"],
    particleType: "snow",
    overlayEffect: "radial-gradient(ellipse at top, rgba(186,230,253,0.1) 0%, transparent 60%)",
    icon: "❄️",
  },
  rainbow: {
    gradient: "from-red-500 via-yellow-500 to-blue-500",
    accent: "amber",
    name: "Rainbow",
    bgGradient: "from-violet-950 via-fuchsia-950 to-rose-950",
    starColor: "#fcd34d",
    primaryColor: "#f59e0b",
    secondaryColor: "#ef4444",
    nebulaColors: ["#ef444430", "#eab30830", "#22c55e30", "#3b82f630", "#a855f730"],
    particleType: "prisms",
    icon: "🌈",
  },
}

interface GlobalMessage {
  id: string
  text: string
  type: "info" | "alert" | "celebration" | "event"
  expiresAt: number
}

interface ServerStats {
  totalGames: number
  totalDrawings: number
  peakPlayers: number
  activeRooms: number
  uptime: number
}

const DEFAULT_STATS: ServerStats = {
  totalGames: 0,
  totalDrawings: 0,
  peakPlayers: 0,
  activeRooms: 0,
  uptime: 0,
}

interface ThemeEventContextType {
  currentTheme: ThemeEvent
  setTheme: (theme: ThemeEvent, duration?: number) => Promise<void>
  onlineCount: number
  globalMessages: GlobalMessage[]
  sendGlobalMessage: (
    text: string,
    type?: "info" | "alert" | "celebration" | "event",
    duration?: number,
  ) => Promise<void>
  clearAllMessages: () => Promise<void>
  dismissMessage: (id: string) => void
  serverStats: ServerStats
  isConnected: boolean
  refreshStats: () => Promise<void>
}

const ThemeEventContext = createContext<ThemeEventContextType>({
  currentTheme: "galaxy",
  setTheme: async () => {},
  onlineCount: 0,
  globalMessages: [],
  sendGlobalMessage: async () => {},
  clearAllMessages: async () => {},
  dismissMessage: () => {},
  serverStats: DEFAULT_STATS,
  isConnected: false,
  refreshStats: async () => {},
})

export function useThemeEvent() {
  return useContext(ThemeEventContext)
}

interface ThemeEventProviderProps {
  children: ReactNode
}

export function ThemeEventProvider({ children }: ThemeEventProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeEvent>("galaxy")
  const [onlineCount, setOnlineCount] = useState(0)
  const [globalMessages, setGlobalMessages] = useState<GlobalMessage[]>([])
  const [serverStats, setServerStats] = useState<ServerStats>(DEFAULT_STATS)
  const [isConnected, setIsConnected] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const getBackendUrl = useCallback(() => {
    if (typeof window === "undefined") return ""
    return process.env.NEXT_PUBLIC_BACKEND_URL || "https://limoonfn.cloud/drawly/api"
  }, [])

  const fetchServerStats = useCallback(async () => {
    if (typeof window === "undefined") return
    if (!isMounted) return

    try {
      const backendUrl = getBackendUrl()
      if (!backendUrl) {
        setIsConnected(false)
        setServerStats(DEFAULT_STATS)
        setOnlineCount(0)
        return
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`${backendUrl}/status`, {
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      if (!res.ok) throw new Error("Failed to fetch stats")

      const data = await res.json()

      if (!data || typeof data !== "object") {
        setIsConnected(false)
        setServerStats(DEFAULT_STATS)
        setOnlineCount(0)
        return
      }

      setIsConnected(data.status === "ok" || data.status === "maintenance")

      if (data.stats && typeof data.stats === "object") {
        setServerStats({
          totalGames: Number(data.stats.totalGames) || 0,
          totalDrawings: Number(data.stats.totalDrawings) || 0,
          peakPlayers: Number(data.stats.peakPlayers) || 0,
          activeRooms: Number(data.stats.activeRooms) || Number(data.stats.rooms) || 0,
          uptime: Number(data.stats.uptime) || 0,
        })
        setOnlineCount(Number(data.stats.players) || 0)
      } else {
        setServerStats(DEFAULT_STATS)
        setOnlineCount(0)
      }

      if (data.theme && typeof data.theme === "string" && data.theme in THEME_STYLES) {
        setCurrentTheme(data.theme as ThemeEvent)
      }

      if (data.messages && Array.isArray(data.messages)) {
        const now = Date.now()
        const activeMessages: GlobalMessage[] = []
        for (let i = 0; i < data.messages.length; i++) {
          const m = data.messages[i]
          if (
            m &&
            typeof m === "object" &&
            typeof m.expiresAt === "number" &&
            m.expiresAt > now &&
            typeof m.text === "string"
          ) {
            activeMessages.push({
              id: String(m.id || `msg-${now}-${i}`),
              text: m.text,
              type: ["info", "alert", "celebration", "event"].includes(m.type) ? m.type : "info",
              expiresAt: m.expiresAt,
            })
          }
        }
        setGlobalMessages(activeMessages)
      }
    } catch (error) {
      setIsConnected(false)
      setServerStats(DEFAULT_STATS)
      setOnlineCount(0)
      setGlobalMessages([])
    }
  }, [isMounted, getBackendUrl])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    fetchServerStats()
    const interval = setInterval(fetchServerStats, 10000)
    return () => clearInterval(interval)
  }, [fetchServerStats, isMounted])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setGlobalMessages((prev) => {
        if (!Array.isArray(prev)) return []
        return prev.filter((m) => m && typeof m.expiresAt === "number" && m.expiresAt > now)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const setTheme = useCallback(
    async (theme: ThemeEvent, duration: number = 15 * 60 * 1000) => {
      if (typeof window === "undefined") return

      try {
        const backendUrl = getBackendUrl()
        if (!backendUrl) return

        await fetch(`${backendUrl}/admin/theme`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme, duration }),
        })
        setCurrentTheme(theme)
      } catch (error) {
        console.error("[ThemeEvents] Failed to set theme:", error)
      }
    },
    [getBackendUrl],
  )

  const sendGlobalMessage = useCallback(
    async (text: string, type: "info" | "alert" | "celebration" | "event" = "info", duration = 60000) => {
      if (typeof window === "undefined") return

      try {
        const backendUrl = getBackendUrl()
        if (!backendUrl) return

        const message: GlobalMessage = {
          id: `msg-${Date.now()}`,
          text,
          type,
          expiresAt: Date.now() + duration,
        }

        await fetch(`${backendUrl}/admin/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        })

        setGlobalMessages((prev) => (Array.isArray(prev) ? [...prev, message] : [message]))
      } catch (error) {
        console.error("[ThemeEvents] Failed to send message:", error)
      }
    },
    [getBackendUrl],
  )

  const clearAllMessages = useCallback(async () => {
    if (typeof window === "undefined") return

    try {
      const backendUrl = getBackendUrl()
      if (!backendUrl) return

      await fetch(`${backendUrl}/admin/messages/clear`, { method: "POST" })
      setGlobalMessages([])
    } catch (error) {
      console.error("[ThemeEvents] Failed to clear messages:", error)
    }
  }, [getBackendUrl])

  const dismissMessage = useCallback((id: string) => {
    setGlobalMessages((prev) => {
      if (!Array.isArray(prev)) return []
      return prev.filter((m) => m && m.id !== id)
    })
  }, [])

  const value: ThemeEventContextType = {
    currentTheme,
    setTheme,
    onlineCount,
    globalMessages: Array.isArray(globalMessages) ? globalMessages : [],
    sendGlobalMessage,
    clearAllMessages,
    dismissMessage,
    serverStats,
    isConnected,
    refreshStats: fetchServerStats,
  }

  return <ThemeEventContext.Provider value={value}>{children}</ThemeEventContext.Provider>
}
