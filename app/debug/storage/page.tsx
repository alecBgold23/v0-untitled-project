"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function StorageDebugPage() {
  const [storageStatus, setStorageStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkStorage() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/storage-test")
        const data = await response.json()
        setStorageStatus(data)
        setError(null)
      } catch (err) {
        setError("Failed to check storage status")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    checkStorage()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Storage Configuration Debug</h1>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Checking storage configuration...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className={`mr-2 p-1 rounded-full ${storageStatus?.success ? "bg-green-100" : "bg-red-100"}`}>
                  {storageStatus?.success ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                Storage Status
              </CardTitle>
              <CardDescription>
                {storageStatus?.success
                  ? `Storage is properly configured with ${storageStatus.count} bucket(s)`
                  : "Storage configuration issues detected"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {storageStatus?.success ? (
                <div>
                  <h3 className="font-medium mb-2">Available Buckets:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {storageStatus.buckets?.map((bucket: any, i: number) => (
                      <li key={i} className="text-sm">
                        <strong>{bucket.name}</strong>
                        {bucket.public ? " (public)" : " (private)"}
                        {bucket.createdAt && ` - Created: ${new Date(bucket.createdAt).toLocaleString()}`}
                      </li>
                    ))}
                  </ul>

                  {(!storageStatus.buckets || storageStatus.buckets.length === 0) && (
                    <p className="text-amber-600 text-sm mt-2">
                      No buckets found. Your application will need to create buckets before uploading files.
                    </p>
                  )}

                  {!storageStatus.buckets?.some((b: any) => b.name === "itemimages" || b.name === "uploads") && (
                    <Alert className="mt-4 bg-blue-50 border-blue-200">
                      <AlertTitle>Missing Required Buckets</AlertTitle>
                      <AlertDescription>
                        The application requires the buckets &quot;itemimages&quot; or &quot;uploads&quot; but they
                        don&apos;t exist yet. They will be created automatically when you first upload a file.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  <p className="font-medium">Error: {storageStatus?.error}</p>
                  {storageStatus?.details && (
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(storageStatus.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
