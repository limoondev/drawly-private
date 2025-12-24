import { NextResponse } from "next/server"

// Enhanced server metrics with rolling windows
const metrics = {
  requestCount: 0,
  totalLatency: 0,
  minLatency: Number.POSITIVE_INFINITY,
  maxLatency: 0,
  lastMinuteRequests: [] as number[],
  last5MinuteLatencies: [] as number[],
  errorCount: 0,
  startTime: Date.now(),
}

function updateMetrics(processingTime: number) {
  metrics.requestCount++
  metrics.totalLatency += processingTime
  metrics.minLatency = Math.min(metrics.minLatency, processingTime)
  metrics.maxLatency = Math.max(metrics.maxLatency, processingTime)

  const now = Date.now()

  // Requests per minute
  metrics.lastMinuteRequests = metrics.lastMinuteRequests.filter((t) => now - t < 60000)
  metrics.lastMinuteRequests.push(now)

  // Rolling latency window (5 min)
  metrics.last5MinuteLatencies.push(processingTime)
  if (metrics.last5MinuteLatencies.length > 300) {
    metrics.last5MinuteLatencies.shift()
  }
}

function calculatePercentile(arr: number[], percentile: number): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

export async function HEAD(request: Request) {
  const serverTime = Date.now()

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Server-Time": serverTime.toString(),
      "X-Response-Time": "0",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

export async function GET() {
  const startTime = performance.now()
  const serverTime = Date.now()

  const processingTime = Math.round(performance.now() - startTime)
  updateMetrics(processingTime)

  const avgLatency = metrics.requestCount > 0 ? Math.round(metrics.totalLatency / metrics.requestCount) : 0

  return NextResponse.json(
    {
      status: "ok",
      timestamp: serverTime,
      processingTime,
      server: {
        name: "drawly-edge",
        region: process.env.VERCEL_REGION || "local",
        version: "3.0.0",
        uptime: Math.floor((Date.now() - metrics.startTime) / 1000),
      },
      stats: {
        requestCount: metrics.requestCount,
        avgProcessingTime: avgLatency,
        minProcessingTime: metrics.minLatency === Number.POSITIVE_INFINITY ? 0 : metrics.minLatency,
        maxProcessingTime: metrics.maxLatency,
        p50: calculatePercentile(metrics.last5MinuteLatencies, 50),
        p95: calculatePercentile(metrics.last5MinuteLatencies, 95),
        p99: calculatePercentile(metrics.last5MinuteLatencies, 99),
        requestsPerMinute: metrics.lastMinuteRequests.length,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Server-Time": serverTime.toString(),
        "X-Processing-Time": processingTime.toString(),
        "Access-Control-Allow-Origin": "*",
      },
    },
  )
}

export async function POST(request: Request) {
  const startTime = performance.now()

  try {
    const body = await request.json()
    const clientSentAt = body.timestamp || Date.now()
    const packetId = body.packetId || 0
    const serverReceivedAt = Date.now()

    const processingTime = Math.round(performance.now() - startTime)
    updateMetrics(processingTime)

    const serverRespondedAt = Date.now()

    // Calculate estimated one-way latency
    const clockDrift = serverReceivedAt - clientSentAt
    const estimatedOneWay = Math.max(0, Math.min(clockDrift, 1000)) // Cap at 1s to handle clock drift

    return NextResponse.json(
      {
        status: "ok",
        packetId,
        timing: {
          clientSentAt,
          serverReceivedAt,
          serverRespondedAt,
          processingTime,
          estimatedOneWayLatency: estimatedOneWay,
          roundTripEstimate: serverRespondedAt - clientSentAt,
        },
        server: {
          name: "drawly-edge",
          region: process.env.VERCEL_REGION || "local",
          version: "3.0.0",
          healthy: true,
          load: metrics.requestsPerMinute || metrics.lastMinuteRequests.length,
        },
        stats: {
          totalRequests: metrics.requestCount,
          avgProcessingTime: Math.round(metrics.totalLatency / Math.max(metrics.requestCount, 1)),
          p95: calculatePercentile(metrics.last5MinuteLatencies, 95),
          requestsPerMinute: metrics.lastMinuteRequests.length,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Server-Time": serverRespondedAt.toString(),
          "X-Processing-Time": processingTime.toString(),
          "X-Packet-ID": packetId.toString(),
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, X-Packet-ID, X-Client-Time",
        },
      },
    )
  } catch {
    metrics.errorCount++
    return NextResponse.json(
      {
        status: "error",
        error: "Invalid request body",
        timestamp: Date.now(),
      },
      {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Client-Time, X-Request-Start, X-Packet-ID",
      "Access-Control-Max-Age": "86400",
    },
  })
}
