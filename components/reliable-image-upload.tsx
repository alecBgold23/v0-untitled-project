"use client"

import type React from "react"

import { useState, useRef } from "react"
import { uploadImageClient, checkSupabaseStorage } from "@/lib/supabase-image-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, ImageIcon, CheckCircle, AlertCircle } from "lucide-react"

interface UploadResult {
  success: boolean
  path?: string
  url?: string
  error?: string
}

export function ReliableImageUpload({
  userId = "anonymous",
  onUploadComplete,
}: {
  userId?: string
  onUploadComplete?: (result: UploadResult) => void
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploadMethod, setUploadMethod] = useState<"client" | "server">("client")
  const [isCheckingStorage, setIsCheckingStorage] = useState(false)
  const [storageStatus, setStorageStatus] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Client-side upload
  async function handleClientUpload(file: File) {
    setIsUploading(true)
    setUploadResult(null)

    try {
      console.log("Starting client-side upload")
      const result = await uploadImageClient(file, userId)
      console.log("Client upload result:", result)

      setUploadResult(result)
      if (result.success && onUploadComplete) {
        onUploadComplete(result)
      }
    } catch (error) {
      console.error("Client upload error:", error)
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Server-side upload
  async function handleServerUpload(file: File) {
    setIsUploading(true)
    setUploadResult(null)

    try {
      console.log("Starting server-side upload")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", userId)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("Server upload result:", result)

      setUploadResult(result)
      if (result.success && onUploadComplete) {
        onUploadComplete(result)
      }
    } catch (error) {
      console.error("Server upload error:", error)
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file selection
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (uploadMethod === "client") {
      handleClientUpload(file)
    } else {
      handleServerUpload(file)
    }
  }

  // Check Supabase storage configuration
  async function checkStorage() {
    setIsCheckingStorage(true)
    try {
      const result = await checkSupabaseStorage()
      setStorageStatus(result)
    } catch (error) {
      setStorageStatus({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsCheckingStorage(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload method selection */}
        <div className="flex space-x-4">
          <Button
            variant={uploadMethod === "client" ? "default" : "outline"}
            onClick={() => setUploadMethod("client")}
            className="flex-1"
          >
            Client Upload
          </Button>
          <Button
            variant={uploadMethod === "server" ? "default" : "outline"}
            onClick={() => setUploadMethod("server")}
            className="flex-1"
          >
            Server Upload
          </Button>
        </div>

        {/* File input */}
        <div className="space-y-2">
          <Label htmlFor="image">Select Image</Label>
          <Input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        {/* Upload button */}
        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>

        {/* Check storage button */}
        <Button variant="outline" onClick={checkStorage} disabled={isCheckingStorage} className="w-full">
          {isCheckingStorage ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Check Storage Configuration
            </>
          )}
        </Button>

        {/* Storage status */}
        {storageStatus && (
          <Alert variant={storageStatus.success ? "default" : "destructive"}>
            {storageStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{storageStatus.success ? "Storage Configured" : "Storage Error"}</AlertTitle>
            <AlertDescription>
              {storageStatus.success
                ? `Storage is working correctly. Found ${storageStatus.files} files.`
                : storageStatus.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Upload result */}
        {uploadResult && (
          <Alert variant={uploadResult.success ? "default" : "destructive"}>
            {uploadResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{uploadResult.success ? "Upload Successful" : "Upload Failed"}</AlertTitle>
            <AlertDescription>
              {uploadResult.success ? `File uploaded successfully to ${uploadResult.path}` : uploadResult.error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {/* Preview uploaded image */}
      {uploadResult?.success && uploadResult.url && (
        <CardFooter className="flex-col">
          <p className="text-sm text-muted-foreground mb-2">Uploaded Image:</p>
          <div className="relative aspect-video w-full overflow-hidden rounded-md border">
            <img src={uploadResult.url || "/placeholder.svg"} alt="Uploaded" className="object-contain w-full h-full" />
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
