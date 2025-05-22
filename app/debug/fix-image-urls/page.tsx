"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function FixImageUrlsPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<any>(null)
  const [isAutoFixing, setIsAutoFixing] = useState(true)

  // Function to fix image URLs
  const fixImageUrls = async () => {
    try {
      setStatus("loading")
      setMessage("Fixing image URLs...")
      setDetails(null)

      const response = await fetch("/api/fix-image-urls")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
        setDetails(data)
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to fix image URLs")
      }
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  }

  // Auto-fix on page load
  useEffect(() => {
    if (isAutoFixing) {
      setIsAutoFixing(false)
      fixImageUrls()
    }
  }, [isAutoFixing])

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Fix Image URLs</CardTitle>
          <CardDescription>
            This tool fixes image URLs in the database to ensure they have the correct format with the bucket name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertTitle>Processing</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Success</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-red-700">Error</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {details && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Details:</h3>
              <ul className="space-y-1 text-sm">
                <li>Total records: {details.total}</li>
                <li>Fixed URLs: {details.fixed}</li>
                <li>Errors: {details.errors}</li>
                <li>Already correct: {details.total - details.fixed - details.errors}</li>
              </ul>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium">Expected URL Format</h3>
            <p className="text-sm text-gray-500 mt-1">Image URLs should follow this format:</p>
            <code className="block bg-gray-100 p-3 rounded mt-2 text-sm overflow-x-auto">
              https://wclzqcqzbjfvogosbujl.supabase.co/storage/v1/object/public/item_images/uploads/filename.heic
            </code>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={fixImageUrls} disabled={status === "loading"} className="w-full">
            {status === "loading" ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Fixing...
              </>
            ) : (
              "Fix Image URLs"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
