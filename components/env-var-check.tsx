"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EnvVarCheckProps {
  title?: string
  description?: string
  variables: string[]
  checkEndpoint?: string
}

export function EnvVarCheck({
  title = "Environment Variables",
  description = "Check if required environment variables are set",
  variables = [],
  checkEndpoint = "/api/check-env",
}: EnvVarCheckProps) {
  const [status, setStatus] = useState<Record<string, boolean | null>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkVariables = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(checkEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ variables }),
      })

      if (!response.ok) {
        throw new Error(`Error checking variables: ${response.status}`)
      }

      const data = await response.json()
      setStatus(data.status || {})
    } catch (err: any) {
      console.error("Error checking environment variables:", err)
      setError(err.message || "Failed to check variables")
      // Initialize all as null (unknown)
      const nullStatus: Record<string, boolean | null> = {}
      variables.forEach((v) => {
        nullStatus[v] = null
      })
      setStatus(nullStatus)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkVariables()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {variables.map((variable) => (
            <div key={variable} className="flex items-center justify-between text-sm p-2 border rounded-md">
              <span className="font-mono">{variable}</span>
              <span>
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                ) : status[variable] === true ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : status[variable] === false ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="outline" size="sm" onClick={checkVariables} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
