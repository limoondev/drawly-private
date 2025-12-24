"use client"

import Link from "next/link"
import { Info, FileText, BookOpen, Activity } from "lucide-react"

const navItems = [
  { href: "/about", label: "A Propos", icon: Info },
  { href: "/patch-notes", label: "Patch Notes", icon: FileText },
  { href: "/rules", label: "Regles", icon: BookOpen },
  { href: "/status", label: "Status", icon: Activity },
]

export function NavigationBar() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all whitespace-nowrap"
        >
          <item.icon className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}
