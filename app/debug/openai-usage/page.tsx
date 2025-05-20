"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Clock, AlertTriangle } from "lucide-react"

export default function OpenAIUsagePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasKey, setHasKey] = useState(false)
  const [lastUsed, setLastUsed] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<string | null>(null)

  const checkKeyUsage = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/openai-key-usage")
      const data = await response.json()

      setHasKey(data.hasKey)
      setLastUsed(data.lastUsed)
      setCurrentTime(data.currentTime)
    } catch (error) {
      console.error("Error checking OpenAI key usage:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkKeyUsage()

    // Check every 30 seconds
    const interval = setInterval(checkKeyUsage, 30000)
    return () => clearInterval(interval)
  }, [])

  // Calculate time difference
  const getTimeDifference = () => {
    if (!lastUsed || !currentTime) return "Unknown"

    const lastUsedDate = new Date(lastUsed)
    const currentTimeDate = new Date(currentTime)

    const diffMs = currentTimeDate.getTime() - lastUsedDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Less than a minute ago"
    if (diffMins === 1) return "1 minute ago"
    if (diffMins < 60) return `${diffMins} minutes ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return "1 hour ago"
    if (diffHours < 24) return `${diffHours} hours ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "1 day ago"
    return `${diffDays} days ago`
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">OpenAI API Key Usage Monitor</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            OpenAI API Key Usage
          </CardTitle>
          <CardDescription>Monitor when your OpenAI API key was last used</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="font-medium">API Key Status</p>
                <p className="text-sm mt-1">
                  {hasKey ? "✅ OpenAI API key is configured" : "❌ OpenAI API key is not configured"}
                </p>
              </div>

              {hasKey && (
                <>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="font-medium">Last Used</p>
                    <p className="text-sm mt-1">
                      {lastUsed ? (
                        <>
                          {new Date(lastUsed).toLocaleString()} ({getTimeDifference()})
                        </>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          No recent usage detected
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="font-medium">Current Server Time</p>
                    <p className="text-sm mt-1">{currentTime ? new Date(currentTime).toLocaleString() : "Unknown"}</p>
                  </div>
                </>
              )}

              <div className="p-4 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200 rounded-md">
                <p className="font-medium">How OpenAI Key Usage Is Tracked</p>
                <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                  <li>The system logs when the OpenAI API key is accessed</li>
                  <li>If you're being billed but no usage is shown, check server logs</li>
                  <li>This page only tracks usage within this application</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button onClick={checkKeyUsage} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Refresh Usage Data"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
