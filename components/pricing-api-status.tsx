"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function PricingApiStatus() {
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "error">("loading")
  const [message, setMessage] = useState<string>("")

  const checkApiKey = async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/check-pricing-key")
      const data = await response.json()

      if (data.valid) {
        setStatus("valid")
      } else {
        setStatus("invalid")
        setMessage(data.error || "API key is invalid or not configured.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error checking API key status.")
    }
  }

  useEffect(() => {
    checkApiKey()
  }, [])

  return (
    <div className="space-y-4">
      <Alert variant={status === "valid" ? "default" : "destructive"}>
        <div className="flex items-center gap-2">
          {status === "loading" && <AlertCircle className="h-5 w-5 animate-pulse" />}
          {status === "valid" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {(status === "invalid" || status === "error") && <XCircle className="h-5 w-5" />}
          <AlertTitle>
            {status === "loading" && "Checking Pricing API Key..."}
            {status === "valid" && "Pricing API Key is Valid"}
            {status === "invalid" && "Pricing API Key is Invalid"}
            {status === "error" && "Error Checking Pricing API Key"}
          </AlertTitle>
        </div>
        {(status === "invalid" || status === "error") && (
          <AlertDescription className="mt-2">{message}</AlertDescription>
        )}
      </Alert>
      <Button onClick={checkApiKey} variant="outline" size="sm">
        Check Again
      </Button>
    </div>
  )
}
