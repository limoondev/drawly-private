"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Shield,
  Users,
  Activity,
  RefreshCw,
  Send,
  Trash2,
  LogOut,
  MessageSquare,
  Lock,
  AlertTriangle,
  Ban,
  Settings2,
  CreditCard,
  Copy,
  Check,
  Wrench,
  Terminal,
  XCircle,
  Loader2,
  Save,
  Wifi,
  WifiOff,
  Plus,
  Flag,
  Globe,
  Play,
  Pause,
  Eye,
} from "lucide-react"
import { getGlobalConfig, updateGlobalConfig, type GlobalServerConfig } from "@/lib/global-config"
import { testBackendConnection, isValidServerAddress } from "@/lib/server-config"

interface Room {
  code: string
  host_id: string
  phase: string
  round: number
  max_rounds: number
  time_left: number
  draw_time: number
  theme: string
  is_private: boolean
  max_players: number
  created_at: number
  current_word?: string
  current_drawer?: string
  players: Array<{
    id: string
    name: string
    score: number
    is_host: boolean
    is_drawing: boolean
    has_guessed: boolean
  }>
}

interface Stats {
  totalRooms: number
  activePlayers: number
  activeGames: number
  connections: number
  uptime: number
  messagesProcessed?: number
  strokesProcessed?: number
  peakConnections?: number
}

interface TestCard {
  name: string
  number: string
  expiry: string
  cvc: string
  description: string
}

interface BanEntry {
  id: string
  ip_hash: string
  player_name: string
  reason: string
  banned_by: string
  banned_at: number
  expires_at: number
  is_permanent: boolean
}

interface BackendLog {
  timestamp: string
  type: string
  message: string
  data?: unknown
}

interface Report {
  id: string
  room_code: string
  reporter_id: string
  reporter_name: string
  reported_id: string
  reported_name: string
  reason: string
  details: string | null
  status: string
  created_at: number
}

const TEST_CARDS: TestCard[] = [
  {
    name: "Visa Success",
    number: "4242 4242 4242 4242",
    expiry: "12/28",
    cvc: "123",
    description: "Paiement reussi a chaque fois",
  },
  {
    name: "Mastercard Success",
    number: "5555 5555 5555 4444",
    expiry: "12/28",
    cvc: "123",
    description: "Paiement reussi (Mastercard)",
  },
  {
    name: "3D Secure",
    number: "4000 0025 0000 3155",
    expiry: "12/28",
    cvc: "123",
    description: "Requiert authentification 3D Secure",
  },
  {
    name: "Declined",
    number: "4000 0000 0000 0002",
    expiry: "12/28",
    cvc: "123",
    description: "Carte toujours refusee",
  },
]

const LOG_TYPE_COLORS: Record<string, string> = {
  join: "bg-emerald-500/20 text-emerald-400",
  leave: "bg-yellow-500/20 text-yellow-400",
  start: "bg-cyan-500/20 text-cyan-400",
  end: "bg-purple-500/20 text-purple-400",
  guess: "bg-blue-500/20 text-blue-400",
  kick: "bg-orange-500/20 text-orange-400",
  ban: "bg-red-500/20 text-red-400",
  warning: "bg-amber-500/20 text-amber-400",
  error: "bg-red-500/20 text-red-400",
  info: "bg-cyan-500/20 text-cyan-400",
  success: "bg-emerald-500/20 text-emerald-400",
  system: "bg-purple-500/20 text-purple-400",
  player: "bg-green-500/20 text-green-400",
  room: "bg-yellow-500/20 text-yellow-400",
  security: "bg-red-500/20 text-red-400",
  game: "bg-cyan-500/20 text-cyan-400",
}

const ADMIN_PASSWORD = "admin"

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [broadcastType, setBroadcastType] = useState<"info" | "alert" | "celebration" | "event">("info")
  const [activeTab, setActiveTab] = useState<
    "overview" | "rooms" | "logs" | "broadcast" | "moderation" | "config" | "payments" | "maintenance"
  >("config")

  const [configSaved, setConfigSaved] = useState(false)
  const [globalConfig, setGlobalConfig] = useState<GlobalServerConfig | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [stats, setStats] = useState<Stats>({
    totalRooms: 0,
    activePlayers: 0,
    activeGames: 0,
    connections: 0,
    uptime: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [copiedCard, setCopiedCard] = useState<string | null>(null)

  const [backendUrlInput, setBackendUrlInput] = useState("")
  const [backendStatus, setBackendStatus] = useState<{
    connected: boolean
    latency: number
    version?: string
    testing: boolean
  }>({ connected: false, latency: -1, testing: false })
  const [isBackendConfigured, setIsBackendConfigured] = useState(false)
  const [backendLogs, setBackendLogs] = useState<BackendLog[]>([])
  const [bans, setBans] = useState<BanEntry[]>([])
  const [newBanName, setNewBanName] = useState("")
  const [newBanReason, setNewBanReason] = useState("")
  const [newBanDuration, setNewBanDuration] = useState("3600")
  const [newBanPermanent, setNewBanPermanent] = useState(false)
  const [isSavingBackend, setIsSavingBackend] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState("")
  const [maintenanceSeverity, setMaintenanceSeverity] = useState<"info" | "warning" | "critical">("info")

  useEffect(() => {
    const loadGlobalConfig = async () => {
      const config = await getGlobalConfig()
      if (config) {
        setGlobalConfig(config)
        if (config.backend_url) {
          setBackendUrlInput(config.backend_url)
          setIsBackendConfigured(true)
        }
      }
    }
    loadGlobalConfig()
  }, [])

  useEffect(() => {
    if (backendStatus.connected && globalConfig?.backend_url) {
      setIsBackendConfigured(true)
      if (activeTab === "config") {
        setActiveTab("overview")
      }
    }
  }, [backendStatus.connected, globalConfig?.backend_url, activeTab])

  useEffect(() => {
    if (globalConfig?.backend_url && isAuthenticated) {
      testBackend(globalConfig.backend_url)
    }
  }, [globalConfig?.backend_url, isAuthenticated])

  const testBackend = useCallback(
    async (urlToTest?: string) => {
      const url = urlToTest || globalConfig?.backend_url
      if (!url) {
        setBackendStatus({ connected: false, latency: -1, testing: false })
        return false
      }

      setBackendStatus((prev) => ({ ...prev, testing: true }))

      const result = await testBackendConnection(url)

      setBackendStatus({
        connected: result.success,
        latency: result.latency,
        version: result.info?.version,
        testing: false,
      })

      if (result.success) {
        setIsBackendConfigured(true)

        try {
          const maintenanceRes = await fetch(`${url}/api/maintenance`)
          if (maintenanceRes.ok) {
            const data = await maintenanceRes.json()
            setMaintenanceEnabled(data.enabled)
            setMaintenanceMessage(data.message || "")
            setMaintenanceSeverity(data.severity || "info")
          }
        } catch {}

        // Fetch logs
        try {
          const logsRes = await fetch(`${url}/api/admin/logs`, {
            headers: { "X-Admin-Key": adminKey },
          })
          if (logsRes.ok) {
            const data = await logsRes.json()
            setBackendLogs(data.logs || [])
          }
        } catch {}

        // Fetch stats
        try {
          const statsRes = await fetch(`${url}/api/admin/stats`, {
            headers: { "X-Admin-Key": adminKey },
          })
          if (statsRes.ok) {
            const data = await statsRes.json()
            const s = data.stats || data
            setStats({
              totalRooms: s.totalRooms || s.rooms || 0,
              activePlayers: s.activePlayers || s.players || 0,
              activeGames: s.activeGames || 0,
              connections: s.connections || 0,
              uptime: s.uptime || 0,
              messagesProcessed: s.messagesProcessed,
              strokesProcessed: s.strokesProcessed,
              peakConnections: s.peakConnections,
            })
          }
        } catch {}

        // Fetch rooms with players
        try {
          const roomsRes = await fetch(`${url}/api/admin/rooms`, {
            headers: { "X-Admin-Key": adminKey },
          })
          if (roomsRes.ok) {
            const data = await roomsRes.json()
            setRooms(data.rooms || data || [])
          }
        } catch {}
      }

      return result.success
    },
    [globalConfig?.backend_url, adminKey],
  )

  const saveBackendUrl = async () => {
    if (!backendUrlInput) {
      // Clear backend URL
      setIsSavingBackend(true)
      const result = await updateGlobalConfig({ backend_url: null }, "admin")
      if (result.success) {
        setGlobalConfig((prev) => (prev ? { ...prev, backend_url: null } : null))
        setIsBackendConfigured(false)
        setBackendStatus({ connected: false, latency: -1, testing: false })
        setConfigSaved(true)
        setTimeout(() => setConfigSaved(false), 2000)
      }
      setIsSavingBackend(false)
      return
    }

    if (!isValidServerAddress(backendUrlInput)) {
      return
    }

    setIsSavingBackend(true)

    const success = await testBackend(backendUrlInput)

    if (success) {
      // Save to Supabase
      const result = await updateGlobalConfig({ backend_url: backendUrlInput }, "admin")
      if (result.success) {
        setGlobalConfig((prev) => (prev ? { ...prev, backend_url: backendUrlInput } : null))
        setIsBackendConfigured(true)
        setConfigSaved(true)
        setTimeout(() => setConfigSaved(false), 2000)
      }
    }

    setIsSavingBackend(false)
  }

  const saveMaintenanceConfig = async () => {
    if (!globalConfig?.backend_url) return

    setIsSavingBackend(true)
    try {
      const res = await fetch(`${globalConfig.backend_url}/api/admin/maintenance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify({
          enabled: maintenanceEnabled,
          message: maintenanceMessage,
          severity: maintenanceSeverity,
        }),
      })
      if (res.ok) {
        setConfigSaved(true)
        setTimeout(() => setConfigSaved(false), 2000)
      }
    } catch (err) {
      console.error("Failed to save maintenance config:", err)
    }
    setIsSavingBackend(false)
  }

  const fetchBans = useCallback(async () => {
    if (!globalConfig?.backend_url || !backendStatus.connected) return

    try {
      const res = await fetch(`${globalConfig.backend_url}/api/admin/bans`, {
        headers: { "X-Admin-Key": adminKey },
      })
      if (res.ok) {
        const data = await res.json()
        setBans(data || [])
      }
    } catch {}
  }, [globalConfig?.backend_url, backendStatus.connected, adminKey])

  const addBan = async () => {
    if (!globalConfig?.backend_url || !newBanName) return

    try {
      await fetch(`${globalConfig.backend_url}/api/admin/bans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify({
          playerName: newBanName,
          reason: newBanReason || "Non specifie",
          duration: Number.parseInt(newBanDuration),
          isPermanent: newBanPermanent,
          ipHash: "manual-" + Date.now(),
        }),
      })
      setNewBanName("")
      setNewBanReason("")
      fetchBans()
    } catch {}
  }

  const removeBan = async (banId: string) => {
    if (!globalConfig?.backend_url) return

    try {
      await fetch(`${globalConfig.backend_url}/api/admin/bans/${banId}`, {
        method: "DELETE",
        headers: { "X-Admin-Key": adminKey },
      })
      fetchBans()
    } catch {}
  }

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !backendStatus.connected) return
    setIsLoading(true)
    await testBackend()
    setIsLoading(false)
  }, [isAuthenticated, backendStatus.connected, testBackend])

  const fetchReports = useCallback(async () => {
    if (!globalConfig?.backend_url || !backendStatus.connected) return

    try {
      const res = await fetch(`${globalConfig.backend_url}/api/admin/reports`, {
        headers: { "X-Admin-Key": adminKey },
      })
      if (res.ok) {
        const data = await res.json()
        setReports(data || [])
      }
    } catch {}
  }, [globalConfig?.backend_url, backendStatus.connected, adminKey])

  useEffect(() => {
    if (isAuthenticated && backendStatus.connected) {
      fetchBans()
      fetchReports()
    }
  }, [isAuthenticated, backendStatus.connected, fetchBans, fetchReports])

  // Auto-refresh every 5 seconds when on overview or rooms tab
  useEffect(() => {
    if (!isAuthenticated || !backendStatus.connected) return
    if (activeTab !== "overview" && activeTab !== "rooms" && activeTab !== "logs") return

    const interval = setInterval(() => {
      testBackend()
    }, 5000)

    return () => clearInterval(interval)
  }, [isAuthenticated, backendStatus.connected, activeTab, testBackend])

  const handleLogin = async () => {
    if (!adminKey.trim()) {
      setLoginError("Entrez le mot de passe admin")
      return
    }

    setIsLoggingIn(true)
    setLoginError("")

    if (adminKey === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      if (globalConfig?.backend_url) {
        await testBackend(globalConfig.backend_url)
      }
    } else {
      setLoginError("Mot de passe incorrect")
    }

    setIsLoggingIn(false)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAdminKey("")
  }

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim() || !globalConfig?.backend_url) return

    try {
      await fetch(`${globalConfig.backend_url}/api/admin/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify({
          type: broadcastType,
          message: broadcastMessage,
        }),
      })
      setBroadcastMessage("")
    } catch {}
  }

  const copyCardNumber = (number: string) => {
    navigator.clipboard.writeText(number.replace(/\s/g, ""))
    setCopiedCard(number)
    setTimeout(() => setCopiedCard(null), 2000)
  }

  const updateReportStatus = async (reportId: string, status: string) => {
    if (!globalConfig?.backend_url) return

    try {
      await fetch(`${globalConfig.backend_url}/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify({ status }),
      })
      fetchReports()
    } catch {}
  }

  const deleteRoom = async (roomCode: string) => {
    if (!globalConfig?.backend_url) return

    try {
      await fetch(`${globalConfig.backend_url}/api/admin/rooms/${roomCode}`, {
        method: "DELETE",
        headers: { "X-Admin-Key": adminKey },
      })
      await testBackend()
    } catch {}
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "waiting":
        return "bg-amber-500/20 text-amber-400"
      case "choosing":
        return "bg-purple-500/20 text-purple-400"
      case "drawing":
        return "bg-emerald-500/20 text-emerald-400"
      case "roundEnd":
        return "bg-blue-500/20 text-blue-400"
      case "gameEnd":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-white/10 text-white/50"
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="glass-strong rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Admin Panel</h1>
            <p className="text-sm text-white/50">Drawly Administration</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Mot de passe</label>
              <Input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Entrez le mot de passe"
                className="h-12 bg-white/5 border-white/10 text-white"
                disabled={isLoggingIn}
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                <XCircle className="w-4 h-4" />
                {loginError}
              </div>
            )}

            <Button
              onClick={handleLogin}
              className="w-full h-12 bg-gradient-to-r from-primary to-purple-500"
              disabled={isLoggingIn || !adminKey.trim()}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Connexion
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const availableTabs =
    isBackendConfigured && backendStatus.connected
      ? [
          { id: "overview", label: "Vue d'ensemble", icon: Activity },
          { id: "rooms", label: "Parties", icon: Users },
          { id: "logs", label: "Logs", icon: Terminal },
          { id: "broadcast", label: "Broadcast", icon: MessageSquare },
          { id: "moderation", label: "Moderation", icon: Shield },
          { id: "config", label: "Config", icon: Settings2 },
          { id: "payments", label: "Paiements", icon: CreditCard },
          { id: "maintenance", label: "Maintenance", icon: Wrench },
        ]
      : [{ id: "config", label: "Configuration", icon: Settings2 }]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="glass rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Panel Admin</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-white/50">Drawly Management</p>
                {backendStatus.connected && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <Wifi className="w-3 h-3" />
                    {backendStatus.version || "v4"} - {backendStatus.latency}ms
                  </span>
                )}
                {!backendStatus.connected && isBackendConfigured && (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <WifiOff className="w-3 h-3" />
                    Deconnecte
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-purple-400">
                  <Globe className="w-3 h-3" />
                  Global
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {backendStatus.connected && (
              <Button
                onClick={() => {
                  fetchData()
                  testBackend()
                }}
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/10 bg-transparent"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Deconnexion
            </Button>
          </div>
        </header>

        {/* Navigation */}
        <nav className="glass rounded-xl p-2 mb-6 flex flex-wrap gap-2">
          {availableTabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              className={activeTab === tab.id ? "bg-primary" : "text-white/70 hover:text-white hover:bg-white/10"}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </nav>

        {/* Config Tab - Backend URL saved to Supabase */}
        {activeTab === "config" && (
          <div className="space-y-6">
            {(!isBackendConfigured || !backendStatus.connected) && (
              <div className="glass rounded-xl p-6 border border-amber-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-400 mb-2">Backend non connecte</h3>
                    <p className="text-sm text-white/60">
                      Configurez l'URL du serveur backend. Cette configuration sera partagee avec toutes les instances
                      du site.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Configuration Backend Globale</h3>
              </div>
              <p className="text-sm text-white/50 mb-4">
                L'URL est sauvegardee dans Supabase et partagee entre toutes les instances du site.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">URL du serveur</label>
                  <div className="flex gap-2">
                    <Input
                      value={backendUrlInput}
                      onChange={(e) => setBackendUrlInput(e.target.value)}
                      placeholder="http://localhost:3001 ou https://votre-serveur.com"
                      className="flex-1 bg-white/5 border-white/10 text-white"
                    />
                    <Button
                      onClick={saveBackendUrl}
                      disabled={isSavingBackend || backendStatus.testing}
                      className="bg-primary"
                    >
                      {isSavingBackend || backendStatus.testing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : configSaved ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {backendStatus.connected && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <Wifi className="w-4 h-4" />
                    Connecte ({backendStatus.latency}ms) - {backendStatus.version}
                  </div>
                )}

                {globalConfig?.updated_at && (
                  <div className="text-xs text-white/30">
                    Derniere mise a jour: {new Date(globalConfig.updated_at).toLocaleString()}
                    {globalConfig.updated_by && ` par ${globalConfig.updated_by}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab with more stats */}
        {activeTab === "overview" && backendStatus.connected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-4">
                <div className="text-3xl font-bold text-white">{stats.totalRooms}</div>
                <div className="text-sm text-white/50">Parties actives</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-3xl font-bold text-white">{stats.activePlayers}</div>
                <div className="text-sm text-white/50">Joueurs</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-3xl font-bold text-white">{stats.connections}</div>
                <div className="text-sm text-white/50">Connexions</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-3xl font-bold text-white">{Math.floor(stats.uptime / 60)}m</div>
                <div className="text-sm text-white/50">Uptime</div>
              </div>
            </div>

            {/* Extended stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4">
                <div className="text-xl font-bold text-cyan-400">{stats.messagesProcessed || 0}</div>
                <div className="text-xs text-white/50">Messages traites</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-xl font-bold text-purple-400">{stats.strokesProcessed || 0}</div>
                <div className="text-xs text-white/50">Traits dessines</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-xl font-bold text-amber-400">{stats.peakConnections || stats.connections}</div>
                <div className="text-xs text-white/50">Pic connexions</div>
              </div>
            </div>

            {/* Quick room list */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Parties en cours</h3>
              <div className="grid gap-3">
                {rooms
                  .filter((r) => r.phase === "drawing" || r.phase === "choosing")
                  .slice(0, 5)
                  .map((room) => (
                    <div key={room.code} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${getPhaseColor(room.phase)}`}>
                          {room.phase}
                        </div>
                        <div>
                          <div className="font-bold text-white">{room.code}</div>
                          <div className="text-xs text-white/50">
                            {room.players?.length || 0} joueurs - Round {room.round}/{room.max_rounds}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedRoom(room)}
                        variant="ghost"
                        size="sm"
                        className="text-white/50 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                {rooms.filter((r) => r.phase === "drawing" || r.phase === "choosing").length === 0 && (
                  <div className="text-center text-white/50 py-4">Aucune partie en cours</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rooms Tab with detailed view */}
        {activeTab === "rooms" && backendStatus.connected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Toutes les parties ({rooms.length})</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {rooms.map((room) => (
                  <div
                    key={room.code}
                    onClick={() => setSelectedRoom(room)}
                    className={`bg-white/5 rounded-lg p-4 cursor-pointer transition-all hover:bg-white/10 ${selectedRoom?.code === room.code ? "ring-2 ring-primary" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-white text-lg">{room.code}</div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getPhaseColor(room.phase)}`}>
                        {room.phase}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span>{room.players?.length || 0} joueurs</span>
                      <span>
                        Round {room.round}/{room.max_rounds}
                      </span>
                      <span>{room.time_left}s</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteRoom(room.code)
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
                {rooms.length === 0 && <div className="text-center text-white/50 py-8">Aucune partie active</div>}
              </div>
            </div>

            {/* Room detail panel */}
            <div className="glass rounded-xl p-6">
              {selectedRoom ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Partie {selectedRoom.code}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPhaseColor(selectedRoom.phase)}`}>
                      {selectedRoom.phase}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/50">Round</div>
                      <div className="text-xl font-bold text-white">
                        {selectedRoom.round}/{selectedRoom.max_rounds}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/50">Temps</div>
                      <div className="text-xl font-bold text-white">{selectedRoom.time_left}s</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/50">Draw Time</div>
                      <div className="text-xl font-bold text-white">{selectedRoom.draw_time}s</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/50">Theme</div>
                      <div className="text-xl font-bold text-white">{selectedRoom.theme || "general"}</div>
                    </div>
                  </div>

                  {selectedRoom.current_word && (
                    <div className="bg-primary/20 rounded-lg p-3 mb-4">
                      <div className="text-xs text-primary">Mot actuel</div>
                      <div className="text-lg font-bold text-white">{selectedRoom.current_word}</div>
                    </div>
                  )}

                  <h4 className="text-sm font-bold text-white/70 mb-3">
                    Joueurs ({selectedRoom.players?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {selectedRoom.players?.map((player) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${player.is_drawing ? "bg-emerald-500/20" : "bg-white/5"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${player.is_drawing ? "bg-emerald-500" : "bg-white/10"}`}
                          >
                            {player.is_drawing ? (
                              <Play className="w-4 h-4 text-white" />
                            ) : player.has_guessed ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <span className="text-xs text-white/50">{player.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white flex items-center gap-2">
                              {player.name}
                              {player.is_host && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                                  HOST
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-white/50">
                              {player.is_drawing ? "Dessine" : player.has_guessed ? "A devine" : "En attente"}
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-white">{player.score}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-white/50">
                  <Eye className="w-12 h-12 mb-4 opacity-50" />
                  <p>Selectionnez une partie pour voir les details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && backendStatus.connected && (
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Logs du serveur ({backendLogs.length})</h3>
              <Button
                onClick={() => testBackend()}
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/10 bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
            <div className="bg-black/30 rounded-lg p-4 max-h-[600px] overflow-y-auto font-mono text-sm">
              {backendLogs.length > 0 ? (
                backendLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-white/30 text-xs shrink-0">{log.timestamp}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${LOG_TYPE_COLORS[log.type] || "bg-white/10 text-white/50"}`}
                    >
                      {log.type}
                    </span>
                    <span className="text-white/80">{log.message}</span>
                    {log.data && (
                      <span className="text-white/30 text-xs">{JSON.stringify(log.data).slice(0, 100)}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-white/50 py-8">Aucun log disponible</div>
              )}
            </div>
          </div>
        )}

        {/* Broadcast Tab */}
        {activeTab === "broadcast" && backendStatus.connected && (
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Broadcast</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                {(["info", "alert", "celebration", "event"] as const).map((type) => (
                  <Button
                    key={type}
                    onClick={() => setBroadcastType(type)}
                    variant={broadcastType === type ? "default" : "outline"}
                    size="sm"
                    className={broadcastType === type ? "bg-primary" : "border-white/10 text-white"}
                  >
                    {type}
                  </Button>
                ))}
              </div>
              <Textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Message a envoyer a tous les joueurs..."
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
              />
              <Button onClick={handleBroadcast} className="bg-primary" disabled={!broadcastMessage.trim()}>
                <Send className="w-4 h-4 mr-2" />
                Envoyer a tous
              </Button>
            </div>
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === "moderation" && backendStatus.connected && (
          <div className="space-y-6">
            {/* Bans */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Bans ({bans.length})
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newBanName}
                    onChange={(e) => setNewBanName(e.target.value)}
                    placeholder="Nom du joueur"
                    className="flex-1 bg-white/5 border-white/10 text-white"
                  />
                  <Input
                    value={newBanReason}
                    onChange={(e) => setNewBanReason(e.target.value)}
                    placeholder="Raison"
                    className="flex-1 bg-white/5 border-white/10 text-white"
                  />
                  <Button onClick={addBan} className="bg-red-500 hover:bg-red-600">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {bans.map((ban) => (
                    <div key={ban.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{ban.player_name}</div>
                        <div className="text-sm text-white/50">{ban.reason}</div>
                        <div className="text-xs text-white/30">
                          {ban.is_permanent ? "Permanent" : `Expire: ${new Date(ban.expires_at).toLocaleString()}`}
                        </div>
                      </div>
                      <Button
                        onClick={() => removeBan(ban.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {bans.length === 0 && <div className="text-center text-white/50 py-4">Aucun ban</div>}
                </div>
              </div>
            </div>

            {/* Reports */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Reports ({reports.length})
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-white">{report.reporter_name}</span>
                        <span className="text-white/50 mx-2">signale</span>
                        <span className="text-red-400">{report.reported_name}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          report.status === "pending"
                            ? "bg-amber-500/20 text-amber-400"
                            : report.status === "resolved"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-white/10 text-white/50"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <div className="text-sm text-white/70 mb-2">{report.reason}</div>
                    {report.details && <div className="text-xs text-white/50 mb-2">{report.details}</div>}
                    {report.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateReportStatus(report.id, "resolved")}
                          size="sm"
                          className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        >
                          Resoudre
                        </Button>
                        <Button
                          onClick={() => updateReportStatus(report.id, "dismissed")}
                          size="sm"
                          variant="ghost"
                          className="text-white/50"
                        >
                          Ignorer
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {reports.length === 0 && <div className="text-center text-white/50 py-8">Aucun report</div>}
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && backendStatus.connected && (
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Cartes de test Stripe</h3>
            <div className="grid gap-4">
              {TEST_CARDS.map((card) => (
                <div key={card.number} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-white">{card.name}</div>
                    <Button
                      onClick={() => copyCardNumber(card.number)}
                      variant="ghost"
                      size="sm"
                      className="text-white/50 hover:text-white"
                    >
                      {copiedCard === card.number ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="font-mono text-white/70">{card.number}</div>
                  <div className="text-sm text-white/50 mt-1">
                    {card.expiry} - CVC: {card.cvc}
                  </div>
                  <div className="text-xs text-white/40 mt-2">{card.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maintenance Tab - saves to backend instead of Supabase */}
        {activeTab === "maintenance" && backendStatus.connected && (
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Mode Maintenance</h3>
            </div>
            <p className="text-sm text-white/50 mb-6">
              Active le mode maintenance sur le serveur. Les joueurs verront un ecran de maintenance.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  {maintenanceEnabled ? (
                    <Pause className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Play className="w-5 h-5 text-emerald-400" />
                  )}
                  <span className="text-white font-medium">
                    {maintenanceEnabled ? "Maintenance active" : "Site en ligne"}
                  </span>
                </div>
                <Button
                  onClick={() => setMaintenanceEnabled(!maintenanceEnabled)}
                  variant={maintenanceEnabled ? "default" : "outline"}
                  className={maintenanceEnabled ? "bg-amber-500 hover:bg-amber-600" : "border-white/10 text-white"}
                >
                  {maintenanceEnabled ? "Desactiver" : "Activer"}
                </Button>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">Severite</label>
                <div className="flex gap-2">
                  {(["info", "warning", "critical"] as const).map((sev) => (
                    <Button
                      key={sev}
                      onClick={() => setMaintenanceSeverity(sev)}
                      variant={maintenanceSeverity === sev ? "default" : "outline"}
                      size="sm"
                      className={
                        maintenanceSeverity === sev
                          ? sev === "critical"
                            ? "bg-red-500"
                            : sev === "warning"
                              ? "bg-amber-500"
                              : "bg-primary"
                          : "border-white/10 text-white"
                      }
                    >
                      {sev}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">Message de maintenance</label>
                <Textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Maintenance programmee pour ameliorer les performances..."
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <Button onClick={saveMaintenanceConfig} className="bg-primary" disabled={isSavingBackend}>
                {isSavingBackend ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : configSaved ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Sauvegarder globalement
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
