"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

export function ThemeAwareLogo() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="relative w-10 h-10 bg-transparent"></div>
  }

  return (
    <div className="relative w-10 h-10 overflow-hidden rounded-full">
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          theme === "dark" ? "mix-blend-screen" : "mix-blend-normal"
        }`}
        style={{
          backgroundColor: theme === "dark" ? "transparent" : "transparent",
        }}
      >
        <Image
          src="/images/blueberry-logo.png"
          alt="BluBerry Logo"
          width={40}
          height={40}
          className={`object-contain transition-all duration-300 ${
            theme === "dark" ? "brightness-110 contrast-125 mix-blend-screen" : "brightness-100 contrast-100"
          }`}
          style={{
            filter: theme === "dark" ? "drop-shadow(0 0 2px rgba(255,255,255,0.3))" : "none",
          }}
        />
      </div>
    </div>
  )
}
