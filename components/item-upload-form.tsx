"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { uploadImagePrivate } from "@/app/actions/upload-image-private"
import { submitSellItemToSupabase } from "@/app/actions/submit-sell-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, ImageIcon, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { estimateItemPrice, type PriceEstimateResult } from "@/lib/client-price-estimator"

export default function ItemUploadForm() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    itemName: "",
    itemDescription: "",
    itemCondition: "",
    itemIssues: "None", // Default value to prevent null
    fullName: "",
    email: "",
    phone: "",
  })
  const [formSuccess, setFormSuccess] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [uploadedBucket, setUploadedBucket] = useState<string | null>(null)
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimateResult | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState<string | null>(null)

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle condition select change
  const handleConditionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, itemCondition: value }))
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    toast({
      title: "Image selected",
      description: `Selected ${file.name}`,
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile) {
      toast({
        title: "Image required",
        description: "Please select an image to upload",
        variant: "destructive",
      })
      return
    }

    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please provide an email address",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Upload the image to Supabase
      const uploadResult = await uploadImagePrivate(imageFile, formData.email)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload image")
      }

      console.log("Image upload result:", uploadResult)

      // Get the image URL from the upload result
      const imageUrl = uploadResult.signedUrl || uploadResult.url || ""
      setUploadedImageUrl(imageUrl)
      setUploadedBucket(uploadResult.bucket || null)

      console.log("Image URL to be saved:", imageUrl)

      // Step 2: Submit the form data with the image URL
      const submitResult = await submitSellItemToSupabase({
        itemName: formData.itemName,
        itemDescription: formData.itemDescription,
        itemCondition: formData.itemCondition,
        itemIssues: formData.itemIssues?.trim() ? formData.itemIssues : "None", // Ensure this is never null or empty
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: "", // Optional in this form
        pickupDate: "", // Optional in this form
        photoCount: 1,
        imageUrl: imageUrl, // Use the image URL from the upload result
        imagePath: uploadResult.path || "",
      })

      console.log("Submit result:", submitResult)

      if (!submitResult.success) {
        throw new Error(submitResult.message || "Failed to submit item details")
      }

      // Success
      setFormSuccess(true)
      toast({
        title: "Success!",
        description: "Your item has been submitted successfully",
      })

      // Reset form after 5 seconds
      setTimeout(() => {
        setFormData({
          itemName: "",
          itemDescription: "",
          itemCondition: "",
          itemIssues: "None", // Default value
          fullName: "",
          email: "",
          phone: "",
        })
        setImageFile(null)
        setImagePreview(null)
        setUploadedImageUrl(null)
        setUploadedBucket(null)
        setFormSuccess(false)
      }, 5000)
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
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  // Get AI price estimate
  const getAIPriceEstimate = async () => {
    if (!formData.itemName && !formData.itemDescription) {
      setEstimateError("Please provide an item name or description first")
      return
    }

    setIsEstimating(true)
    setEstimateError(null)

    try {
      const response = await fetch("/api/price-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: `${formData.itemName} ${formData.itemDescription}`.trim(),
          condition: formData.itemCondition || "used",
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Format the price estimate
      const formattedEstimate = {
        price: data.estimatedPrice || "$0",
        minPrice: data.minPrice || "0",
        maxPrice: data.maxPrice || "0",
        confidence: data.confidence || "low",
      }

      setPriceEstimate(formattedEstimate)
    } catch (error) {
      console.error("Error estimating price:", error)
      setEstimateError(`Error estimating price: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Set fallback estimate
      setPriceEstimate({
        price: "$0-$100",
        minPrice: "0",
        maxPrice: "100",
        confidence: "low",
      })
    } finally {
      setIsEstimating(false)
    }
  }

  // Update price estimate when relevant form fields change
  useEffect(() => {
    if (formData.itemName || formData.itemDescription || formData.itemCondition || formData.itemIssues) {
      const estimate = estimateItemPrice(
        formData.itemDescription,
        formData.itemName,
        formData.itemCondition,
        formData.itemIssues,
      )
      setPriceEstimate(estimate)
    }
  }, [formData.itemName, formData.itemDescription, formData.itemCondition, formData.itemIssues])

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
          {uploadedImageUrl && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Uploaded image:</p>
              <img
                src={uploadedImageUrl || "/placeholder.svg"}
                alt="Uploaded item"
                className="max-w-full h-auto max-h-48 rounded-md"
                onError={() => console.error("Failed to load image from URL:", uploadedImageUrl)}
              />
              {uploadedBucket && (
                <p className="text-xs text-gray-500 mt-1">
                  Stored in bucket: <span className="font-medium">{uploadedBucket}</span>
                </p>
              )}
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              required
              placeholder="Enter the name of your item"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemDescription">Description</Label>
            <Textarea
              id="itemDescription"
              name="itemDescription"
              value={formData.itemDescription}
              onChange={handleChange}
              required
              placeholder="Describe your item in detail"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemCondition">Condition</Label>
            <Select value={formData.itemCondition} onValueChange={handleConditionChange} required>
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
              value={formData.itemIssues}
              onChange={handleChange}
              placeholder="Please describe any issues or write 'None'"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="(123) 456-7890"
            />
          </div>

          <div className="space-y-2">
            <Label>Item Image</Label>
            <div className="flex flex-col space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Item preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center aspect-video w-full border border-dashed rounded-md bg-muted/50">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <span className="text-sm">No image uploaded</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Estimate Section */}
          <div className="p-4 border rounded-md bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Estimated Value</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getAIPriceEstimate}
                disabled={isEstimating || (!formData.itemName && !formData.itemDescription)}
              >
                {isEstimating ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Estimating...
                  </>
                ) : (
                  "Get AI Estimate"
                )}
              </Button>
            </div>

            {estimateError ? (
              <p className="text-sm text-red-500">{estimateError}</p>
            ) : priceEstimate ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{priceEstimate.price}</p>
                  <p className="text-sm text-muted-foreground">
                    Range: ${priceEstimate.minPrice} - ${priceEstimate.maxPrice}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      priceEstimate.confidence === "high"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : priceEstimate.confidence === "medium"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {priceEstimate.confidence?.charAt(0).toUpperCase() + priceEstimate.confidence?.slice(1)} confidence
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">Based on provided details</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Add item details above to see an estimated value</p>
            )}
            <p className="text-xs mt-2 text-muted-foreground">
              Click "Get AI Estimate" for a more accurate price based on current market data
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting || !imageFile} className="w-full">
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
