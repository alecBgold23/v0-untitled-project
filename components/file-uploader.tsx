"use client"

import { useState } from "react"

import type React from "react"
import { supabase } from "../lib/supabaseClient" // adjust path as needed

type FileUploaderProps = {
  userId: string
  onUploadComplete: (files: { path: string }[]) => void
}

export default function FileUploader({ userId, onUploadComplete }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    const uploadedFiles: { path: string }[] = []

    for (const file of Array.from(files)) {
      const filePath = `${userId}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from("images").upload(filePath, file)

      if (error) {
        alert(`Failed to upload ${file.name}: ${error.message}`)
        setUploading(false)
        return
      }
      uploadedFiles.push({ path: filePath })
    }

    setUploading(false)
    onUploadComplete(uploadedFiles)
  }

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
      {uploading && <p>Uploading files...</p>}
    </div>
  )
}

// Also keep the named export for backward compatibility
export { FileUploader }
