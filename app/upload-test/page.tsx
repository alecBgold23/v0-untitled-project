"use client"

import { useState } from "react"
import ImageUploader from "@/components/image-uploader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UploadTestPage() {
  const [uploadedImages, setUploadedImages] = useState<{ url: string; id?: string }[]>([])

  function handleImageUploaded(url: string, id?: string) {
    setUploadedImages((prev) => [...prev, { url, id }])
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Image Upload Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader onImageUploaded={handleImageUploaded} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Images</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadedImages.length === 0 ? (
              <p className="text-gray-500">No images uploaded yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="border rounded-md overflow-hidden">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`Uploaded image ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2 text-xs truncate">{image.url.split("/").pop()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
