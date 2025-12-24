"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
  Pencil,
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  LogOut,
  Camera,
  Trophy,
  Target,
  Palette,
  Crown,
  Shield,
  AlertTriangle,
  Upload,
  X,
  Check,
  ImageOff,
  AtSign,
} from "lucide-react"
import { getSocket } from "@/lib/socket-client"

const FORBIDDEN_WORDS = [
  "admin",
  "moderator",
  "staff",
  "drawly",
  "system",
  "support",
  "nazi",
  "hitler",
  "porn",
  "sex",
  "fuck",
  "shit",
  "bitch",
  "ass",
  "nigger",
  "faggot",
  "retard",
  "kill",
  "death",
  "suicide",
]

interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  is_premium: boolean
  premium_plan: string | null
  games_played: number
  games_won: number
  total_score: number
  drawings_made: number
  correct_guesses: number
  warnings: number
  created_at: string
}

interface AccountSettingsProps {
  initialProfile?: Profile | null
}

export function AccountSettings({ initialProfile }: AccountSettingsProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile || null)
  const [username, setUsername] = useState(profile?.username || "")
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [isLoading, setIsLoading] = useState(!initialProfile)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load profile from backend
  useEffect(() => {
    const socket = getSocket()
    const playerId = localStorage.getItem("drawly_player_id")

    if (playerId && socket) {
      socket.emit("get_profile", { playerId })

      socket.on("profile_data", (data: Profile) => {
        setProfile(data)
        setUsername(data.username || "")
        setDisplayName(data.display_name || "")
        setBio(data.bio || "")
        setAvatarUrl(data.avatar_url || "")
        setIsLoading(false)
      })

      socket.on("profile_updated", (data: Profile) => {
        setProfile(data)
        setMessage({ type: "success", text: "Profil mis à jour !" })
        setIsSaving(false)
      })

      socket.on("profile_error", (error: string) => {
        setMessage({ type: "error", text: error })
        setIsSaving(false)
      })

      return () => {
        socket.off("profile_data")
        socket.off("profile_updated")
        socket.off("profile_error")
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateUsername = (value: string): boolean => {
    setUsernameError(null)
    if (value.length < 3) {
      setUsernameError("Le pseudo doit faire au moins 3 caractères")
      return false
    }
    if (value.length > 16) {
      setUsernameError("Le pseudo ne doit pas dépasser 16 caractères")
      return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError("Seuls les lettres, chiffres et _ sont autorisés")
      return false
    }
    const lowerValue = value.toLowerCase()
    for (const word of FORBIDDEN_WORDS) {
      if (lowerValue.includes(word)) {
        setUsernameError("Ce pseudo contient des mots interdits")
        return false
      }
    }
    return true
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    if (value !== profile?.username) {
      validateUsername(value)
    } else {
      setUsernameError(null)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Seules les images sont acceptées" })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "L'image ne doit pas dépasser 5 Mo" })
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setIsUploadingAvatar(true)
    setMessage(null)

    try {
      // Convert to base64 and send to backend
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        const socket = getSocket()
        const playerId = localStorage.getItem("drawly_player_id")

        if (socket && playerId) {
          socket.emit("update_avatar", { playerId, avatar: base64 })

          socket.once("avatar_updated", (newUrl: string) => {
            setAvatarUrl(newUrl)
            setAvatarPreview(null)
            setMessage({ type: "success", text: "Avatar mis à jour !" })
            setIsUploadingAvatar(false)
          })

          socket.once("avatar_error", (error: string) => {
            setAvatarPreview(null)
            setMessage({ type: "error", text: error })
            setIsUploadingAvatar(false)
          })
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Avatar upload error:", error)
      setAvatarPreview(null)
      setMessage({ type: "error", text: "Erreur lors de l'upload de l'avatar" })
      setIsUploadingAvatar(false)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true)
    const socket = getSocket()
    const playerId = localStorage.getItem("drawly_player_id")

    if (socket && playerId) {
      socket.emit("remove_avatar", { playerId })

      socket.once("avatar_removed", () => {
        setAvatarUrl("")
        setMessage({ type: "success", text: "Avatar supprimé" })
        setIsUploadingAvatar(false)
      })
    } else {
      setIsUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    if (username !== profile?.username && !validateUsername(username)) {
      setIsSaving(false)
      return
    }

    const socket = getSocket()
    const playerId = localStorage.getItem("drawly_player_id")

    if (socket && playerId) {
      socket.emit("update_profile", {
        playerId,
        username,
        displayName,
        bio,
      })
    } else {
      setMessage({ type: "error", text: "Non connecté au serveur" })
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    localStorage.removeItem("drawly_player_id")
    localStorage.removeItem("drawly_player_name")
    router.push("/")
    router.refresh()
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    const socket = getSocket()
    const playerId = localStorage.getItem("drawly_player_id")

    if (socket && playerId) {
      socket.emit("delete_account", { playerId })

      socket.once("account_deleted", () => {
        localStorage.removeItem("drawly_player_id")
        localStorage.removeItem("drawly_player_name")
        router.push("/")
        router.refresh()
      })
    }
  }

  const stats = [
    { label: "Parties jouées", value: profile?.games_played || 0, icon: Target },
    { label: "Victoires", value: profile?.games_won || 0, icon: Trophy },
    { label: "Score total", value: profile?.total_score || 0, icon: Crown },
    { label: "Dessins", value: profile?.drawings_made || 0, icon: Palette },
  ]

  const currentAvatar = avatarPreview || avatarUrl

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d25] to-[#080818]" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au jeu
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="glass-strong rounded-2xl p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4 group">
                {currentAvatar ? (
                  <img
                    src={currentAvatar || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/30"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}

                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/80 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  {currentAvatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                      className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/80 transition-colors md:hidden"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-white/40 mb-2">Cliquez pour changer l'avatar</p>

              <h2 className="text-xl font-bold text-white">{profile?.username || "Joueur"}</h2>

              {profile?.is_premium && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-400">{profile.premium_plan || "Premium"}</span>
                </div>
              )}

              {(profile?.warnings || 0) > 0 && (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{profile?.warnings} avertissement(s)</span>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {stats.map((stat, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl text-center">
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-white/30 text-center">
              Membre depuis {new Date(profile?.created_at || Date.now()).toLocaleDateString("fr-FR")}
            </p>
          </div>

          {/* Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-primary" />
                Modifier le profil
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Pseudo</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="Ton pseudo unique"
                      className={`h-12 pl-11 bg-white/5 border-white/10 text-white ${usernameError ? "border-red-500/50" : ""}`}
                      maxLength={16}
                    />
                  </div>
                  {usernameError && <p className="text-xs text-red-400 mt-1">{usernameError}</p>}
                  <p className="text-xs text-white/30 mt-1">Ce pseudo sera visible par tous les joueurs</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Nom d'affichage</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ton nom d'affichage"
                    className="h-12 bg-white/5 border-white/10 text-white"
                    maxLength={32}
                  />
                  <p className="text-xs text-white/30 mt-1">Optionnel - peut être différent du pseudo</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Bio</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Parle-nous de toi..."
                    className="bg-white/5 border-white/10 text-white resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-white/30 mt-1">{bio.length}/200 caractères</p>
                </div>

                {message && (
                  <div
                    className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                      message.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : message.type === "warning"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          : "bg-red-500/10 border border-red-500/20 text-red-400"
                    }`}
                  >
                    {message.type === "success" && <Check className="w-4 h-4 flex-shrink-0" />}
                    {message.type === "warning" && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    {message.type === "error" && <ImageOff className="w-4 h-4 flex-shrink-0" />}
                    {message.text}
                  </div>
                )}

                <Button
                  onClick={handleSave}
                  disabled={isSaving || !!usernameError}
                  className="w-full h-12 bg-gradient-to-r from-primary to-purple-500"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" /> Sauvegarder
                    </>
                  )}
                </Button>
              </div>
            </div>

            {!profile?.is_premium && (
              <div className="glass-strong rounded-2xl p-6 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  Passer à Premium
                </h3>
                <p className="text-sm text-white/60 mb-4">
                  Débloque des fonctionnalités exclusives avec le Plan Astral !
                </p>
                <Link href="/premium">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    Découvrir Premium
                  </Button>
                </Link>
              </div>
            )}

            <div className="glass-strong rounded-2xl p-6 border border-red-500/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                Zone de danger
              </h3>

              <div className="space-y-3">
                <Button
                  onClick={handleLogout}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-12 border-white/10 text-white hover:bg-white/5 bg-transparent"
                >
                  <LogOut className="w-5 h-5 mr-2" /> Se déconnecter
                </Button>

                {!showDeleteConfirm ? (
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="outline"
                    className="w-full h-12 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-5 h-5 mr-2" /> Supprimer mon compte
                  </Button>
                ) : (
                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                    <p className="text-sm text-red-400 mb-3">
                      Cette action est irréversible. Toutes vos données seront supprimées.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        variant="outline"
                        className="flex-1 border-white/10"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className="flex-1 bg-red-500 hover:bg-red-600"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmer"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
