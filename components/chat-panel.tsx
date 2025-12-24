"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useGame } from "@/components/game-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Shield, AlertTriangle, MessageCircle, CheckCircle2, Sparkles, Star } from "lucide-react"
import { ReportModal } from "@/components/report-modal"

interface ChatPanelProps {
  disabled?: boolean
}

export function ChatPanel({ disabled }: ChatPanelProps) {
  const [message, setMessage] = useState("")
  const [cheatWarning, setCheatWarning] = useState<string | null>(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { gameState, currentPlayerId, sendChatMessage, checkForCheat, triggerBan, recordPasteEvent, reportPlayer } =
    useGame()
  const currentPlayer = gameState.players.find((p) => p.id === currentPlayerId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [gameState.messages])

  const handleSendMessage = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || disabled) return

    if (trimmedMessage.toLowerCase() === ".report") {
      setReportModalOpen(true)
      setMessage("")
      return
    }

    const cheatCheck = checkForCheat(trimmedMessage)
    if (cheatCheck.isCheat) {
      setCheatWarning("Comportement suspect detecte.")
      setTimeout(() => triggerBan(), 2000)
      return
    }

    sendChatMessage(trimmedMessage)
    setMessage("")
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text")
    recordPasteEvent()

    if (
      gameState.currentWord &&
      gameState.phase === "drawing" &&
      pastedText.toLowerCase().trim() === gameState.currentWord.toLowerCase()
    ) {
      e.preventDefault()
      setCheatWarning("Collage du mot detecte.")
      setTimeout(() => triggerBan(), 2000)
    }
  }

  const handleSubmitReport = async (report: {
    playerId: string
    playerName: string
    reason: string
    details: string
  }) => {
    reportPlayer(report.playerId, report.reason, report.details)
  }

  const isDisabled = disabled || (currentPlayer?.hasGuessed && gameState.phase === "drawing")

  return (
    <div className="glass-strong rounded-xl overflow-hidden h-full flex flex-col min-h-[250px] lg:min-h-0">
      <div className="p-3 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-white text-sm">Chat</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            <Shield className="w-3 h-3" />
            <span className="hidden sm:inline">Protege</span>
          </div>
        </div>
      </div>

      {/* Warning */}
      {cheatWarning && (
        <div className="m-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <p className="text-xs text-red-400">{cheatWarning}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
        {gameState.messages.length === 0 && (
          <div className="text-center text-white/30 py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun message</p>
            <p className="text-xs text-white/20 mt-1">Devine le mot !</p>
            <p className="text-xs text-white/15 mt-2">Tape .report pour signaler</p>
          </div>
        )}
        {gameState.messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2.5 rounded-xl text-sm transition-all ${
              msg.isSystem
                ? msg.isCorrect
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  : "bg-white/5 text-white/50 text-center text-xs"
                : msg.playerId === currentPlayerId
                  ? "bg-gradient-to-r from-primary/20 to-purple-500/10 border border-primary/20 ml-4"
                  : "bg-white/5 border border-white/5 mr-4"
            }`}
          >
            {msg.isCorrect && (
              <div className="flex items-center gap-1.5 mb-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <Star className="w-3 h-3 text-amber-400" />
                <span>Bonne reponse !</span>
              </div>
            )}
            {!msg.isSystem && (
              <span className={`font-semibold ${msg.playerId === currentPlayerId ? "text-primary" : "text-white"}`}>
                {msg.playerName}:{" "}
              </span>
            )}
            <span className={msg.isSystem ? "" : "text-white/80"}>{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Guessed message */}
      {currentPlayer?.hasGuessed && gameState.phase === "drawing" && (
        <div className="mx-2 mb-2 p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl text-center shrink-0">
          <p className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Tu as trouve ! Attends la fin du round.
          </p>
        </div>
      )}

      {/* Input */}
      <div className="p-2 border-t border-white/5 shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              disabled ? "Tu dessines..." : currentPlayer?.hasGuessed ? "Tu as deja trouve" : "Devine le mot..."
            }
            disabled={isDisabled}
            className="h-10 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            maxLength={50}
            autoComplete="off"
            spellCheck={false}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isDisabled}
            className="h-10 w-10 shrink-0 bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-all"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        players={gameState.players}
        currentPlayerId={currentPlayerId}
        roomCode={gameState.roomCode}
        onSubmit={handleSubmitReport}
      />
    </div>
  )
}
