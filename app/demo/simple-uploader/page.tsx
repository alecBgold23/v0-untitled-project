"use client"

import { useState } from "react"
import { FileUploader } from "@/components/file-uploader"
import { supabase } from "@/lib/supabaseClient"

export default function SimpleUploaderDemo() {
  const [uploadedFiles, setUploadedFiles] = useState<{ path: string }[]>([])
  const [fileUrls, setFileUrls] = useState<string[]>([])

  // For demo purposes, using a fixed user ID
  const userId = "demo-user-123"

  const handleUploadComplete = async (files: { path: string }[]) => {
    setUploadedFiles([...uploadedFiles, ...files])

    // Get public URLs for the uploaded files
    const urls = await Promise.all(
      files.map(async (file) => {
        const { data } = supabase.storage.from("images").getPublicUrl(file.path)
        return data.publicUrl
      }),
    )

    setFileUrls([...fileUrls, ...urls])
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Simple File Uploader Demo</h1>

      <div className="mb-8 p-4 border rounded-md">
        <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
        <FileUploader userId={userId} onUploadComplete={handleUploadComplete} />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="p-4 border rounded-md">
          <h2 className="text-lg font-semibold mb-4">Uploaded Files</h2>
          <ul className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium">Path: {file.path}</p>
                {fileUrls[index] && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Public URL:</p>
                    <a
                      href={fileUrls[index]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm break-all"
                    >
                      {fileUrls[index]}
                    </a>

                    {fileUrls[index].match(/\.(jpeg|jpg|gif|png)$/i) && (
                      <div className="mt-2">
                        <img
                          src={fileUrls[index] || "/placeholder.svg"}
                          alt="Preview"
                          className="max-h-40 rounded border"
                        />
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
