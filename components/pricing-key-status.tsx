"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function PricingKeyStatus() {
  const [status, setStatus] = useState<"loading" | "available" | "unavailable">("loading")
  const [timestamp, setTimestamp] = useState<string>("")

  useEffect(() => {
    const checkPricingKey = async () => {
      try {
        const response = await fetch("/api/check-pricing-key")
        const data = await response.json()

        if (data.hasPricingKey) {
          setStatus("available")
        } else {
          setStatus("unavailable")
        }

        setTimestamp(data.timestamp)
      } catch (error) {
        console.error("Error checking pricing API key:", error)
        setStatus("unavailable")
      }
    }

    checkPricingKey()
  }, [])

  if (status === "loading") {
    return (
      <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Checking Pricing API Key</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Verifying if the Pricing OpenAI API key is available...
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "available") {
    return (
      <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-300">Pricing API Key Available</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          The Pricing OpenAI API key is properly configured.
          <div className="text-xs mt-1 opacity-70">Last checked: {new Date(timestamp).toLocaleString()}</div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-300">Pricing API Key Not Available</AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-400">
        The Pricing OpenAI API key is not configured or is invalid.
        <div className="text-xs mt-1 opacity-70">
          Last checked: {timestamp ? new Date(timestamp).toLocaleString() : "Unknown"}
        </div>
      </AlertDescription>
    </Alert>
  )
}
