"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function FixImageStoragePage() {
  const [isChecking, setIsChecking] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [checkResult, setCheckResult] = useState<any>(null)
  const [createResult, setCreateResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkStorage = async () => {
    setIsChecking(true)
    setError(null)
    try {
      const response = await fetch("/api/check-supabase-storage")
      const data = await response.json()
      setCheckResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error checking storage")
    } finally {
      setIsChecking(false)
    }
  }

  const createBucket = async () => {
    setIsCreating(true)
    setError(null)
    try {
      const response = await fetch("/api/create-item-images-bucket")
      const data = await response.json()
      setCreateResult(data)

      // Refresh the check after creating
      await checkStorage()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error creating bucket")
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    checkStorage()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Image Storage Diagnostics</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Storage Status</CardTitle>
            <CardDescription>Check if Supabase storage is properly configured</CardDescription>
          </CardHeader>
          <CardContent>
            {isChecking ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Checking storage configuration...</p>
              </div>
            ) : checkResult ? (
              <div>
                {checkResult.success ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{checkResult.message}</p>
                      <p className="text-sm text-muted-foreground">
                        Bucket: {checkResult.bucket || "N/A"}, Files: {checkResult.files || 0}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Storage configuration issue</p>
                      <p className="text-sm text-red-500">{checkResult.error}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p>No storage information available</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkStorage} disabled={isChecking}>
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Storage"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create item_images Bucket</CardTitle>
            <CardDescription>Create the item_images bucket if it doesn't exist</CardDescription>
          </CardHeader>
          <CardContent>
            {createResult && (
              <Alert variant={createResult.success ? "default" : "destructive"} className="mb-4">
                {createResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{createResult.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{createResult.success ? createResult.message : createResult.error}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              This will create the item_images bucket in your Supabase storage if it doesn't already exist. The bucket
              will be configured with public access for image URLs.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={createBucket} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create item_images Bucket"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
