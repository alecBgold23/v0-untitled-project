"use client"

import type React from "react"

import { useState } from "react"
import { uploadItemImageAndSave } from "@/app/actions/upload-item-image-and-save"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Upload } from "lucide-react"

export function SimpleItemUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [itemName, setItemName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)

    // Create preview URL
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)

      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl)
    } else {
      setPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !itemName) {
      setResult({ error: "Please select a file and enter an item name" })
      return
    }

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", itemName)

      const response = await uploadItemImageAndSave(formData)

      if (response.error) {
        setResult({ error: response.error })
      } else {
        setResult({ success: true })
        // Reset form
        setFile(null)
        setItemName("")
        setPreview(null)

        // Reset file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      }
    } catch (error) {
      setResult({ error: "An unexpected error occurred" })
      console.error("Error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Enter item name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Item Image</Label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="cursor-pointer"
            />
          </div>

          {preview && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200">
                <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {result && (
            <div className={`p-3 rounded-md ${result.success ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <p className={`text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>
                  {result.success ? "Item uploaded successfully!" : result.error}
                </p>
              </div>
            </div>
          )}

          <Button type="submit" disabled={isUploading || !file || !itemName} className="w-full">
            {isUploading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Upload Item
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
