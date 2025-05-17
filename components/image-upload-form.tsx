"use client"

import { useState, useRef } from "react"
import { uploadImageToSupabase } from "@/app/actions/upload-image-action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"

export function ImageUploadForm({
  onUploadComplete,
}: {
  onUploadComplete?: (result: { publicUrl: string; path: string }) => void
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadImageToSupabase(formData)

      if (result.success) {
        setUploadedImageUrl(result.publicUrl)
        if (onUploadComplete && result.publicUrl && result.path) {
          onUploadComplete({
            publicUrl: result.publicUrl,
            path: result.path,
          })
        }
        // Reset the form
        formRef.current?.reset()
      } else {
        setError(result.error || "Upload failed")
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Select Image</Label>
            <Input id="image" name="image" type="file" accept="image/*" disabled={isUploading} required />
          </div>

          <Button type="submit" disabled={isUploading} className="w-full">
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

          {error && <div className="text-red-500 text-sm mt-2">Error: {error}</div>}
        </form>
      </CardContent>

      {uploadedImageUrl && (
        <CardFooter className="flex-col">
          <p className="text-sm text-muted-foreground mb-2">Uploaded Image:</p>
          <div className="relative aspect-video w-full overflow-hidden rounded-md border">
            <img src={uploadedImageUrl || "/placeholder.svg"} alt="Uploaded" className="object-contain w-full h-full" />
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
