"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function PricingApiStatus() {
  const [status, setStatus] = useState<"loading" | "available" | "unavailable">("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPricingApi = async () => {
      try {
        const response = await fetch("/api/check-pricing-key")

        if (!response.ok) {
          setStatus("unavailable")
          setError(`API responded with status: ${response.status}`)
          return
        }

        const data = await response.json()

        if (data.available) {
          setStatus("available")
        } else {
          setStatus("unavailable")
          setError(data.error || "Pricing API key is not configured")
        }
      } catch (error) {
        console.error("Error checking pricing API:", error)
        setStatus("unavailable")
        setError("Failed to check pricing API status")
      }
    }

    checkPricingApi()
  }, [])

  if (status === "loading") {
    return (
      <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Checking Pricing API</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Verifying if the pricing service is available...
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "available") {
    return (
      <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-300">Pricing API Available</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          The pricing service is properly configured and ready to use.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900">
      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      <AlertTitle className="text-red-800 dark:text-red-300">Pricing API Unavailable</AlertTitle>
      <AlertDescription className="text-red-700 dark:text-red-400">
        {error || "The pricing service is not available. Price estimates will not be shown."}
      </AlertDescription>
    </Alert>
  )
}
