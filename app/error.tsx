"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>

      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        We're sorry, but there was an error processing your request. Our team has been notified.
      </p>

      <div className="flex gap-4">
        <Button onClick={() => (window.location.href = "/")} variant="outline">
          Go Home
        </Button>

        <Button onClick={() => reset()} variant="default">
          Try Again
        </Button>
      </div>
    </div>
  )
}
