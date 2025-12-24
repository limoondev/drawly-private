"use client"

import Link from "next/link"
import {
  Pencil,
  Heart,
  Twitter,
  MessageCircle,
  Github,
  Mail,
  Gamepad2,
  Shield,
  FileText,
  HelpCircle,
  Sparkles,
} from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    jeu: [
      { label: "Jouer", href: "/", icon: Gamepad2 },
      { label: "Règles du jeu", href: "/rules", icon: FileText },
      { label: "À propos", href: "/about", icon: HelpCircle },
      { label: "Patch Notes", href: "/patch-notes", icon: Sparkles },
      { label: "Premium", href: "/premium", icon: Sparkles },
      { label: "Status", href: "/status", icon: Shield },
    ],
    legal: [
      { label: "Conditions d'utilisation", href: "/terms" },
      { label: "Politique de confidentialité", href: "/privacy" },
      { label: "Règles de la communauté", href: "/rules" },
    ],
    support: [
      { label: "Centre d'aide", href: "/about" },
      { label: "Signaler un bug", href: "mailto:support@drawly.app" },
      { label: "Contact", href: "mailto:contact@drawly.app" },
    ],
  }

  const socials = [
    { label: "Discord", href: "https://discord.gg/drawly", icon: MessageCircle, color: "hover:bg-[#5865F2]" },
    { label: "Twitter", href: "https://twitter.com/drawlyapp", icon: Twitter, color: "hover:bg-[#1DA1F2]" },
    { label: "GitHub", href: "https://github.com/drawly", icon: Github, color: "hover:bg-[#333]" },
  ]

  return (
    <footer className="relative mt-auto">
      <div className="bg-black border-t border-white/10">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand section */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-primary via-purple-500 to-secondary rounded-xl flex items-center justify-center shadow-xl">
                    <Pencil className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-white">Drawly</span>
                  <span className="block text-xs text-white/40">Le jeu de dessin multijoueur</span>
                </div>
              </Link>
              <p className="text-sm text-white/50 leading-relaxed max-w-sm mb-6">
                Dessine, devine et amuse-toi avec tes amis dans ce jeu de dessin multijoueur en temps réel. Gratuit,
                sans inscription, et accessible à tous !
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-3">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-all ${social.color}`}
                    title={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Jeu links */}
            <div>
              <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Jeu</h4>
              <ul className="space-y-3">
                {links.jeu.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors inline-flex items-center gap-2 group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Légal</h4>
              <ul className="space-y-3">
                {links.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors inline-flex items-center gap-2 group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support links */}
            <div>
              <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3">
                {links.support.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        className="text-sm text-white/50 hover:text-white transition-colors inline-flex items-center gap-2 group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/50 hover:text-white transition-colors inline-flex items-center gap-2 group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              {/* Newsletter */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h5 className="font-semibold text-white text-sm mb-3">Newsletter</h5>
                <p className="text-xs text-white/40 mb-3">Reçois les dernières mises à jour</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="ton@email.com"
                    className="flex-1 h-9 px-3 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                  />
                  <button className="h-9 px-4 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-lg transition-colors">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 bg-black/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-white/30">© {currentYear} Drawly. Tous droits réservés.</p>
              <div className="flex items-center gap-6">
                <Link href="/terms" className="text-xs text-white/30 hover:text-white/50 transition-colors">
                  CGU
                </Link>
                <Link href="/privacy" className="text-xs text-white/30 hover:text-white/50 transition-colors">
                  Confidentialité
                </Link>
                <span className="text-xs text-white/30 flex items-center gap-1">
                  Made with <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> in France
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
