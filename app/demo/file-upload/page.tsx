"use client"

import { useState } from "react"
import FileUploader from "@/components/file-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FileUploadDemo() {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; path: string }>>([])

  // In a real app, you would get the user ID from authentication
  const demoUserId = "demo-user"

  const handleUploadComplete = (url: string, path: string) => {
    setUploadedFiles((prev) => [...prev, { url, path }])
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">File Upload Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Files to Supabase Storage</CardTitle>
            <CardDescription>Select a file and click upload to store it in Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader userId={demoUserId} onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>Files you've uploaded in this session</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadedFiles.length === 0 ? (
              <p className="text-muted-foreground">No files uploaded yet</p>
            ) : (
              <ul className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      {file.url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <img
                          src={file.url || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-xs">File</span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{file.path.split("/").pop()}</p>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline truncate block"
                      >
                        {file.url}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
