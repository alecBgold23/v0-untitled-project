"use client"

import type React from "react"

import { useState } from "react"
import { uploadImage } from "@/app/actions/upload-image"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImageUploaderProps {
  onImageUploaded: (url: string, id?: string) => void
  maxSizeMB?: number
  allowedTypes?: string[]
  className?: string
}

export default function ImageUploader({
  onImageUploaded,
  maxSizeMB = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`)
      return
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds the maximum allowed size of ${maxSizeMB}MB`)
      return
    }

    setIsUploading(true)
    setError(null)
    setProgress(10) // Start progress

    try {
      // Simulate progress (since we don't have real progress from the server action)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress < 90 ? newProgress : prev
        })
      }, 300)

      // Call the server action
      const result = await uploadImage(file)

      clearInterval(progressInterval)
      setProgress(100)

      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        onImageUploaded(result.url, result.id || undefined)
      } else {
        setError("Failed to upload image. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsUploading(false)
      // Reset the input value to allow uploading the same file again
      event.target.value = ""
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={isUploading}
          className="relative overflow-hidden"
        >
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
        <input
          id="file-upload"
          type="file"
          accept={allowedTypes.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading && (
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Max file size: {maxSizeMB}MB. Allowed types: {allowedTypes.map((type) => type.split("/")[1]).join(", ")}
      </p>
    </div>
  )
}
