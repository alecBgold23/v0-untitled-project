"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function TestOpenAIPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")
  const [response, setResponse] = useState<string>("")
  const [error, setError] = useState<string>("")

  const testApiKey = async () => {
    try {
      setStatus("loading")
      setMessage("Testing OpenAI API key...")

      const res = await fetch("/api/test-openai-key")
      const data = await res.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
        setResponse(data.response || "")
      } else {
        setStatus("error")
        setMessage(data.error || "Unknown error occurred")
        setError(JSON.stringify(data.details || {}, null, 2))
      }
    } catch (err) {
      setStatus("error")
      setMessage("Failed to test API key")
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Test OpenAI API Key</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>OpenAI API Key Test</CardTitle>
          <CardDescription>
            Test if your OpenAI API key is working correctly by making a direct API call
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testApiKey} disabled={status === "loading"} className="w-full">
            {status === "loading" ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testing API Key...
              </>
            ) : (
              "Test OpenAI API Key"
            )}
          </Button>

          {status !== "idle" && (
            <Alert variant={status === "success" ? "default" : status === "loading" ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {status === "loading" && <AlertCircle className="h-5 w-5 animate-pulse" />}
                {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {status === "error" && <XCircle className="h-5 w-5" />}
                <AlertTitle>
                  {status === "loading" && "Testing API Key..."}
                  {status === "success" && "API Key is Valid"}
                  {status === "error" && "API Key Test Failed"}
                </AlertTitle>
              </div>
              <AlertDescription className="mt-2">{message}</AlertDescription>
            </Alert>
          )}

          {status === "success" && response && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">API Response:</h3>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">{response}</p>
              </div>
            </div>
          )}

          {status === "error" && error && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Error Details:</h3>
              <div className="bg-muted p-3 rounded-md overflow-auto max-h-60">
                <pre className="text-xs">{error}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Make sure your environment variables are correctly set</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Check that you have the following environment variables set in your Vercel project:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li className="text-sm">
              <code>OPENAI_API_KEY</code> - Your OpenAI API key
            </li>
            <li className="text-sm">
              <code>PRICING_OPENAI_API_KEY</code> - Your OpenAI API key for pricing (can be the same as above)
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
