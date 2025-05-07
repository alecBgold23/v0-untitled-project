"use client"

import { useRouter } from "next/navigation"

// Centralized navigation helper with zero delay
export function useAppNavigation() {
  const router = useRouter()

  const navigateTo = (href: string, callback?: () => void) => {
    // No delay - immediate navigation
    router.push(href)
    if (callback) {
      callback()
    }
  }

  return { navigateTo }
}
