"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { ImageIcon, X } from "lucide-react"

interface DragDropUploadProps {
  onFilesAdded: (files: File[]) => void
  existingFiles: Array<{ id: string; preview: string; name: string }>
  onFileRemove: (index: number) => void
  minFiles?: number
  maxFiles?: number
  error?: string
}

export default function DragDropUpload({
  onFilesAdded,
  existingFiles = [],
  onFileRemove,
  minFiles = 3,
  maxFiles = 10,
  error,
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
        if (newFiles.length > 0) {
          onFilesAdded(newFiles)
        }
      }
    },
    [onFilesAdded],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()

      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"))
        if (newFiles.length > 0) {
          onFilesAdded(newFiles)
        }
      }
    },
    [onFilesAdded],
  )

  const openFileDialog = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
          isDragging
            ? "border-[#3b82f6] bg-[#3b82f6]/5"
            : error
              ? "border-red-300 bg-red-50/50"
              : "border-[#3b82f6]/40 hover:border-[#3b82f6] bg-muted/30 hover:bg-[#3b82f6]/5"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <ImageIcon className="w-8 h-8 text-[#3b82f6]/70" />
          <p className="font-medium text-sm text-[#3b82f6]">Drag & Drop Images Here or Click to Select</p>
          <p className="text-xs text-muted-foreground mt-1">
            {existingFiles.length} of {minFiles} required
            {maxFiles && ` (max ${maxFiles})`}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
          <span>{error}</span>
        </div>
      )}

      {existingFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-3">
            {existingFiles.map((file, index) => (
              <div
                key={file.id}
                className="relative group"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <div
                  className="w-20 h-20 bg-white dark:bg-gray-800 rounded-md border border-border shadow-sm overflow-hidden"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <img
                    src={typeof file.preview === "string" ? file.preview : "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if the preview URL is invalid
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onFileRemove(index)
                  }}
                  className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-0.5 w-5 h-5 flex items-center justify-center shadow-md border border-gray-200"
                  aria-label="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 mt-3 w-full">
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${existingFiles.length >= minFiles ? "bg-green-500" : "bg-[#3b82f6]"}`}
            style={{ width: `${Math.min(100, (existingFiles.length / minFiles) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
