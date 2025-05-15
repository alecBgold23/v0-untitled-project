"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
          setMessage("OpenAI API key is configured correctly.")
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

  if (status === "loading") {
    return (
      <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-600 dark:text-blue-400">Checking API Key</AlertTitle>
        <AlertDescription className="text-blue-600/80 dark:text-blue-400/80">
          Verifying OpenAI API key configuration...
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "valid") {
    return (
      <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-600 dark:text-green-400">AI Features Ready</AlertTitle>
        <AlertDescription className="text-green-600/80 dark:text-green-400/80">
          {message} You can use AI-powered description generation.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>API Key Issue</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span>{message}</span>
        <Link href="/settings/api-key" className="inline-block">
          <Button variant="outline" size="sm" className="mt-2">
            Configure API Key
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  )
}
