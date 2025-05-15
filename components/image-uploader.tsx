"use client"

import { Button } from "@/components/ui/button"

import type React from "react"

import { useState } from "react"
import { ImageIcon } from "lucide-react"

interface ImageUploaderProps {
  onImageUploaded: (url: string, id?: string) => void
  maxImages?: number
  allowedTypes?: string[]
  className?: string
}

export default function ImageUploader({
  onImageUploaded,
  maxImages = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  className = "",
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!allowedTypes.includes(file.type)) {
      alert(`Invalid file type: ${file.name}. Only ${allowedTypes.join(", ")} are allowed.`)
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first")
      return
    }

    // Simulate upload and return a placeholder URL
    const placeholderUrl = "/placeholder.svg"
    onImageUploaded(placeholderUrl, "demo-id")

    // Reset the file input
    const fileInput = document.getElementById("file-input") as HTMLInputElement
    if (fileInput) fileInput.value = ""

    setSelectedFile(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 border-blue-300 hover:border-blue-500 bg-muted/50">
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-input" />
        <div className="flex flex-col items-center justify-center">
          <ImageIcon className="w-6 h-6 text-blue-500" />
          <p className="font-medium text-sm text-blue-500">Click to Upload Image</p>
        </div>
      </div>

      {selectedFile && (
        <div className="relative">
          <img
            src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
            alt="Uploaded"
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
      )}

      <Button onClick={handleUpload} disabled={!selectedFile} className="w-full">
        Upload Image
      </Button>
    </div>
  )
}
