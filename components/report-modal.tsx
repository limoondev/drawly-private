"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Send, Loader2 } from "lucide-react"
import type { Player } from "@/components/game-context"

interface ReportModalProps {
  open: boolean
  onClose: () => void
  players: Player[]
  currentPlayerId: string
  roomCode: string
  onSubmit: (report: { playerId: string; playerName: string; reason: string; details: string }) => Promise<void>
}

const REPORT_REASONS = [
  { id: "inappropriate", label: "Contenu inapproprie" },
  { id: "cheating", label: "Triche" },
  { id: "spam", label: "Spam" },
  { id: "harassment", label: "Harcelement" },
  { id: "offensive_name", label: "Pseudo offensant" },
  { id: "other", label: "Autre" },
]

export function ReportModal({ open, onClose, players, currentPlayerId, roomCode, onSubmit }: ReportModalProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("")
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const otherPlayers = players.filter((p) => p.id !== currentPlayerId)

  const handleSubmit = async () => {
    if (!selectedPlayer || !selectedReason) return

    const player = players.find((p) => p.id === selectedPlayer)
    if (!player) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        playerId: selectedPlayer,
        playerName: player.name,
        reason: selectedReason,
        details: details.trim(),
      })
      setSubmitted(true)
      setTimeout(() => {
        onClose()
        setSubmitted(false)
        setSelectedPlayer("")
        setSelectedReason("")
        setDetails("")
      }, 2000)
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setSelectedPlayer("")
      setSelectedReason("")
      setDetails("")
      setSubmitted(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-strong border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Signaler un joueur
          </DialogTitle>
          <DialogDescription className="text-white/50">Salon: {roomCode}</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Signalement envoye</h3>
            <p className="text-sm text-white/50">Merci pour votre signalement. Notre equipe va l'examiner.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Player selection */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Joueur a signaler</label>
              <div className="grid grid-cols-2 gap-2">
                {otherPlayers.length === 0 ? (
                  <p className="col-span-2 text-center text-white/40 py-4 text-sm">Aucun autre joueur</p>
                ) : (
                  otherPlayers.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayer(player.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                        selectedPlayer === player.id
                          ? "bg-primary/20 border-primary/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: player.avatar }}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white truncate">{player.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Reason selection */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Raison</label>
              <div className="grid grid-cols-2 gap-2">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`p-2.5 rounded-lg border text-sm transition-all ${
                      selectedReason === reason.id
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Details (optionnel)</label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Decrivez ce qui s'est passe..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] resize-none"
                maxLength={500}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-white/10 text-white hover:bg-white/10 bg-transparent"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedPlayer || !selectedReason || isSubmitting}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
