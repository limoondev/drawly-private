"use client"

import { useMemo, useState, useEffect } from "react"
import { useThemeEvent, THEME_STYLES } from "@/lib/theme-events"
import { X, PartyPopper, AlertTriangle, Info, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"

function Particles({ type, color, secondaryColor }: { type: string; color: string; secondaryColor: string }) {
  const particles = useMemo(() => {
    const count =
      type === "stars"
        ? 150
        : type === "embers"
          ? 80
          : type === "bubbles"
            ? 50
            : type === "leaves"
              ? 45
              : type === "sparkles"
                ? 100
                : type === "fireflies"
                  ? 60
                  : type === "snow"
                    ? 120
                    : type === "crystals"
                      ? 40
                      : type === "prisms"
                        ? 60
                        : type === "waves"
                          ? 0
                          : 100

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size:
        type === "embers"
          ? 2 + Math.random() * 5
          : type === "bubbles"
            ? 4 + Math.random() * 14
            : type === "leaves"
              ? 10 + Math.random() * 10
              : type === "sparkles"
                ? 2 + Math.random() * 5
                : type === "fireflies"
                  ? 4 + Math.random() * 6
                  : type === "snow"
                    ? 2 + Math.random() * 4
                    : type === "crystals"
                      ? 6 + Math.random() * 8
                      : type === "prisms"
                        ? 4 + Math.random() * 6
                        : 1 + Math.random() * 3,
      delay: Math.random() * 12,
      duration:
        type === "embers"
          ? 4 + Math.random() * 5
          : type === "bubbles"
            ? 10 + Math.random() * 10
            : type === "leaves"
              ? 12 + Math.random() * 12
              : type === "fireflies"
                ? 5 + Math.random() * 5
                : type === "snow"
                  ? 8 + Math.random() * 8
                  : type === "crystals"
                    ? 6 + Math.random() * 4
                    : type === "prisms"
                      ? 4 + Math.random() * 4
                      : 2 + Math.random() * 4,
      opacity: type === "sparkles" || type === "prisms" ? 0.5 + Math.random() * 0.5 : 0.4 + Math.random() * 0.5,
      isBright: Math.random() > 0.8,
      hue: type === "prisms" ? Math.random() * 360 : 0,
    }))
  }, [type])

  if (type === "waves") {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${color}15 ${25 + i * 12}%, transparent ${55 + i * 12}%)`,
              transform: `translateY(${i * 8}%)`,
              animation: `wave-float ${10 + i * 3}s ease-in-out infinite`,
              animationDelay: `${i * 2.5}s`,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute ${
            type === "embers"
              ? "animate-ember"
              : type === "bubbles"
                ? "animate-bubble"
                : type === "leaves"
                  ? "animate-leaf"
                  : type === "sparkles"
                    ? "animate-sparkle"
                    : type === "fireflies"
                      ? "animate-firefly"
                      : type === "snow"
                        ? "animate-snow"
                        : type === "crystals"
                          ? "animate-crystal"
                          : type === "prisms"
                            ? "animate-prism"
                            : p.isBright
                              ? "animate-twinkle"
                              : "animate-pulse"
          }`}
          style={{
            left: `${p.x}%`,
            top:
              type === "embers" || type === "bubbles"
                ? "100%"
                : type === "snow" || type === "leaves"
                  ? "-5%"
                  : `${p.y}%`,
            width: p.size,
            height: type === "leaves" ? p.size * 1.5 : type === "crystals" ? p.size * 2 : p.size,
            backgroundColor:
              type === "prisms"
                ? `hsl(${p.hue}, 80%, 70%)`
                : type === "sparkles" && p.isBright
                  ? secondaryColor
                  : color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
            borderRadius: type === "leaves" ? "50% 0 50% 0" : type === "crystals" ? "2px" : "50%",
            boxShadow:
              p.isBright || type === "embers" || type === "fireflies" || type === "prisms"
                ? `0 0 ${p.size * 4}px ${p.size * 1.5}px ${type === "prisms" ? `hsla(${p.hue}, 80%, 70%, 0.6)` : color}60`
                : undefined,
            transform: type === "crystals" ? `rotate(${p.x * 3.6}deg)` : undefined,
          }}
        />
      ))}
    </div>
  )
}

function ShootingStars({ color }: { color: string }) {
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; left: string; top: string; angle: number }>>(
    [],
  )

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const id = Date.now()
        setShootingStars((prev) => [
          ...prev.slice(-4),
          { id, left: `${Math.random() * 60}%`, top: `${Math.random() * 40}%`, angle: 30 + Math.random() * 30 },
        ])
        setTimeout(() => setShootingStars((prev) => prev.filter((s) => s.id !== id)), 1500)
      }
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-shooting-star"
          style={{ left: star.left, top: star.top, zIndex: -1, transform: `rotate(${star.angle}deg)` }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 8px 3px ${color}, -50px 0 30px 2px ${color}60, -100px 0 50px 1px ${color}30`,
            }}
          />
        </div>
      ))}
    </>
  )
}

function Nebulae({ colors }: { colors: string[] }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -2 }}>
      {colors.map((color, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-nebula"
          style={{
            width: 400 + i * 100,
            height: 400 + i * 100,
            top: i === 0 ? "-10%" : i === 1 ? "50%" : i === 2 ? "20%" : "70%",
            left: i === 0 ? "-10%" : i === 1 ? "50%" : i === 2 ? "25%" : "60%",
            background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
            animationDelay: `${i * 7}s`,
            filter: "blur(80px)",
          }}
        />
      ))}
    </div>
  )
}

export function ThemedBackground() {
  const { currentTheme, globalMessages, dismissMessage } = useThemeEvent()
  const theme = THEME_STYLES[currentTheme] || THEME_STYLES.galaxy
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  const messageIcon = {
    info: Info,
    alert: AlertTriangle,
    celebration: PartyPopper,
    event: Sparkles,
  }

  const messageColors = {
    info: {
      bg: "from-cyan-500/20 to-blue-500/20",
      border: "border-cyan-500/50",
      text: "text-cyan-100",
      icon: "text-cyan-300",
    },
    alert: {
      bg: "from-red-500/20 to-orange-500/20",
      border: "border-red-500/50",
      text: "text-red-100",
      icon: "text-red-300",
    },
    celebration: {
      bg: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/50",
      text: "text-purple-100",
      icon: "text-purple-300",
    },
    event: {
      bg: "from-amber-500/20 to-yellow-500/20",
      border: "border-amber-500/50",
      text: "text-amber-100",
      icon: "text-amber-300",
    },
  }

  const safeMessages = Array.isArray(globalMessages) ? globalMessages : []

  return (
    <>
      {/* Background gradient */}
      <div
        className={`fixed inset-0 bg-gradient-to-br ${theme.bgGradient} transition-all duration-1000`}
        style={{ zIndex: -3 }}
      />

      {/* Overlay effect */}
      {theme.overlayEffect && (
        <div
          className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
          style={{ background: theme.overlayEffect, zIndex: -2 }}
        />
      )}

      {/* Nebulae */}
      <Nebulae colors={theme.nebulaColors || []} />

      {/* Particles */}
      <Particles
        type={theme.particleType || "stars"}
        color={theme.starColor || "#ffffff"}
        secondaryColor={theme.secondaryColor || "#ffffff"}
      />

      {/* Shooting stars for applicable themes */}
      {(theme.particleType === "stars" || theme.particleType === "sparkles" || theme.particleType === "snow") && (
        <ShootingStars color={theme.starColor || "#ffffff"} />
      )}

      {/* Global Messages */}
      <div className="fixed top-16 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
        {safeMessages.map((message, index) => {
          if (!message || !message.type) return null
          const Icon = messageIcon[message.type] || Info
          const colors = messageColors[message.type] || messageColors.info
          return (
            <div
              key={message.id || index}
              className="animate-in slide-in-from-right-4 fade-in duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${colors.bg} ${colors.border} border backdrop-blur-2xl shadow-xl overflow-hidden`}
              >
                <div
                  className={`relative w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 ${colors.icon}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`relative font-medium text-sm flex-1 ${colors.text}`}>{message.text}</span>
                <button
                  onClick={() => dismissMessage(message.id)}
                  className="relative p-1.5 hover:bg-white/10 rounded-lg transition-all"
                  aria-label="Fermer"
                >
                  <X className="w-3.5 h-3.5 text-white/60 hover:text-white" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Theme indicator */}
      {currentTheme && currentTheme !== "galaxy" && !isHidden && (
        <div className={`fixed bottom-4 z-50 transition-all duration-300 ${isExpanded ? "left-4" : "left-2"}`}>
          <div className="flex items-center gap-1">
            {/* Hide button */}
            <button
              onClick={() => setIsHidden(true)}
              className="p-1 rounded-lg bg-black/30 hover:bg-black/50 text-white/40 hover:text-white/60 transition-all"
              title="Masquer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>

            {/* Theme indicator */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-2 py-1.5 rounded-full border backdrop-blur-xl shadow-lg transition-all hover:scale-105 ${isExpanded ? "px-3" : "px-2"}`}
              style={{
                backgroundColor: `${theme.primaryColor}20`,
                borderColor: `${theme.primaryColor}40`,
              }}
            >
              <span className="text-sm">{theme.icon}</span>
              {isExpanded && (
                <>
                  <span className="text-xs font-medium text-white/80">{theme.name}</span>
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Show button when hidden */}
      {isHidden && currentTheme && currentTheme !== "galaxy" && (
        <button
          onClick={() => setIsHidden(false)}
          className="fixed bottom-4 left-2 z-50 p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white/40 hover:text-white/60 transition-all"
          title="Afficher le theme"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </>
  )
}
