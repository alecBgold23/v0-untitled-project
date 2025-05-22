"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export default function SmoothTransitionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  useEffect(() => {
    // Apply smooth transition effect when pathname changes
    const handleRouteChange = () => {
      // Fade out
      document.body.style.opacity = "0.95"
      document.body.style.transition = "opacity 0.3s ease"

      // Fade back in
      setTimeout(() => {
        document.body.style.opacity = "1"
      }, 300)
    }

    // Set initial state
    document.body.style.opacity = "1"
    document.body.style.transition = "opacity 0.5s ease"

    // Handle route change
    handleRouteChange()

    return () => {
      // Clean up
      document.body.style.transition = ""
    }
  }, [pathname])

  return <>{children}</>
}
