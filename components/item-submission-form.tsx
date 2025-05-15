"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ItemSubmissionForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    condition: "",
    description: "",
    imageUrls: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Import is inside the function to avoid issues with SSR
      const { default: supabase } = await import("@/lib/supabase")

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
        .select()

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
          variant: "default",
        })
        // Reset the form
        setFormData({
          condition: "",
          description: "",
          imageUrls: "",
        })
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div>
        <Label htmlFor="condition" className="text-sm font-medium mb-2 block">
          Condition <span className="text-red-500">*</span>
        </Label>
        <select
          id="condition"
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select condition</option>
          <option value="like-new">Like New</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium mb-2 block">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your item in detail"
          rows={4}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <Label htmlFor="imageUrls" className="text-sm font-medium mb-2 block">
          Image URLs (comma separated)
        </Label>
        <Input
          id="imageUrls"
          name="imageUrls"
          value={formData.imageUrls}
          onChange={handleChange}
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
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
