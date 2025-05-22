"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export default function FixPhotoCountsPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fixCounts = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/fix-photo-counts")
      const data = await response.json()

      if (response.ok) {
        setResults(data)
      } else {
        setError(data.error || "Failed to fix photo counts")
      }
    } catch (err) {
      console.error("Error fixing photo counts:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Fix Photo Counts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-500">
            This utility will check all items in your database and ensure their photo_count field matches the actual
            number of photos in storage.
          </p>

          <Button onClick={fixCounts} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing Photo Counts...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Fix Photo Counts
              </>
            )}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
              <div className="flex items-center text-red-600 font-medium">
                <AlertCircle className="h-5 w-5 mr-2" />
                Error
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                <div className="flex items-center text-green-600 font-medium">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Photo Count Fix Complete
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-500">Total Items</div>
                    <div className="text-xl font-bold">{results.summary.total}</div>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-500">Updated</div>
                    <div className="text-xl font-bold text-amber-600">{results.summary.updated}</div>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-500">Unchanged</div>
                    <div className="text-xl font-bold text-green-600">{results.summary.unchanged}</div>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-500">Errors</div>
                    <div className="text-xl font-bold text-red-600">{results.summary.errors}</div>
                  </div>
                </div>
              </div>

              {results.results.filter((r: any) => r.status === "updated").length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-amber-50 p-3 border-b">
                    <h3 className="font-medium">Updated Items</h3>
                  </div>
                  <div className="divide-y">
                    {results.results
                      .filter((r: any) => r.status === "updated")
                      .map((item: any, i: number) => (
                        <div key={i} className="p-3 flex justify-between items-center">
                          <div className="text-sm truncate">{item.id}</div>
                          <div className="text-sm">
                            <span className="text-red-500 line-through mr-2">{item.oldCount}</span>
                            <span className="text-green-500">{item.newCount}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {results.results.filter((r: any) => r.status === "error").length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-red-50 p-3 border-b">
                    <h3 className="font-medium">Errors</h3>
                  </div>
                  <div className="divide-y">
                    {results.results
                      .filter((r: any) => r.status === "error")
                      .map((item: any, i: number) => (
                        <div key={i} className="p-3 flex justify-between items-center">
                          <div className="text-sm truncate">{item.id}</div>
                          <div className="text-sm text-red-500">{item.message}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
