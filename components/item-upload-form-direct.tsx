"use client"

import React, { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { submitItemWithImage } from "@/app/actions/submit-item-with-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ItemUploadFormDirect() {
  const router = useRouter()
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)
  const [submittedImageUrl, setSubmittedImageUrl] = useState<string | null>(null)
  const [itemCondition, setItemCondition] = useState<string>("")

  // Handle file selection for preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImagePreview(null)
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    toast({
      title: "Image selected",
      description: `Selected ${file.name}`,
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get form data
      const formData = new FormData(e.currentTarget)

      // Add the condition value
      if (itemCondition) {
        formData.set("itemCondition", itemCondition)
      }

      // Ensure itemIssues is not null
      if (!formData.get("itemIssues")) {
        formData.set("itemIssues", "None")
      }

      // Submit the form
      const result = await submitItemWithImage(formData)

      if (!result.success) {
        throw new Error(result.message || "Failed to submit item")
      }

      // Success
      setSubmittedImageUrl(result.imageUrl || null)
      setFormSuccess(true)
      toast({
        title: "Success!",
        description: "Your item has been submitted successfully",
      })

      // Reset form
      formRef.current?.reset()
      setImagePreview(null)
      setItemCondition("")
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Submission error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clean up object URL when component unmounts or when preview changes
  React.useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  if (formSuccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Submission Successful!</CardTitle>
          <CardDescription>Your item has been submitted successfully</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-center mb-4">
            Thank you for your submission. We will review your item and get back to you soon.
          </p>
          {submittedImageUrl && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Uploaded image:</p>
              <img
                src={submittedImageUrl || "/placeholder.svg"}
                alt="Uploaded item"
                className="max-w-full h-auto max-h-48 rounded-md"
                onError={() => console.error("Failed to load image from URL:", submittedImageUrl)}
              />
            </div>
          )}
          <Button
            onClick={() => {
              setFormSuccess(false)
              router.refresh()
            }}
            className="mt-4"
          >
            Submit Another Item
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Item with Image</CardTitle>
        <CardDescription>Fill out the form below to submit your item details with an image</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input id="itemName" name="itemName" required placeholder="Enter the name of your item" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemDescription">Description</Label>
            <Textarea
              id="itemDescription"
              name="itemDescription"
              required
              placeholder="Describe your item in detail"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemCondition">Condition</Label>
            <Select value={itemCondition} onValueChange={setItemCondition} required>
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
            <Label htmlFor="itemIssues">Any issues or defects?</Label>
            <Textarea
              id="itemIssues"
              name="itemIssues"
              placeholder="Please describe any issues or write 'None'"
              rows={2}
              defaultValue="None"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" required placeholder="Your full name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" required placeholder="your.email@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" required placeholder="(123) 456-7890" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Item Image</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {imagePreview && (
              <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-md border">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Item preview"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
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
      </CardContent>
    </Card>
  )
}
