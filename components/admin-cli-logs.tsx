"use client"

import { useEffect, useRef, useState } from "react"
import { Terminal, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LogEntry {
  id: string
  timestamp: string
  type: string
  room_code?: string
  player_name?: string
  message: string
  data?: unknown
}

interface AdminCLILogsProps {
  logs: LogEntry[]
  title?: string
  maxHeight?: string
  onRefresh?: () => void
  onClear?: () => void
}

const LOG_TYPE_COLORS: Record<string, { bg: string; text: string; prefix: string }> = {
  join: { bg: "text-emerald-400", text: "text-emerald-300", prefix: "[JOIN]" },
  leave: { bg: "text-yellow-400", text: "text-yellow-300", prefix: "[LEAVE]" },
  start: { bg: "text-cyan-400", text: "text-cyan-300", prefix: "[START]" },
  end: { bg: "text-purple-400", text: "text-purple-300", prefix: "[END]" },
  guess: { bg: "text-blue-400", text: "text-blue-300", prefix: "[GUESS]" },
  kick: { bg: "text-orange-400", text: "text-orange-300", prefix: "[KICK]" },
  ban: { bg: "text-red-400", text: "text-red-300", prefix: "[BAN]" },
  warning: { bg: "text-amber-400", text: "text-amber-300", prefix: "[WARN]" },
  error: { bg: "text-red-500", text: "text-red-400", prefix: "[ERROR]" },
  info: { bg: "text-cyan-400", text: "text-cyan-300", prefix: "[INFO]" },
  success: { bg: "text-emerald-400", text: "text-emerald-300", prefix: "[OK]" },
  system: { bg: "text-purple-400", text: "text-purple-300", prefix: "[SYS]" },
  player: { bg: "text-green-400", text: "text-green-300", prefix: "[PLAYER]" },
  room: { bg: "text-yellow-400", text: "text-yellow-300", prefix: "[ROOM]" },
  security: { bg: "text-red-400", text: "text-red-300", prefix: "[SEC]" },
  report: { bg: "text-amber-400", text: "text-amber-300", prefix: "[REPORT]" },
}

export function AdminCLILogs({
  logs,
  title = "System Logs",
  maxHeight = "500px",
  onRefresh,
  onClear,
}: AdminCLILogsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const filteredLogs = filter === "all" ? logs : logs.filter((log) => log.type === filter)

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts)
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const getLogStyle = (type: string) => {
    return LOG_TYPE_COLORS[type] || { bg: "text-white/50", text: "text-white/70", prefix: `[${type.toUpperCase()}]` }
  }

  return (
    <div className="glass rounded-xl overflow-hidden font-mono text-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-white/80 font-semibold">{title}</span>
            <span className="text-white/30 text-xs">({filteredLogs.length} entries)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white/70"
          >
            <option value="all">Tous</option>
            <option value="join">Connexions</option>
            <option value="leave">Deconnexions</option>
            <option value="guess">Devinettes</option>
            <option value="kick">Kicks</option>
            <option value="ban">Bans</option>
            <option value="error">Erreurs</option>
            <option value="report">Reports</option>
          </select>
          {onClear && (
            <Button
              onClick={onClear}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-white/50 hover:text-white hover:bg-white/10"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-white/50 hover:text-white hover:bg-white/10"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Terminal body */}
      {expanded && (
        <div
          ref={scrollRef}
          className="bg-[#0d1117] p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
          style={{ maxHeight }}
          onScroll={(e) => {
            const el = e.currentTarget
            const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
            setAutoScroll(isAtBottom)
          }}
        >
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/30">$ waiting for logs...</p>
              <p className="text-white/20 text-xs mt-1">_</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredLogs.map((log, idx) => {
                const style = getLogStyle(log.type)
                return (
                  <div
                    key={log.id || idx}
                    className="flex items-start gap-2 hover:bg-white/5 px-1 py-0.5 rounded group"
                  >
                    <span className="text-white/30 shrink-0">{formatTimestamp(log.timestamp)}</span>
                    <span className={`shrink-0 ${style.bg}`}>{style.prefix}</span>
                    {log.room_code && <span className="text-purple-400 shrink-0">[{log.room_code}]</span>}
                    {log.player_name && <span className="text-cyan-400 shrink-0">{log.player_name}:</span>}
                    <span className={style.text}>{log.message}</span>
                    {log.data && (
                      <span className="text-white/20 text-xs hidden group-hover:inline truncate max-w-[200px]">
                        {JSON.stringify(log.data)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Blinking cursor */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-emerald-400">$</span>
            <span className="w-2 h-4 bg-emerald-400 animate-pulse" />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-white/10 bg-black/20 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-white/30">
            Auto-scroll:{" "}
            <span className={autoScroll ? "text-emerald-400" : "text-white/50"}>{autoScroll ? "ON" : "OFF"}</span>
          </span>
          <span className="text-white/30">
            Filter: <span className="text-cyan-400">{filter}</span>
          </span>
        </div>
        {onRefresh && (
          <button onClick={onRefresh} className="text-white/40 hover:text-white/70 transition-colors">
            Refresh
          </button>
        )}
      </div>
    </div>
  )
}
