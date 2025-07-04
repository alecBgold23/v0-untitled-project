"use client"

import { useEffect } from "react"

export function ThemeTransition() {
  useEffect(() => {
    // Add theme transition class to body
    document.body.classList.add("theme-transition")

    return () => {
      document.body.classList.remove("theme-transition")
    }
  }, [])

  return null
}
