"use client"

import type React from "react"

import { useState } from "react"
import { uploadFile, checkBucket, getBucketName } from "@/lib/supabase-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react"

export default function EnvBucketUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [bucketStatus, setBucketStatus] = useState<any>(null)
  const [checking, setChecking] = useState(false)

  const bucketName = getBucketName()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const result = await uploadFile(file)
      setUploadResult(result)

      if (!result.success) {
        setError(result.error || "Upload failed")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Unknown upload error")
    } finally {
      setUploading(false)
    }
  }

  const checkBucketStatus = async () => {
    setChecking(true)
    setBucketStatus(null)
    setError(null)

    try {
      const status = await checkBucket()
      setBucketStatus(status)

      if (!status.success) {
        setError(status.error || "Failed to check bucket status")
      }
    } catch (err) {
      console.error("Bucket check error:", err)
      setError(err instanceof Error ? err.message : "Unknown error checking bucket")
    } finally {
      setChecking(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload to {bucketName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadResult?.success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Upload Successful</AlertTitle>
            <AlertDescription className="break-all">
              <p>Path: {uploadResult.path}</p>
              <p className="mt-2">URL: {uploadResult.url}</p>
            </AlertDescription>
          </Alert>
        )}

        {bucketStatus?.success && (
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Bucket Status</AlertTitle>
            <AlertDescription>
              {bucketStatus.message}
              {bucketStatus.files !== undefined && <p className="mt-1">Files in bucket: {bucketStatus.files}</p>}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label htmlFor="file" className="text-sm font-medium">
            Select Image
          </label>
          <Input id="file" type="file" onChange={handleFileChange} accept="image/*" disabled={uploading} />
          {file && (
            <p className="text-sm text-gray-500">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={checkBucketStatus} disabled={checking || uploading}>
          {checking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Check Bucket Status"
          )}
        </Button>

        <Button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
