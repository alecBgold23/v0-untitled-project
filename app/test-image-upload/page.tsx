"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function TestImageUploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImagePreview(null)
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploading(true)
    setError(null)
    setUploadResult(null)

    try {
      const formData = new FormData(e.currentTarget)

      const response = await fetch("/api/test-image-upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const result = await response.json()
      setUploadResult(result)
      formRef.current?.reset()
      setImagePreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
      console.error("Error uploading image:", err)
    } finally {
      setIsUploading(false)
    }
  }

  // Clean up object URL when component unmounts or when preview changes
  React.useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Test Image Upload</h1>

      <Card className="w-full max-w-md mx-auto mb-8">
        <CardHeader>
          <CardTitle>Upload Test Image</CardTitle>
          <CardDescription>Test the image upload functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Select Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {imagePreview && (
                <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-md border">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Image preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </div>

            <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Image"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="w-full max-w-md mx-auto mb-8 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {uploadResult && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Upload Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Image Path:</h3>
                <p className="text-sm break-all">{uploadResult.result.image_path}</p>
              </div>

              <div>
                <h3 className="font-medium">Image URL:</h3>
                <p className="text-sm break-all">{uploadResult.result.image_url}</p>
              </div>

              {uploadResult.result.image_url && (
                <div>
                  <h3 className="font-medium">Image Preview:</h3>
                  <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-md border">
                    <img
                      src={uploadResult.result.image_url || "/placeholder.svg"}
                      alt="Uploaded image"
                      className="object-cover w-full h-full"
                      onError={() => console.error("Failed to load image from URL:", uploadResult.result.image_url)}
                    />
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-medium">Full Response:</h3>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-md overflow-x-auto">
                  {JSON.stringify(uploadResult, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
