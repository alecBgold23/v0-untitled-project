"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function FixDatabaseSchemaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fixImagePathsColumn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/fix-image-paths-column")

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fix image_paths column")
      console.error("Error fixing image_paths column:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fixImagePathsColumn()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Fix Database Schema</h1>

      <Card className="w-full max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Fix image_paths Column</CardTitle>
          <CardDescription>
            This will check if the image_paths column exists in the sell_items table and create it if needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fixImagePathsColumn} disabled={isLoading} className="mb-4">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing...
              </>
            ) : (
              "Fix image_paths Column"
            )}
          </Button>

          {error && (
            <div className="p-4 mb-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Status:</h3>
                <p>{result.success ? `✅ ${result.message}` : `❌ ${result.error}`}</p>
              </div>

              {result.columnDetails && (
                <div>
                  <h3 className="font-medium">Column Details:</h3>
                  <ul className="list-disc pl-5">
                    <li>
                      Name: <span className="font-mono">{result.columnDetails.column_name}</span>
                    </li>
                    <li>
                      Type: <span className="font-mono">{result.columnDetails.data_type}</span>
                    </li>
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-medium">Full Response:</h3>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-md overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
