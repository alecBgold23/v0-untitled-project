"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Database, Check, AlertCircle } from "lucide-react"

export default function EnsurePhotoCountPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runMigration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/ensure-photo-count-column")
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Failed to run migration")
      }
    } catch (err) {
      console.error("Error running migration:", err)
      setError(err instanceof Error ? err.message : "Unknown error running migration")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-run the migration when the page loads
    runMigration()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Ensure Photo Count Column
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="ml-2">Running migration...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="font-medium text-red-800">Error</h3>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="font-medium text-green-800">Success</h3>
                </div>
                <p className="text-green-700 mt-1">{result.message}</p>
              </div>
            )}

            <Button onClick={runMigration} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                "Run Migration Again"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
