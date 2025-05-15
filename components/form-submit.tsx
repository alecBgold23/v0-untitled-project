"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function FormSubmit() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    condition: "",
    description: "",
    imageUrls: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Import is inside the function to avoid issues with SSR
      const { createClient } = await import("@supabase/supabase-js")

      // Get Supabase URL and key from environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase environment variables")
      }

      const supabase = createClient(supabaseUrl, supabaseKey)

      // Validate form data
      if (!formData.condition || !formData.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Insert data into Supabase
      const { data, error } = await supabase
        .from("items") // Replace with your Supabase table name
        .insert([
          {
            condition: formData.condition,
            description: formData.description,
            image_urls: formData.imageUrls,
            // Add other fields as necessary
          },
        ])

      if (error) {
        console.error("Error inserting data:", error)
        toast({
          title: "Submission Error",
          description: "There was an error submitting the form. Please try again.",
          variant: "destructive",
        })
      } else {
        console.log("Data inserted successfully:", data)
        toast({
          title: "Success!",
          description: "Item submitted successfully!",
        })
        // Reset the form
        setFormData({
          condition: "",
          description: "",
          imageUrls: "",
        })
        setIsSuccess(true)

        // Reset success state after 3 seconds
        setTimeout(() => {
          setIsSuccess(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Submit Your Item</CardTitle>
        <CardDescription>Fill out the form below to submit your item for review.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="condition">
              Condition <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.condition} onValueChange={(value) => handleSelectChange("condition", value)}>
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
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your item in detail"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrls">Image URLs (comma separated)</Label>
            <Input
              id="imageUrls"
              name="imageUrls"
              value={formData.imageUrls}
              onChange={handleChange}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submitted!
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
