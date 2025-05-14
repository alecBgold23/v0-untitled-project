"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function OpenAIApiStatus() {
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/check-openai-key")
        const data = await response.json()

        if (data.valid) {
          setStatus("valid")
        } else {
          setStatus("invalid")
          setMessage(data.message || "OpenAI API key is not configured correctly.")
        }
      } catch (error) {
        setStatus("invalid")
        setMessage("Could not verify OpenAI API key status.")
      }
    }

    checkApiKey()
  }, [])

  // Only show the alert when there's an issue
  if (status === "loading" || status === "valid") {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>API Key Issue</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
