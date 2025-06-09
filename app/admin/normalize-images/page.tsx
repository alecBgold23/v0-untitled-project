"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function NormalizeImagesPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runNormalization = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/normalize-image-urls")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to normalize image URLs")
      }

      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Normalize Image URLs</CardTitle>
          <CardDescription>
            This tool will normalize all image URLs in the database to a consistent format. It will collect URLs from
            various fields (image_url, image_urls, image_path, image_paths) and consolidate them into the standard
            image_urls array format.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {results && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-700 font-medium">Normalization completed successfully!</p>
              </div>
              <div className="pl-7">
                <p className="text-green-700">Total items processed: {results.results.total}</p>
                <p className="text-green-700">Items updated: {results.results.updated}</p>
                <p className="text-green-700">Items skipped: {results.results.skipped}</p>
                <p className="text-green-700">Errors: {results.results.errors}</p>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Important Notes:</h3>
            <ul className="list-disc pl-5 text-yellow-700 space-y-1">
              <li>This process will modify your database. Consider backing up your data first.</li>
              <li>The process may take some time if you have many records.</li>
              <li>After normalization, all image URLs will be stored in the image_urls column as arrays.</li>
              <li>The image_url column will be kept for backward compatibility.</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={runNormalization} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Normalizing...
              </>
            ) : (
              "Run Normalization"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
