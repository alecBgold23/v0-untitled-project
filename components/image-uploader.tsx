"use client"

import type React from "react"

import { useState } from "react"
import { uploadImage } from "@/app/actions/upload-image"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"

export default function ImageUploader({ onImageUploaded }: { onImageUploaded: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // Create a FormData object to pass the file to the server action
      const formData = new FormData()
      formData.append("file", file)

      // Call the server action
      const imageUrl = await uploadImage(file)

      if (imageUrl) {
        onImageUploaded(imageUrl)
      } else {
        setError("Failed to upload image. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={isUploading}
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
        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
