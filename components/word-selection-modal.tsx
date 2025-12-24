"use client"

import { useGame } from "@/components/game-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"

export function WordSelectionModal() {
  const { gameState, selectWord } = useGame()
  const [open, setOpen] = useState(false)
  const [countdown, setCountdown] = useState(15)

  const isDrawer = gameState.players.find((p) => p.id === gameState.playerId)?.isDrawing
  const hasWords = gameState.wordChoices.length > 0

  useEffect(() => {
    if (gameState.phase === "choosing" && isDrawer && hasWords) {
      setOpen(true)
      setCountdown(15)
    } else {
      setOpen(false)
    }
  }, [gameState.phase, isDrawer, hasWords])

  useEffect(() => {
    if (!open) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-select first word
          selectWord(gameState.wordChoices[0])
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, gameState.wordChoices, selectWord])

  const handleSelect = (word: string) => {
    selectWord(word)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center">Choisissez un mot a dessiner</DialogTitle>
        </DialogHeader>
        <div className="text-center text-sm text-muted-foreground mb-4">Temps restant: {countdown}s</div>
        <div className="flex flex-col gap-3">
          {gameState.wordChoices.map((word) => (
            <Button
              key={word}
              onClick={() => handleSelect(word)}
              variant="outline"
              className="text-lg py-6 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {word}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
