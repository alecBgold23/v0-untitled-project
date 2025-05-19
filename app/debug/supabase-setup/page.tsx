"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Database, HardDrive, RefreshCw } from "lucide-react"

export default function SupabaseSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const initializeSupabase = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/supabase-init")
      const data = await response.json()

      setResult(data)

      if (!data.success) {
        setError(data.error || "Failed to initialize Supabase")
      }
    } catch (err) {
      console.error("Error initializing Supabase:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check status on page load
    initializeSupabase()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Supabase Setup</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase Configuration
            </CardTitle>
            <CardDescription>Initialize and check your Supabase storage and database configuration</CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Initializing Supabase...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : result ? (
              <div className="space-y-6">
                {/* Storage Status */}
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                    <HardDrive className="h-5 w-5" />
                    Storage Status
                    {result.storage?.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </h3>

                  {result.storage?.success ? (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Storage buckets have been initialized successfully.</p>

                      {result.storage.results && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium mb-1">Bucket Status:</h4>
                          <ul className="text-sm space-y-1">
                            {result.storage.results.map((bucket: any, i: number) => (
                              <li key={i} className="flex items-center gap-1">
                                {bucket.success ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                )}
                                <span>
                                  {bucket.bucket}: {bucket.exists ? "Already exists" : "Created"}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <AlertTitle>Storage Error</AlertTitle>
                      <AlertDescription>
                        {result.storage?.error || "Failed to initialize storage buckets"}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Database Status */}
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                    <Database className="h-5 w-5" />
                    Database Status
                    {result.database?.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </h3>

                  {result.database?.success ? (
                    <div>
                      <p className="text-sm text-gray-500">{result.database.message}</p>
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <AlertTitle>Database Error</AlertTitle>
                      <AlertDescription>
                        {result.database?.error || "Failed to initialize database tables"}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            ) : (
              <p>No data available</p>
            )}
          </CardContent>

          <CardFooter>
            <Button onClick={initializeSupabase} disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {isLoading ? "Initializing..." : "Reinitialize Supabase"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
