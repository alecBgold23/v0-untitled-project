"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

export function ThemeTransition() {
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    // Add transition class to html element
    document.documentElement.classList.add("theme-transition")

    // Remove it after transitions are complete
    const timeout = setTimeout(() => {
      document.documentElement.classList.remove("theme-transition")
    }, 300)

    return () => {
      clearTimeout(timeout)
      document.documentElement.classList.remove("theme-transition")
    }
  }, [theme, resolvedTheme])

  return null
}
