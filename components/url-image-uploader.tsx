"use client"

import { useState } from "react"
import { uploadImageFromUrl } from "@/app/actions/upload-image-from-url"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react"

export function UrlImageUploader({
  userId = "anonymous",
  onUploadComplete,
}: {
  userId?: string
  onUploadComplete?: (result: any) => void
}) {
  const [imageUrl, setImageUrl] = useState("")
  const [customFileName, setCustomFileName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload() {
    if (!imageUrl) {
      setError("Please enter an image URL")
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadResult(null)

    try {
      const result = await uploadImageFromUrl(imageUrl, userId, customFileName || undefined)

      setUploadResult(result)

      if (result.success && onUploadComplete) {
        onUploadComplete(result)
      } else if (!result.success) {
        setError(result.error || "Upload failed")
      }
    } catch (err) {
      console.error("Error uploading image from URL:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Image from URL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customFileName">Custom File Name (optional)</Label>
          <Input
            id="customFileName"
            placeholder="my-image"
            value={customFileName}
            onChange={(e) => setCustomFileName(e.target.value)}
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground">Leave blank to generate a unique name automatically</p>
        </div>

        <Button onClick={handleUpload} disabled={isUploading || !imageUrl} className="w-full">
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadResult?.success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Upload Successful</AlertTitle>
            <AlertDescription>Image uploaded to {uploadResult.bucket} bucket</AlertDescription>
          </Alert>
        )}
      </CardContent>

      {uploadResult?.success && (
        <CardFooter className="flex-col">
          <p className="text-sm text-muted-foreground mb-2">Uploaded Image:</p>
          <div className="relative aspect-video w-full overflow-hidden rounded-md border">
            <img
              src={uploadResult.url || "/placeholder.svg"}
              alt="Uploaded from URL"
              className="object-contain w-full h-full"
            />
          </div>
          <div className="w-full mt-4 text-xs text-muted-foreground break-all">
            <p>
              <strong>Path:</strong> {uploadResult.path}
            </p>
            <p>
              <strong>URL:</strong> {uploadResult.url}
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
