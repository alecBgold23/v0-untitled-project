"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Loader2, Settings } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function OpenAIAPIStatus() {
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "unknown">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/check-openai-key")
        const data = await response.json()

        if (data.success) {
          setStatus("valid")
          setMessage("OpenAI API key is valid and working")
        } else if (data.hasKey) {
          setStatus("invalid")
          setMessage(data.message || "OpenAI API key is invalid or has expired")
        } else {
          setStatus("unknown")
          setMessage(data.message || "OpenAI API key is not configured")
        }
      } catch (error) {
        console.error("Error checking API key:", error)
        setStatus("unknown")
        setMessage("Could not check OpenAI API key status")
      }
    }

    checkApiKey()
  }, [])

  if (status === "loading") {
    return (
      <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Checking API Status</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Checking OpenAI API key status...
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "valid") {
    return (
      <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-300">API Connected</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          {message}. AI-powered features are available.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900">
      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      <AlertTitle className="text-red-800 dark:text-red-300">API Not Configured</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span className="text-red-700 dark:text-red-400">{message}</span>
        <Link href="/settings/api-key" passHref>
          <Button variant="outline" size="sm" className="w-fit mt-1">
            <Settings className="mr-2 h-4 w-4" />
            Configure API Key
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  )
}
