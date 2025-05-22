"use client"

import type React from "react"
import { useEffect } from "react"

interface SmoothTransitionProviderProps {
  children: React.ReactNode
}

const SmoothTransitionProvider: React.FC<SmoothTransitionProviderProps> = ({ children }) => {
  // Add this useEffect to prevent unwanted scroll behavior during transitions
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Disable the browser's default scroll restoration during page transitions
      window.history.scrollRestoration = "manual"

      return () => {
        // Reset when component unmounts
        window.history.scrollRestoration = "auto"
      }
    }
  }, [])

  return <>{children}</>
}

export default SmoothTransitionProvider
