"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function OpenAIKeyDebugPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [keyStatus, setKeyStatus] = useState<"valid" | "invalid" | "not-configured" | "error">("not-configured")
  const [message, setMessage] = useState("")

  const checkOpenAIKey = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/check-openai-key")
      const data = await response.json()

      if (response.ok) {
        if (data.isValid) {
          setKeyStatus("valid")
          setMessage(data.message || "OpenAI API key is valid and working.")
        } else if (data.isConfigured) {
          setKeyStatus("invalid")
          setMessage(data.message || "OpenAI API key is configured but not working.")
        } else {
          setKeyStatus("not-configured")
          setMessage(data.message || "OpenAI API key is not configured.")
        }
      } else {
        setKeyStatus("error")
        setMessage(data.error || "Error checking OpenAI API key.")
      }
    } catch (error) {
      console.error("Error checking OpenAI API key:", error)
      setKeyStatus("error")
      setMessage("Error checking OpenAI API key. See console for details.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkOpenAIKey()
  }, [])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">OpenAI API Key Debug</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : keyStatus === "valid" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : keyStatus === "invalid" ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : keyStatus === "not-configured" ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            OpenAI API Key Status
          </CardTitle>
          <CardDescription>Check the status of your OpenAI API key configuration</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="py-2">
              <div
                className={`p-4 rounded-md ${
                  keyStatus === "valid"
                    ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                    : keyStatus === "invalid"
                      ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                      : keyStatus === "not-configured"
                        ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"
                        : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                }`}
              >
                <p className="font-medium">
                  {keyStatus === "valid"
                    ? "✅ OpenAI API Key is Valid"
                    : keyStatus === "invalid"
                      ? "❌ OpenAI API Key is Invalid"
                      : keyStatus === "not-configured"
                        ? "⚠️ OpenAI API Key is Not Configured"
                        : "❌ Error Checking OpenAI API Key"}
                </p>
                {message && <p className="mt-2 text-sm">{message}</p>}
              </div>

              {keyStatus === "not-configured" && (
                <div className="mt-4 p-4 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200 rounded-md">
                  <p className="font-medium">How to Configure Your OpenAI API Key</p>
                  <ol className="mt-2 text-sm list-decimal list-inside space-y-1">
                    <li>
                      Go to{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        OpenAI API Keys
                      </a>{" "}
                      page
                    </li>
                    <li>Create a new API key</li>
                    <li>
                      Add the key to your environment variables as{" "}
                      <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">OPENAI_API_KEY</code>
                    </li>
                    <li>Restart your application</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={checkOpenAIKey} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Again"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Check which OpenAI API key environment variables are configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="font-medium">OPENAI_API_KEY</p>
                <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                  {process.env.OPENAI_API_KEY ? "Configured ✅" : "Not configured ❌"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="font-medium">PRICING_OPENAI_API_KEY</p>
                <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                  {process.env.PRICING_OPENAI_API_KEY ? "Configured ✅" : "Not configured ❌"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Note: The application will use PRICING_OPENAI_API_KEY if available, otherwise it will fall back to
              OPENAI_API_KEY.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
