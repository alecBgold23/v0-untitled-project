"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeDebug() {
  const { theme, resolvedTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Only show debug panel when pressing Ctrl+Shift+D
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setVisible((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (!mounted || !visible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-card p-2 rounded border border-border text-xs z-50 text-foreground">
      <div>Theme: {theme}</div>
      <div>Resolved: {resolvedTheme}</div>
      <div>System: {systemTheme}</div>
      <div>HTML class: {document.documentElement.classList.contains("dark") ? "dark" : "light"}</div>
      <button
        onClick={() => setVisible(false)}
        className="mt-1 px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs"
      >
        Close
      </button>
    </div>
  )
}
