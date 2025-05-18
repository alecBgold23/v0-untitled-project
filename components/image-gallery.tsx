"use client"

import { useState, useEffect } from "react"
import { getImages, deleteImage } from "@/app/actions/upload-image"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw, ImageIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Image {
  id: string
  file_name: string
  public_url: string
  file_type: string
  file_size: number
  created_at: string
}

export default function ImageGallery() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  async function loadImages() {
    setLoading(true)
    setError(null)

    try {
      const { images: fetchedImages, error: fetchError } = await getImages()

      if (fetchError) {
        setError(fetchError)
      } else if (fetchedImages) {
        setImages(fetchedImages as Image[])
      }
    } catch (err) {
      setError("Failed to load images")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteImage(id: string) {
    if (!confirm("Are you sure you want to delete this image?")) return

    setDeleting(id)
    try {
      const { success, error: deleteError } = await deleteImage(id)

      if (success) {
        setImages((prev) => prev.filter((img) => img.id !== id))
      } else {
        setError(deleteError || "Failed to delete image")
      }
    } catch (err) {
      setError("An unexpected error occurred while deleting the image")
      console.error(err)
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    loadImages()
  }, [])

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const handleImageError = (imageId: string) => {
    setImageErrors((prev) => ({ ...prev, [imageId]: true }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Image Gallery</h2>
        <Button onClick={loadImages} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500">No images uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-square relative bg-gray-100">
                {imageErrors[image.id] ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                ) : (
                  <img
                    src={image.public_url || "/placeholder.svg?height=200&width=200&query=image"}
                    alt={image.file_name}
                    className="object-cover w-full h-full"
                    onError={() => handleImageError(image.id)}
                  />
                )}
              </div>
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="truncate text-sm">
                    <p className="font-medium truncate" title={image.file_name}>
                      {image.file_name.length > 20 ? image.file_name.substring(0, 17) + "..." : image.file_name}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(image.file_size)}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={deleting === image.id}
                  >
                    {deleting === image.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
