"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { PricingApiStatus } from "@/components/pricing-api-status"

export default function PricingKeyDebugPage() {
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "error">("loading")
  const [message, setMessage] = useState<string>("")
  const [details, setDetails] = useState<any>(null)
  const [models, setModels] = useState<string[]>([])
  const [isChecking, setIsChecking] = useState(false)

  const checkApiKey = async () => {
    setIsChecking(true)
    setStatus("loading")
    try {
      const response = await fetch("/api/check-pricing-key")
      const data = await response.json()

      if (data.valid) {
        setStatus("valid")
        setModels(data.models || [])
        setMessage(data.message || "API key is valid")
      } else {
        setStatus("invalid")
        setMessage(data.error || "API key is invalid or not configured.")
        setDetails(data.details || null)
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error checking API key status.")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkApiKey()
  }, [])

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Pricing API Key Debug</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pricing API Key Status</CardTitle>
            <CardDescription>Check if your PRICING_OPENAI_API_KEY is valid and working</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PricingApiStatus />

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Manual Check</h3>

              <Alert variant={status === "valid" ? "default" : status === "loading" ? "default" : "destructive"}>
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

              <Button onClick={checkApiKey} variant="outline" size="sm" className="mt-4" disabled={isChecking}>
                {isChecking ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Check Again
                  </>
                )}
              </Button>
            </div>

            {status === "valid" && models.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Available Models</h3>
                <div className="bg-muted p-3 rounded-md">
                  <ul className="list-disc pl-5 space-y-1">
                    {models.map((model, index) => (
                      <li key={index}>{model}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  These are some of the models available with your API key.
                </p>
              </div>
            )}

            {status === "invalid" && details && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Error Details</h3>
                <div className="bg-muted p-3 rounded-md overflow-auto max-h-60">
                  <pre className="text-xs">{JSON.stringify(details, null, 2)}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Check if your environment variables are properly set</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Make sure you have the following environment variables set in your Vercel project:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li className="text-sm">
                <code>PRICING_OPENAI_API_KEY</code> - Your OpenAI API key for pricing
              </li>
              <li className="text-sm">
                <code>OPENAI_API_KEY</code> - Your general OpenAI API key
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
