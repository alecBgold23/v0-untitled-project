"use client"

import type React from "react"

import { useState } from "react"
import { uploadImageToStorage } from "@/app/actions/upload-image-server"
import { Loader2, Upload } from "lucide-react"

interface ServerImageUploadProps {
  userId: string
  onUploadComplete?: (result: { path: string; url: string }) => void
}

export default function ServerImageUpload({ userId, onUploadComplete }: ServerImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // Create FormData to send to the server action
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", userId)

      // Call the server action
      const result = await uploadImageToStorage(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      setUploadedUrl(result.url)

      if (onUploadComplete && result.path && result.url) {
        onUploadComplete({ path: result.path, url: result.url })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-lg border-gray-300 hover:border-gray-400 transition-colors">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 cursor-pointer">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-gray-500" />
          )}
          <span className="mt-2 text-sm text-gray-500">
            {isUploading ? "Uploading..." : "Click to upload an image"}
          </span>
        </label>
      </div>

      {error && <div className="p-3 text-sm text-white bg-red-500 rounded-md">{error}</div>}

      {uploadedUrl && !error && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Image uploaded successfully!</p>
          <div className="relative aspect-video rounded-md overflow-hidden border border-gray-200">
            <img src={uploadedUrl || "/placeholder.svg"} alt="Uploaded image" className="object-cover w-full h-full" />
          </div>
        </div>
      )}
    </div>
  )
}
