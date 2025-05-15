"use client"

import type React from "react"

import { useState } from "react"
import supabase from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"

export default function SimpleUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus("")
      setImageUrl(null)
    }
  }

  const uploadFile = async () => {
    if (!file) {
      setStatus("Please select a file first")
      return
    }

    setIsUploading(true)
    setStatus("Uploading...")

    try {
      // Create a unique path for the file
      const path = `uploads/${Date.now()}-${file.name}`

      // This is the exact line the user provided
      const { data, error } = await supabase.storage.from("images").upload(path, file)

      if (error) {
        throw error
      }

      // Get the public URL of the uploaded file
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(path)

      setStatus("Upload successful!")
      setImageUrl(urlData.publicUrl)
    } catch (error: any) {
      console.error("Error uploading file:", error)
      setStatus(`Error: ${error.message || "Unknown error occurred"}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Simple Supabase Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-input")?.click()}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Image
              </Button>
              <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {file && <span className="text-sm">{file.name}</span>}
            </div>

            <Button onClick={uploadFile} disabled={!file || isUploading} className="w-full">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload to Supabase"
              )}
            </Button>

            {status && (
              <div
                className={`p-2 rounded text-sm ${
                  status.includes("Error")
                    ? "bg-red-100 text-red-700"
                    : status.includes("successful")
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {status}
              </div>
            )}

            {imageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Uploaded Image:</p>
                <img src={imageUrl || "/placeholder.svg"} alt="Uploaded" className="w-full h-auto rounded-md border" />
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Code:</p>
            <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-xs">
              {`// Upload file to Supabase storage
const { data, error } = await supabase.storage
  .from('images')
  .upload(path, file);

// Get public URL
const { data: urlData } = supabase.storage
  .from('images')
  .getPublicUrl(path);`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
