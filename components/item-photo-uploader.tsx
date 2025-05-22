"use client"

import type React from "react"

import { useState } from "react"
import { uploadItemPhotos } from "@/app/actions/upload-item-photos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, ImageIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ItemPhotoUploader() {
  const [itemId, setItemId] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
      setResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemId) {
      toast({
        title: "Item ID Required",
        description: "Please enter an item ID",
        variant: "destructive",
      })
      return
    }

    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one photo to upload",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("itemId", itemId)

      files.forEach((file) => {
        formData.append("files", file)
      })

      const uploadResult = await uploadItemPhotos(formData)
      setResult(uploadResult)

      if (uploadResult.success) {
        toast({
          title: "Upload Successful",
          description: `Uploaded ${uploadResult.uploadCount} photos. New photo count: ${uploadResult.photoCount}`,
          variant: "default",
        })

        // Clear files after successful upload
        setFiles([])
      } else {
        toast({
          title: "Upload Failed",
          description: uploadResult.error || "Failed to upload photos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading photos:", error)
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Unknown error uploading photos",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Item Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="itemId" className="text-sm font-medium">
              Item ID
            </label>
            <Input
              id="itemId"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder="Enter item ID"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="photos" className="text-sm font-medium">
              Select Photos
            </label>
            <Input id="photos" type="file" onChange={handleFileChange} accept="image/*" multiple disabled={uploading} />
            {files.length > 0 && (
              <p className="text-sm text-gray-500">
                {files.length} file(s) selected (
                {files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024 < 1
                  ? `${(files.reduce((acc, file) => acc + file.size, 0) / 1024).toFixed(1)} KB`
                  : `${(files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(1)} MB`}
                )
              </p>
            )}
          </div>

          {result && result.success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium text-green-800 flex items-center">
                <ImageIcon className="h-4 w-4 mr-2" />
                Upload Results
              </h3>
              <p className="text-green-700 mt-1">Successfully uploaded {result.uploadCount} photos</p>
              <p className="text-green-700">Current photo count: {result.photoCount}</p>
              {result.failedCount > 0 && (
                <p className="text-amber-700 mt-1">Failed to upload {result.failedCount} photos</p>
              )}
            </div>
          )}

          <Button type="submit" disabled={uploading || files.length === 0 || !itemId} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
