"use client"

import { useState, useEffect, useCallback } from "react"

export interface PingResult {
  latency: number
  timestamp: number
  status: "excellent" | "good" | "fair" | "poor" | "offline"
  jitter: number
  serverRegion?: string
  packetId: number
}

export interface BackendInfo {
  version: string
  activePlayers: number
  region: string
}

export interface NetworkStats {
  currentPing: number
  averagePing: number
  minPing: number
  maxPing: number
  jitter: number
  packetLoss: number
  status: "excellent" | "good" | "fair" | "poor" | "offline"
  history: PingResult[]
  lastUpdate: number
  serverRegion: string
  connectionQuality: number
  isStable: boolean
  consecutiveFailures: number
  lastSuccessTime: number
  backendConnected: boolean
  backendLatency: number
  backendInfo: BackendInfo | null
}

const HISTORY_SIZE = 60
const PING_INTERVAL = 3000
const STABILITY_THRESHOLD = 5
const MAX_CONSECUTIVE_FAILURES = 5

class NetworkMonitor {
  private pingHistory: PingResult[] = []
  private listeners: Set<(stats: NetworkStats) => void> = new Set()
  private intervalId: ReturnType<typeof setInterval> | null = null
  private isRunning = false
  private failedPings = 0
  private consecutiveGoodPings = 0
  private consecutiveFailures = 0
  private serverRegion = "unknown"
  private lastSuccessTime = Date.now()
  private packetCounter = 0
  private backendInfo: BackendInfo | null = null
  private backendLatency = 0

  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.performPing()
    this.intervalId = setInterval(() => this.performPing(), PING_INTERVAL)
  }

  stop(): void {
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  subscribe(callback: (stats: NetworkStats) => void): () => void {
    this.listeners.add(callback)
    if (this.listeners.size === 1) {
      this.start()
    }
    callback(this.getStats())

    return () => {
      this.listeners.delete(callback)
      if (this.listeners.size === 0) {
        this.stop()
      }
    }
  }

  private async performPing(): Promise<void> {
    const packetId = ++this.packetCounter
    const startTime = performance.now()

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 4000)

      const response = await fetch("/api/ping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: Date.now(),
          packetId,
        }),
        cache: "no-store",
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (response.ok) {
        const endTime = performance.now()
        const latency = Math.round(endTime - startTime)

        try {
          const data = await response.json()
          this.serverRegion = data.server?.region || "vercel"
          this.backendLatency = latency
          this.backendInfo = {
            version: data.server?.version || "3.0.0",
            activePlayers: data.stats?.requestsPerMinute || 0,
            region: data.server?.region || "vercel",
          }
        } catch {
          // JSON parse error is ok
        }

        const status = this.calculateStatus(latency, true)
        const jitter = this.calculateJitter()

        const result: PingResult = {
          latency,
          timestamp: Date.now(),
          status,
          jitter,
          serverRegion: this.serverRegion,
          packetId,
        }

        this.pingHistory.push(result)
        if (this.pingHistory.length > HISTORY_SIZE) {
          this.pingHistory.shift()
        }

        this.failedPings = 0
        this.consecutiveGoodPings++
        this.consecutiveFailures = 0
        this.lastSuccessTime = Date.now()
      } else {
        this.recordFailure(packetId)
      }
    } catch {
      this.recordFailure(packetId)
    }

    this.notifyListeners()
  }

  private recordFailure(packetId: number): void {
    const result: PingResult = {
      latency: -1,
      timestamp: Date.now(),
      status: "offline",
      jitter: 0,
      packetId,
    }

    this.pingHistory.push(result)
    if (this.pingHistory.length > HISTORY_SIZE) {
      this.pingHistory.shift()
    }

    this.failedPings++
    this.consecutiveGoodPings = 0
    this.consecutiveFailures++
  }

  private calculateStatus(latency: number, success: boolean): PingResult["status"] {
    if (!success || latency < 0) return "offline"
    if (latency < 25) return "excellent"
    if (latency < 60) return "good"
    if (latency < 120) return "fair"
    return "poor"
  }

  private calculateJitter(): number {
    const validPings = this.pingHistory.filter((p) => p.latency > 0).map((p) => p.latency)
    if (validPings.length < 2) return 0

    let totalDiff = 0
    for (let i = 1; i < validPings.length; i++) {
      totalDiff += Math.abs(validPings[i] - validPings[i - 1])
    }

    return Math.round(totalDiff / (validPings.length - 1))
  }

  private calculateConnectionQuality(): number {
    const validPings = this.pingHistory.filter((p) => p.latency > 0)
    if (validPings.length === 0) return 0

    const avgLatency = validPings.reduce((a, b) => a + b.latency, 0) / validPings.length
    const jitter = this.calculateJitter()
    const lossRate = (this.pingHistory.length - validPings.length) / Math.max(this.pingHistory.length, 1)

    let score = 100

    if (avgLatency > 200) score -= 50
    else if (avgLatency > 150) score -= 35
    else if (avgLatency > 100) score -= 25
    else if (avgLatency > 60) score -= 15
    else if (avgLatency > 30) score -= 5

    if (jitter > 60) score -= 35
    else if (jitter > 40) score -= 25
    else if (jitter > 20) score -= 15
    else if (jitter > 10) score -= 5

    score -= lossRate * 100 * 0.5
    score -= this.consecutiveFailures * 10

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  getStats(): NetworkStats {
    const validPings = this.pingHistory.filter((p) => p.latency > 0)
    const latencies = validPings.map((p) => p.latency)

    if (latencies.length === 0) {
      return {
        currentPing: -1,
        averagePing: -1,
        minPing: -1,
        maxPing: -1,
        jitter: 0,
        packetLoss: this.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES ? 100 : 0,
        status: "offline",
        history: this.pingHistory,
        lastUpdate: Date.now(),
        serverRegion: this.serverRegion,
        connectionQuality: 0,
        isStable: false,
        consecutiveFailures: this.consecutiveFailures,
        lastSuccessTime: this.lastSuccessTime,
        backendConnected: false,
        backendLatency: this.backendLatency,
        backendInfo: this.backendInfo,
      }
    }

    const currentPing = latencies[latencies.length - 1]
    const averagePing = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    const minPing = Math.min(...latencies)
    const maxPing = Math.max(...latencies)
    const jitter = this.calculateJitter()
    const packetLoss = Math.round(((this.pingHistory.length - validPings.length) / this.pingHistory.length) * 100)
    const connectionQuality = this.calculateConnectionQuality()
    const isStable = this.consecutiveGoodPings >= STABILITY_THRESHOLD && jitter < 15

    return {
      currentPing,
      averagePing,
      minPing,
      maxPing,
      jitter,
      packetLoss,
      status: this.calculateStatus(currentPing, true),
      history: this.pingHistory,
      lastUpdate: Date.now(),
      serverRegion: this.serverRegion,
      connectionQuality,
      isStable,
      consecutiveFailures: this.consecutiveFailures,
      lastSuccessTime: this.lastSuccessTime,
      backendConnected: this.consecutiveFailures === 0,
      backendLatency: this.backendLatency,
      backendInfo: this.backendInfo,
    }
  }

  private notifyListeners(): void {
    const stats = this.getStats()
    this.listeners.forEach((callback) => callback(stats))
  }

  async forcePing(): Promise<NetworkStats> {
    await this.performPing()
    return this.getStats()
  }

  reset(): void {
    this.pingHistory = []
    this.failedPings = 0
    this.consecutiveGoodPings = 0
    this.consecutiveFailures = 0
    this.packetCounter = 0
    // Reset backend info
    this.backendInfo = null
    this.backendLatency = 0
    this.notifyListeners()
  }
}

// Singleton
export const networkMonitor = new NetworkMonitor()

// React hook
export function useNetworkStats(): NetworkStats & { refresh: () => Promise<NetworkStats>; reset: () => void } {
  const [stats, setStats] = useState<NetworkStats>(() => networkMonitor.getStats())

  const refresh = useCallback(async () => {
    return await networkMonitor.forcePing()
  }, [])

  const reset = useCallback(() => {
    networkMonitor.reset()
  }, [])

  useEffect(() => {
    return networkMonitor.subscribe(setStats)
  }, [])

  return { ...stats, refresh, reset }
}

// Lighter hook for just connection status
export function useConnectionStatus(): {
  connected: boolean
  quality: "excellent" | "good" | "fair" | "poor" | "offline"
  ping: number
} {
  const [status, setStatus] = useState({ connected: false, quality: "offline" as const, ping: -1 })

  useEffect(() => {
    return networkMonitor.subscribe((stats) => {
      setStatus({
        connected: stats.status !== "offline",
        quality: stats.status,
        ping: stats.currentPing,
      })
    })
  }, [])

  return status
}
