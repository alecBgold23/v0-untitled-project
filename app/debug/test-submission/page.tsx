"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Save, Package } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { submitMultipleItemsToSupabase } from "@/app/actions/submit-multiple-items"

export default function TestSubmissionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "Test Item",
    description: "This is a test item description",
    condition: "good",
    issues: "None",
    imagePath: "",
    fullName: "Test User",
    email: "test@example.com",
    phone: "123-456-7890",
    address: "123 Test St",
    pickupDate: new Date().toISOString().split("T")[0],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)

      const items = [
        {
          name: formData.name,
          description: formData.description,
          condition: formData.condition,
          issues: formData.issues,
          imagePath: formData.imagePath,
          estimatedPrice: "$50.00",
        },
      ]

      const contactInfo = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        pickupDate: formData.pickupDate,
      }

      const result = await submitMultipleItemsToSupabase(items, contactInfo)
      setSubmitResult(result)

      if (!result.success) {
        setError(result.message || "Submission failed")
      }
    } catch (err) {
      console.error("Error submitting data:", err)
      setError("An unexpected error occurred during submission")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Test Item Submission</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Test Database Submission
            </CardTitle>
            <CardDescription>Submit a test item to verify your Supabase database configuration</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Input
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="issues">Issues</Label>
                    <Input id="issues" name="issues" value={formData.issues} onChange={handleChange} required />
                  </div>

                  <div>
                    <Label htmlFor="imagePath">Image Path (Optional)</Label>
                    <Input
                      id="imagePath"
                      name="imagePath"
                      value={formData.imagePath}
                      onChange={handleChange}
                      placeholder="Path from a previous upload"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
                  </div>

                  <div>
                    <Label htmlFor="pickupDate">Pickup Date</Label>
                    <Input
                      id="pickupDate"
                      name="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Submission Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {submitResult && submitResult.success && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Submission Successful</AlertTitle>
                  <AlertDescription className="text-green-700">
                    <p>{submitResult.message}</p>
                    {submitResult.data && (
                      <pre className="mt-2 p-2 bg-green-100/50 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(submitResult.data, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? "Submitting..." : "Submit Test Item"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
