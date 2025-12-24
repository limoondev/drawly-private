"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Settings, LogOut, Crown, LogIn, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import { getSocket } from "@/lib/socket-client"

interface UserProfile {
  id: string
  username: string
  email: string
  avatar_url: string | null
  is_premium: boolean
}

export function UserMenu() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check localStorage for user session
    const userId = localStorage.getItem("drawly_user_id")
    const username = localStorage.getItem("drawly_username")
    const email = localStorage.getItem("drawly_email")
    const isPremium = localStorage.getItem("drawly_is_premium") === "true"
    const avatarUrl = localStorage.getItem("drawly_avatar_url")

    if (userId && username) {
      setUser({
        id: userId,
        username,
        email: email || "",
        avatar_url: avatarUrl,
        is_premium: isPremium,
      })

      // Sync with backend
      const socket = getSocket()
      if (socket?.connected) {
        socket.emit("user:get_profile", { userId }, (response: { success: boolean; profile?: UserProfile }) => {
          if (response.success && response.profile) {
            setUser(response.profile)
            localStorage.setItem("drawly_is_premium", response.profile.is_premium ? "true" : "false")
          }
        })
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("drawly_user_id")
    localStorage.removeItem("drawly_username")
    localStorage.removeItem("drawly_email")
    localStorage.removeItem("drawly_is_premium")
    localStorage.removeItem("drawly_avatar_url")
    localStorage.removeItem("drawly_auth_token")
    setUser(null)
    router.refresh()
  }

  if (isLoading) {
    return <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
            <LogIn className="w-4 h-4 mr-2" />
            Connexion
          </Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button size="sm" className="bg-gradient-to-r from-primary to-purple-500 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Inscription
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative group">
          {user.avatar_url ? (
            <img
              src={user.avatar_url || "/placeholder.svg"}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/30 group-hover:border-primary/60 transition-colors"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          {user.is_premium && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-[#0a0a1a]">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-strong border-white/10">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-white">{user.username}</p>
          <p className="text-xs text-white/50">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild>
          <Link
            href="/account"
            className="cursor-pointer text-white/70 hover:text-white focus:text-white focus:bg-white/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Mon compte
          </Link>
        </DropdownMenuItem>
        {!user.is_premium && (
          <DropdownMenuItem asChild>
            <Link
              href="/premium"
              className="cursor-pointer text-amber-400 hover:text-amber-300 focus:text-amber-300 focus:bg-amber-500/10"
            >
              <Crown className="w-4 h-4 mr-2" />
              Passer Premium
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Deconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
