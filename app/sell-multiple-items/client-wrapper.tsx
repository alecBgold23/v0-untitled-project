"use client"

import { Suspense, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

// Dynamically import the form component with SSR disabled
const SellMultipleItemsForm = dynamic(() => import("@/components/sell-multiple-items-form"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Skeleton className="h-12 w-full mb-4" />
      <Skeleton className="h-64 w-full mb-4" />
      <Skeleton className="h-12 w-1/2 mb-4" />
      <Skeleton className="h-12 w-full" />
    </div>
  ),
})

export default function ClientWrapper() {
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [key, setKey] = useState(Date.now()) // Used to force re-render

  const handleRetry = () => {
    setIsRetrying(true)
    setError(null)
    setKey(Date.now()) // Force a complete re-render with a new key
    setTimeout(() => setIsRetrying(false), 100)
  }

  // Error boundary for the form
  const handleError = (err: Error) => {
    console.error("Form error:", err)
    setError("There was an error loading the form. Please try again.")
  }

  // Add a global error handler for unhandled errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Global error:", event.error)
      // Only set error if it's not already set to avoid loops
      if (!error) {
        setError("An unexpected error occurred. Please try again.")
      }
      event.preventDefault()
    }

    window.addEventListener("error", handleGlobalError)
    return () => window.removeEventListener("error", handleGlobalError)
  }, [error])

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-4xl mx-auto p-6">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-12 w-1/2 mb-4" />
          <Skeleton className="h-12 w-full" />
        </div>
      }
    >
      {!isRetrying && <SellMultipleItemsForm key={key} onError={handleError} />}
    </Suspense>
  )
}
