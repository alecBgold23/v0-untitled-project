"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Page error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
        <p className="mb-6 text-gray-600">{error.message || "An unexpected error occurred"}</p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    </div>
  )
}
