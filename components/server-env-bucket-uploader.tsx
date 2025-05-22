"use client"

import type React from "react"

import { useState } from "react"
import { uploadToEnvBucket } from "@/app/actions/upload-to-env-bucket"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react"

export default function ServerEnvBucketUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

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
      // Create a FormData object
      const formData = new FormData()
      formData.append("file", file)

      // Call the server action
      const result = await uploadToEnvBucket(formData)
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Server Upload to Environment Bucket</CardTitle>
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
              <p className="mt-2">Bucket: {uploadResult.bucket}</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label htmlFor="server-file" className="text-sm font-medium">
            Select Image
          </label>
          <Input id="server-file" type="file" onChange={handleFileChange} accept="image/*" disabled={uploading} />
          {file && (
            <p className="text-sm text-gray-500">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
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
