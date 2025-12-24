"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Settings, Volume2, VolumeX, Bell, BellOff, Monitor, Moon, Sun, Sparkles } from "lucide-react"
import { useThemeEvent, THEME_STYLES, type ThemeEvent } from "@/lib/theme-events"

interface SettingsModalProps {
  children?: React.ReactNode
}

export function SettingsModal({ children }: SettingsModalProps) {
  const { currentTheme, setTheme } = useThemeEvent()
  const [volume, setVolume] = useState(80)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem("drawly_user_id")
    setIsLoggedIn(!!userId)
  }, [])

  const themes = Object.entries(THEME_STYLES || {}).map(([key, value]) => ({
    id: key as ThemeEvent,
    name: value?.name || key,
    gradient: value?.gradient || "",
    accent: value?.accent || "purple",
    icon: value?.icon || "✨",
  }))

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
            <Settings className="w-5 h-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-strong border-white/10 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 text-base">
            <Settings className="w-4 h-4 text-primary" />
            Paramètres
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Sound settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wide flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              Son
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Activer les sons</span>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            {soundEnabled && (
              <div className="flex items-center gap-3">
                <VolumeX className="w-3.5 h-3.5 text-white/40" />
                <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} max={100} step={1} className="flex-1" />
                <Volume2 className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs text-white/40 w-8 text-right">{volume}%</span>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wide flex items-center gap-2">
              {notificationsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              Notifications
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Notifications de jeu</span>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
          </div>

          {/* Display */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wide flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5" />
              Affichage
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-sm text-white/60">Mode sombre</span>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </div>
        </div>

        {/* Version info */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-xs text-white/30">
            <span>Drawly v1.104.0</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Made with love
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
