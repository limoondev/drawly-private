export type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting" | "error"

export interface ConnectionConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  heartbeatInterval: number
  timeout: number
}

const DEFAULT_CONFIG: ConnectionConfig = {
  maxRetries: 10,
  baseDelay: 1000,
  maxDelay: 30000,
  heartbeatInterval: 5000,
  timeout: 10000,
}

export interface ConnectionStats {
  state: ConnectionState
  latency: number
  jitter: number
  packetLoss: number
  reconnectAttempts: number
  lastConnected: Date | null
  uptime: number
}

type ConnectionListener = (stats: ConnectionStats) => void

class ConnectionManager {
  private state: ConnectionState = "disconnected"
  private config: ConnectionConfig = DEFAULT_CONFIG
  private reconnectAttempts = 0
  private lastConnected: Date | null = null
  private connectTime: Date | null = null
  private listeners: Set<ConnectionListener> = new Set()
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  private latencyHistory: number[] = []
  private packetsSent = 0
  private packetsReceived = 0

  configure(config: Partial<ConnectionConfig>) {
    this.config = { ...this.config, ...config }
  }

  subscribe(listener: ConnectionListener): () => void {
    this.listeners.add(listener)
    listener(this.getStats())
    return () => this.listeners.delete(listener)
  }

  private notify() {
    const stats = this.getStats()
    this.listeners.forEach((listener) => listener(stats))
  }

  getStats(): ConnectionStats {
    const latency =
      this.latencyHistory.length > 0
        ? Math.round(this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length)
        : 0

    const jitter = this.calculateJitter()
    const packetLoss =
      this.packetsSent > 0 ? Math.round(((this.packetsSent - this.packetsReceived) / this.packetsSent) * 100) : 0

    const uptime = this.connectTime ? Date.now() - this.connectTime.getTime() : 0

    return {
      state: this.state,
      latency,
      jitter,
      packetLoss,
      reconnectAttempts: this.reconnectAttempts,
      lastConnected: this.lastConnected,
      uptime,
    }
  }

  private calculateJitter(): number {
    if (this.latencyHistory.length < 2) return 0

    let totalDiff = 0
    for (let i = 1; i < this.latencyHistory.length; i++) {
      totalDiff += Math.abs(this.latencyHistory[i] - this.latencyHistory[i - 1])
    }
    return Math.round(totalDiff / (this.latencyHistory.length - 1))
  }

  async connect(): Promise<boolean> {
    if (this.state === "connected" || this.state === "connecting") {
      return this.state === "connected"
    }

    this.state = "connecting"
    this.notify()

    try {
      // Simulate connection with ping test
      const startTime = performance.now()
      const response = await fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientTime: Date.now() }),
        signal: AbortSignal.timeout(this.config.timeout),
      })

      if (!response.ok) throw new Error("Connection failed")

      const latency = Math.round(performance.now() - startTime)
      this.recordLatency(latency)

      this.state = "connected"
      this.lastConnected = new Date()
      this.connectTime = new Date()
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.notify()

      return true
    } catch {
      this.state = "error"
      this.notify()
      this.scheduleReconnect()
      return false
    }
  }

  disconnect() {
    this.stopHeartbeat()
    this.clearReconnectTimer()
    this.state = "disconnected"
    this.connectTime = null
    this.notify()
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.config.heartbeatInterval)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private async sendHeartbeat() {
    if (this.state !== "connected") return

    this.packetsSent++
    const startTime = performance.now()

    try {
      const response = await fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientTime: Date.now() }),
        signal: AbortSignal.timeout(this.config.timeout),
      })

      if (!response.ok) throw new Error("Heartbeat failed")

      this.packetsReceived++
      const latency = Math.round(performance.now() - startTime)
      this.recordLatency(latency)
      this.notify()
    } catch {
      // Connection might be degraded
      if (this.state === "connected") {
        this.scheduleReconnect()
      }
    }
  }

  private recordLatency(latency: number) {
    this.latencyHistory.push(latency)
    if (this.latencyHistory.length > 30) {
      this.latencyHistory.shift()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.config.maxRetries) {
      this.state = "error"
      this.notify()
      return
    }

    this.clearReconnectTimer()
    this.state = "reconnecting"
    this.reconnectAttempts++
    this.notify()

    const delay = Math.min(this.config.baseDelay * Math.pow(2, this.reconnectAttempts - 1), this.config.maxDelay)

    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  forceReconnect() {
    this.disconnect()
    this.reconnectAttempts = 0
    this.connect()
  }
}

export const connectionManager = new ConnectionManager()
