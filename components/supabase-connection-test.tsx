"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export function SupabaseConnectionTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug-supabase-connection")

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>Test your Supabase connection and storage configuration</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Testing connection...</span>
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-md ${result.success ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={result.success ? "text-green-700" : "text-red-700"}>{result.message}</span>
              </div>
            </div>

            {result.envInfo && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Environment Variables</h3>
                <ul className="space-y-1 text-sm">
                  {Object.entries(result.envInfo).map(([key, value]) => (
                    <li key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span className={String(value).includes("✓") ? "text-green-600" : "text-red-600"}>
                        {String(value)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.buckets && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Storage Buckets</h3>
                {result.buckets.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {result.buckets.map((bucket: string) => (
                      <li key={bucket}>{bucket}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No buckets found</p>
                )}

                <div className="mt-3 flex items-center">
                  <span className="mr-2">images2 bucket:</span>
                  {result.images2BucketExists ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" /> Exists
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" /> Missing
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">Error: {error}</span>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Click the button below to test your Supabase connection</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testConnection} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
