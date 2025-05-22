"use client"

import type React from "react"

import { useState } from "react"
import { handleFormSubmission } from "@/lib/supabase-form-handler"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, CheckCircle2 } from "lucide-react"

export default function SellItemForm() {
  const [itemName, setItemName] = useState("")
  const [condition, setCondition] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      // Create FormData object
      const formData = new FormData()
      formData.append("item_name", itemName)
      formData.append("condition", condition)

      // Add all files
      files.forEach((file) => {
        formData.append("images", file)
      })

      // Submit the form
      const response = await handleFormSubmission(formData)

      if (response.success) {
        setResult(response)
        // Reset form on success
        setItemName("")
        setCondition("")
        setFiles([])
      } else {
        setError(response.error || "Failed to submit form")
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sell an Item</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item_name">Item Name</Label>
            <Input
              id="item_name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Enter item name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={condition} onValueChange={setCondition} required>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like_new">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {files.length > 0 && (
              <p className="text-sm text-gray-500">
                {files.length} image{files.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {error && <div className="bg-red-50 border border-red-200 p-3 rounded-md text-red-600 text-sm">{error}</div>}

          {result && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-md">
              <div className="flex items-center text-green-600 font-medium">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Item submitted successfully!
              </div>
              <p className="text-green-700 text-sm mt-1">
                Uploaded {result.photoCount} photo{result.photoCount !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !itemName || !condition || files.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit Item
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
