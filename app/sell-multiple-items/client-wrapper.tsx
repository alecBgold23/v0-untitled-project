"use client"

import { Suspense, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

// Dynamically import the form component with SSR disabled and a shorter timeout
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
  const [isLoading, setIsLoading] = useState(true)
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null)

  // Set a timeout to detect if loading takes too long
  useEffect(() => {
    setIsLoading(true)

    // Clear any existing timeout
    if (loadTimeout) {
      clearTimeout(loadTimeout)
    }

    // Set a new timeout - if loading takes more than 10 seconds, show retry option
    const timeout = setTimeout(() => {
      setIsLoading(false)
      setError("The form is taking too long to load. Please try again.")
    }, 10000)

    setLoadTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [key])

  // Clear loading state when component mounts successfully
  useEffect(() => {
    return () => {
      setIsLoading(false)
      if (loadTimeout) clearTimeout(loadTimeout)
    }
  }, [])

  const handleRetry = () => {
    setIsRetrying(true)
    setError(null)
    setKey(Date.now()) // Force a complete re-render with a new key
    setTimeout(() => setIsRetrying(false), 100)
  }

  // Error boundary for the form
  const handleError = (err: Error) => {
    console.error("Form error:", err)
    setIsLoading(false)
    setError("There was an error loading the form. Please try again.")
  }

  // Add a global error handler for unhandled errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Global error:", event.error)
      // Only set error if it's not already set to avoid loops
      if (!error) {
        setIsLoading(false)
        setError("An unexpected error occurred. Please try again.")
      }
      event.preventDefault()
    }

    window.addEventListener("error", handleGlobalError)
    return () => window.removeEventListener("error", handleGlobalError)
  }, [error])

  // Component loaded successfully
  const handleLoaded = () => {
    setIsLoading(false)
    if (loadTimeout) clearTimeout(loadTimeout)
  }

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
      {!isRetrying && (
        <>
          {isLoading && (
            <div className="fixed top-4 right-4 z-50">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="flex items-center gap-2 bg-white shadow-md"
              >
                <RefreshCw className="h-3 w-3 animate-spin" />
                Loading...
              </Button>
            </div>
          )}
          <SellMultipleItemsForm key={key} onError={handleError} onLoad={handleLoaded} />
        </>
      )}
    </Suspense>
  )
}
