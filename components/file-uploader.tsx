"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, ImageIcon } from "lucide-react"

interface FileUploaderProps {
  userId: string
  onUploadComplete: (path: string) => void
}

// Export as named export to maintain compatibility with existing imports
export function FileUploader({ userId, onUploadComplete }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first")
      return
    }

    setIsUploading(true)

    try {
      // Simulate upload and return a placeholder URL
      const path = `uploads/${userId}/${Date.now()}-${file.name}`
      onUploadComplete(path)
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 border-blue-300 hover:border-blue-500 bg-muted/50">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
          ref={fileInputRef}
        />
        <div className="flex flex-col items-center justify-center">
          <ImageIcon className="w-6 h-6 text-blue-500" />
          <p className="font-medium text-sm text-blue-500">Click to Upload Image</p>
        </div>
      </div>

      {file && (
        <div className="relative">
          <img
            src={URL.createObjectURL(file) || "/placeholder.svg"}
            alt="Uploaded"
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
      )}

      <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload Image"
        )}
      </Button>
    </div>
  )
}

// Also export as default export for future-proofing
export default FileUploader
