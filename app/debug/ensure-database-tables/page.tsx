"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function EnsureDatabaseTablesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const ensureTables = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ensure-database-tables")

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ensure database tables")
      console.error("Error ensuring database tables:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    ensureTables()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Ensure Database Tables</h1>

      <Card className="w-full max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Database Table Setup</CardTitle>
          <CardDescription>
            This will check if the required database tables exist and create them if needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={ensureTables} disabled={isLoading} className="mb-4">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check and Fix Database Tables"
            )}
          </Button>

          {error && (
            <div className="p-4 mb-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Error:</p>
              </div>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <h3 className="font-medium">Status:</h3>
                <p>{result.success ? result.message : result.error}</p>
              </div>

              <div>
                <h3 className="font-medium">Full Response:</h3>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-md overflow-x-auto mt-2">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            After ensuring your database tables exist, try using the sell-multiple-items page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            The changes made should resolve the errors with the database structure. If you continue to experience
            issues, please check the error messages carefully and try the following:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Make sure your Supabase database is properly configured</li>
            <li>Check if you have the correct permissions to create and modify tables</li>
            <li>Try using a minimal set of fields when submitting items</li>
            <li>Check the browser console for detailed error messages</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
