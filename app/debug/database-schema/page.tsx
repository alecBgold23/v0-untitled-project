"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function DatabaseSchemaDebug() {
  const [schemaData, setSchemaData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSchema = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug-database-schema")

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      setSchemaData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch schema")
      console.error("Error fetching schema:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchema()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Database Schema Debug</h1>

      <Button onClick={fetchSchema} disabled={loading} className="mb-6">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          "Refresh Schema"
        )}
      </Button>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {schemaData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Table Columns</CardTitle>
              <CardDescription>Columns in the sell_items table</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="border p-2 text-left">Column Name</th>
                      <th className="border p-2 text-left">Data Type</th>
                      <th className="border p-2 text-left">Nullable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(schemaData.columns) ? (
                      schemaData.columns.map((column: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="border p-2">{column.column_name}</td>
                          <td className="border p-2">{column.data_type}</td>
                          <td className="border p-2">{column.is_nullable ? "Yes" : "No"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="border p-2 text-center">
                          No column data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Data</CardTitle>
              <CardDescription>A sample row from the sell_items table</CardDescription>
            </CardHeader>
            <CardContent>
              {schemaData.sampleData && schemaData.sampleData !== "No data found" ? (
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
                  {JSON.stringify(schemaData.sampleData, null, 2)}
                </pre>
              ) : (
                <p>No sample data available</p>
              )}

              {schemaData.sampleError && (
                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <p className="text-yellow-700">{schemaData.sampleError}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
