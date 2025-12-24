import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ClientProviders } from "@/components/client-providers"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Drawly - Jeu de dessin multijoueur",
  description:
    "Dessine, devine et gagne ! Le jeu de dessin multijoueur le plus fun. Joue avec tes amis en temps réel sans inscription.",
  generator: "v0.app",
  keywords: ["jeu", "dessin", "multijoueur", "deviner", "skribbl", "drawly", "party game", "en ligne", "gratuit"],
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Drawly - Jeu de dessin multijoueur",
    description: "Dessine, devine et gagne ! Joue avec tes amis en temps réel.",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#6366f1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ClientProviders>{children}</ClientProviders>
        <Analytics />
      </body>
    </html>
  )
}
