"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EnvStatus() {
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkEnvVars() {
      try {
        const response = await fetch("/api/check-env")
        const data = await response.json()
        setMissingVars(data.missingVars || [])
      } catch (error) {
        console.error("Failed to check environment variables:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkEnvVars()
  }, [])

  if (isLoading) {
    return null
  }

  if (missingVars.length === 0) {
    return (
      <Alert className="bg-green-50 border-green-200 mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Environment Ready</AlertTitle>
        <AlertDescription className="text-green-700">
          All required environment variables are configured.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Missing Environment Variables</AlertTitle>
      <AlertDescription>The following environment variables are missing: {missingVars.join(", ")}</AlertDescription>
    </Alert>
  )
}
