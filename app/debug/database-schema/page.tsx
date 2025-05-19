"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function DatabaseSchemaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [schemaData, setSchemaData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkSchema = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ensure-image-url-column")

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      setSchemaData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check database schema")
      console.error("Error checking schema:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkSchema()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Database Schema Debug</h1>

      <Card className="w-full max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Database Schema</CardTitle>
          <CardDescription>Check if the image_url column exists in the sell_items table</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={checkSchema} disabled={isLoading} className="mb-4">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Schema"
            )}
          </Button>

          {error && (
            <div className="p-4 mb-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {schemaData && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Column Status:</h3>
                <p>
                  {schemaData.columnExists
                    ? "✅ image_url column exists in the sell_items table"
                    : "❌ image_url column does NOT exist in the sell_items table"}
                </p>
              </div>

              {schemaData.columnDetails && schemaData.columnDetails.length > 0 && (
                <div>
                  <h3 className="font-medium">Column Details:</h3>
                  <ul className="list-disc pl-5">
                    {schemaData.columnDetails.map((col: any, index: number) => (
                      <li key={index}>
                        Name: <span className="font-mono">{col.column_name}</span>, Type:{" "}
                        <span className="font-mono">{col.data_type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-medium">Full Response:</h3>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-md overflow-x-auto">
                  {JSON.stringify(schemaData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
