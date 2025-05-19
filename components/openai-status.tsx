"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { hasOpenAIKey } from "@/lib/env"

export function OpenAIStatus() {
  const [status, setStatus] = useState<"loading" | "available" | "unavailable" | "error">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/check-openai-key")

        if (response.ok) {
          const data = await response.json()

          if (data.valid) {
            setStatus("available")
            setMessage("OpenAI API is available and working correctly.")
          } else {
            setStatus("unavailable")
            setMessage(data.message || "OpenAI API key is invalid or not configured.")
          }
        } else {
          setStatus("error")
          setMessage("Could not check OpenAI API status.")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Error checking OpenAI API status.")
      }
    }

    if (hasOpenAIKey()) {
      checkStatus()
    } else {
      setStatus("unavailable")
      setMessage("OpenAI API key is not configured.")
    }
  }, [])

  if (status === "loading") {
    return (
      <Alert className="bg-gray-100 border-gray-200">
        <AlertTriangle className="h-4 w-4 text-gray-500" />
        <AlertTitle>Checking OpenAI API Status</AlertTitle>
        <AlertDescription>Please wait while we check the API status...</AlertDescription>
      </Alert>
    )
  }

  if (status === "available") {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>OpenAI API Available</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  if (status === "unavailable") {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertTitle>OpenAI API Unavailable</AlertTitle>
        <AlertDescription>
          {message} The application will use fallback mechanisms for pricing and descriptions.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-red-50 border-red-200">
      <XCircle className="h-4 w-4 text-red-500" />
      <AlertTitle>OpenAI API Error</AlertTitle>
      <AlertDescription>
        {message} The application will use fallback mechanisms for pricing and descriptions.
      </AlertDescription>
    </Alert>
  )
}
