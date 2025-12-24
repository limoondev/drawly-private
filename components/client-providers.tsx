"use client"

import { useState, useEffect, type ReactNode } from "react"
import { ThemeEventProvider } from "@/lib/theme-events"
import { ThemedBackground } from "@/components/themed-background"
import { GlobalConfigProvider } from "@/components/global-config-provider"

interface ClientProvidersProps {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR/SSG, render children without providers
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeEventProvider>
      <ThemedBackground />
      <GlobalConfigProvider>{children}</GlobalConfigProvider>
    </ThemeEventProvider>
  )
}
