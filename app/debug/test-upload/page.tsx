"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Upload, ImageIcon } from "lucide-react"
import { uploadImagePrivate } from "@/app/actions/upload-image-private"
import { uploadImageFallback } from "@/app/actions/upload-image-fallback"

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadMethod, setUploadMethod] = useState<"primary" | "fallback">("primary")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadResult(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      let result
      if (uploadMethod === "primary") {
        result = await uploadImagePrivate(file, "test-user")
      } else {
        result = await uploadImageFallback(file, "test-user")
      }

      setUploadResult(result)

      if (!result.success) {
        setError(result.error || "Upload failed")
      }
    } catch (err) {
      console.error("Error uploading file:", err)
      setError("An unexpected error occurred during upload")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Test File Upload</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Test Image Upload
            </CardTitle>
            <CardDescription>Upload a test image to verify your Supabase storage configuration</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={uploadMethod === "primary"}
                      onChange={() => setUploadMethod("primary")}
                      className="h-4 w-4"
                    />
                    <span>Primary Method</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={uploadMethod === "fallback"}
                      onChange={() => setUploadMethod("fallback")}
                      className="h-4 w-4"
                    />
                    <span>Fallback Method</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90"
                />
              </div>

              {file && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Selected File:</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB • {file.type}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upload Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {uploadResult && uploadResult.success && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Upload Successful</AlertTitle>
                  <AlertDescription className="text-green-700">
                    <p>File uploaded successfully to bucket: {uploadResult.bucket}</p>
                    <p className="mt-2 text-xs">Path: {uploadResult.path}</p>
                    {uploadResult.url && (
                      <div className="mt-4">
                        <p className="font-medium mb-1">Preview:</p>
                        <div className="border rounded-md overflow-hidden max-w-xs">
                          <img
                            src={uploadResult.url || "/placeholder.svg"}
                            alt="Uploaded file"
                            className="w-full h-auto"
                            onError={(e) => {
                              e.currentTarget.src = "/abstract-geometric-shapes.png"
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button onClick={handleUpload} disabled={isUploading || !file} className="flex items-center gap-2">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
