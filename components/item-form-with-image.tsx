"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { uploadImage } from "@/lib/uploadImage"
import { submitItemWithImage } from "@/app/actions/submit-item-with-price"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ItemFormWithImage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    condition: "",
  })

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle condition select change
  const handleConditionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, condition: value }))
  }

  // Handle file upload
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const url = await uploadImage(file)
      if (url) {
        setImageUrl(url)
        toast({
          title: "Image uploaded",
          description: "Your image has been uploaded successfully.",
        })
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!imageUrl) {
      toast({
        title: "Image required",
        description: "Please upload an image for your item.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitItemWithImage({
        ...formData,
        imageUrl,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })

        // Reset form or redirect
        setFormData({ name: "", description: "", condition: "" })
        setImageUrl(null)

        // Optional: redirect to a success page
        // router.push('/submission-success')
      } else {
        toast({
          title: "Submission failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Submission error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter the name of your item"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Describe your item in detail"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">Condition</Label>
        <Select value={formData.condition} onValueChange={handleConditionChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="like-new">Like New</SelectItem>
            <SelectItem value="excellent">Excellent</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="poor">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Item Image</Label>
        <div className="flex flex-col space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("file-input")?.click()}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>
          <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md border">
              <img src={imageUrl || "/placeholder.svg"} alt="Uploaded item" className="object-cover w-full h-full" />
            </div>
          )}

          {!imageUrl && !isUploading && (
            <div className="flex items-center justify-center aspect-video w-full border border-dashed rounded-md bg-muted/50">
              <div className="flex flex-col items-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mb-2" />
                <span className="text-sm">No image uploaded</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting || isUploading || !imageUrl} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Item"
        )}
      </Button>
    </form>
  )
}
