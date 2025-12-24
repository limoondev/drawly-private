"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Shield,
  AlertTriangle,
  MessageSquare,
  HelpCircle,
  RotateCcw,
  Clock,
  Send,
  Bot,
  User,
  ChevronDown,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { processContestation, getAIChatbotResponse, type PlayerBehavior } from "@/lib/ai-analysis"

interface BanModalProps {
  banEndTime: number
  behavior?: PlayerBehavior
  detectedPatterns?: string[]
}

type ChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
}

type ModalView = "main" | "contest" | "support"

export function BanModal({ banEndTime, behavior, detectedPatterns = [] }: BanModalProps) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [view, setView] = useState<ModalView>("main")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [contestResult, setContestResult] = useState<{ accepted: boolean; analysis: string } | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateTime = () => {
      const remaining = Math.max(0, banEndTime - Date.now())
      setTimeLeft(Math.ceil(remaining / 1000))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [banEndTime])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = ((5 * 60 - timeLeft) / (5 * 60)) * 100

  const handleRetry = () => {
    if (timeLeft === 0 || contestResult?.accepted) {
      window.location.reload()
    }
  }

  const startContestation = () => {
    setView("contest")
    setMessages([
      {
        id: "1",
        role: "system",
        content: "Bienvenue dans le systeme de contestation Kiwiz Protect. Un assistant IA va analyser votre cas.",
        timestamp: Date.now(),
      },
      {
        id: "2",
        role: "assistant",
        content: `Bonjour ! Je suis l'assistant Kiwiz Protect. J'ai acces a l'analyse de votre comportement en jeu.\n\n**Patterns detectes:** ${detectedPatterns.length > 0 ? detectedPatterns.join(", ") : "Non specifie"}\n\nPour contester votre ban, expliquez-moi pourquoi vous pensez que c'est une erreur. Je vais analyser votre comportement et determiner si le ban etait justifie.`,
        timestamp: Date.now(),
      },
    ])
  }

  const startSupport = () => {
    setView("support")
    setMessages([
      {
        id: "1",
        role: "system",
        content: "Assistant Kiwiz - Support",
        timestamp: Date.now(),
      },
      {
        id: "2",
        role: "assistant",
        content:
          "Bonjour ! Je suis l'assistant virtuel Kiwiz Protect. Comment puis-je vous aider ?\n\nJe peux repondre a vos questions sur:\n- Le systeme anti-triche\n- Les regles du jeu\n- Pourquoi vous avez ete banni\n- Comment contester un ban\n- Les Userscripts interdits",
        timestamp: Date.now(),
      },
    ])
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800))

    if (view === "contest") {
      const defaultBehavior: PlayerBehavior = {
        messageHistory: [],
        guessPatterns: [],
        pasteEvents: 0,
        suspiciousPatterns: detectedPatterns,
        warningCount: 1,
      }

      const result = await processContestation(behavior || defaultBehavior, input.trim())

      setContestResult({ accepted: result.accepted, analysis: result.analysis })

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } else {
      const response = getAIChatbotResponse(input.trim(), {
        isBanned: true,
        patterns: detectedPatterns,
      })

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    }

    setIsProcessing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Main ban view
  if (view === "main") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-destructive/5 to-background flex items-center justify-center p-4">
        <div className="bg-card rounded-3xl border border-destructive/20 p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-destructive/10 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent rounded-tr-full" />

          <div className="relative">
            {/* Icon with pulse effect */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-destructive/20 rounded-3xl blur-xl animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-destructive to-destructive/80 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-destructive/30">
                <Shield className="w-10 h-10 text-destructive-foreground" />
              </div>
            </div>

            {/* Title */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h1 className="text-2xl font-bold text-foreground">Kiwiz Protect</h1>
              <Sparkles className="w-4 h-4 text-destructive/60" />
            </div>

            {/* Message */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 mb-6">
              <p className="text-foreground leading-relaxed text-sm">
                Attention, nous avons remarque que vous utilisez soit un Userscript ou une methode de triche externe.
                Vous avez ete temporairement exclu de la partie. Reessayez sans triche, contestez si c'est une erreur,
                ou contactez l'assistance.
              </p>

              {detectedPatterns.length > 0 && (
                <div className="mt-4 pt-4 border-t border-destructive/20">
                  <p className="text-xs text-muted-foreground mb-2">Comportements detectes:</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {detectedPatterns.map((pattern, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-destructive/10 text-destructive rounded-full">
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timer with progress */}
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Temps restant avant de pouvoir rejouer
              </p>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-muted rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-destructive to-destructive/70 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="inline-flex items-center gap-1 px-6 py-3 bg-destructive/10 rounded-2xl border border-destructive/20">
                <span className="text-5xl font-mono font-bold text-destructive tabular-nums">
                  {String(minutes).padStart(2, "0")}
                </span>
                <span className="text-4xl font-bold text-destructive animate-pulse">:</span>
                <span className="text-5xl font-mono font-bold text-destructive tabular-nums">
                  {String(seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className={`w-full h-12 rounded-xl transition-all ${
                  timeLeft === 0
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
                disabled={timeLeft > 0}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {timeLeft === 0 ? "Rejouer maintenant" : "Reessayer sans Userscript"}
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all bg-transparent"
                  onClick={startContestation}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contester mon ban
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl hover:bg-secondary/10 hover:border-secondary/30 hover:text-secondary transition-all bg-transparent"
                  onClick={startSupport}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Assistance IA
                </Button>
              </div>
            </div>

            {/* Info */}
            <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
              Ce systeme protege tous les joueurs contre la triche. Si vous pensez qu'il s'agit d'une erreur, utilisez
              le bouton Contester. Notre IA analysera votre comportement.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Chat view (Contest or Support)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl border border-border w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div
          className={`p-4 border-b border-border ${view === "contest" ? "bg-gradient-to-r from-destructive/10 to-primary/10" : "bg-gradient-to-r from-secondary/10 to-primary/10"}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${view === "contest" ? "bg-destructive/20" : "bg-secondary/20"}`}
              >
                {view === "contest" ? (
                  <MessageSquare className="w-5 h-5 text-destructive" />
                ) : (
                  <Bot className="w-5 h-5 text-secondary" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  {view === "contest" ? "Contestation de ban" : "Assistant Kiwiz IA"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {view === "contest" ? "Analyse IA de votre comportement" : "Support intelligent 24/7"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("main")}
              className="text-muted-foreground hover:text-foreground"
            >
              Retour
            </Button>
          </div>
        </div>

        {/* Analysis panel (for contest) */}
        {view === "contest" && contestResult && (
          <div className="px-4 pt-3">
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Voir le rapport d'analyse complet</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showAnalysis ? "rotate-180" : ""}`}
              />
            </button>

            {showAnalysis && (
              <div className="mt-2 p-4 bg-muted/30 rounded-xl text-xs text-muted-foreground whitespace-pre-line border border-border font-mono">
                {contestResult.analysis}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages
            .filter((m) => m.role !== "system")
            .map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-primary/20" : "bg-secondary/20"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : (
                    <Bot className="w-4 h-4 text-secondary" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}

          {isProcessing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-secondary/20">
                <Bot className="w-4 h-4 text-secondary" />
              </div>
              <div className="bg-muted p-3 rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                  <span className="text-sm text-muted-foreground">Analyse en cours...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Contest result banner */}
        {contestResult && (
          <div
            className={`mx-4 mb-2 p-4 rounded-xl border ${
              contestResult.accepted ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"
            }`}
          >
            <p
              className={`text-sm font-semibold flex items-center gap-2 ${contestResult.accepted ? "text-success" : "text-destructive"}`}
            >
              {contestResult.accepted ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Contestation acceptee - Votre ban a ete leve !
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Contestation refusee - Le ban est maintenu
                </>
              )}
            </p>
            {contestResult.accepted && (
              <Button
                onClick={handleRetry}
                size="sm"
                className="mt-3 w-full bg-success hover:bg-success/90 text-success-foreground"
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Rejouer maintenant
              </Button>
            )}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={view === "contest" ? "Expliquez pourquoi c'est une erreur..." : "Posez votre question..."}
              disabled={isProcessing || (view === "contest" && contestResult !== null)}
              className="flex-1 h-11 rounded-xl bg-background"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isProcessing || (view === "contest" && contestResult !== null)}
              className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
