"use client"

import { useActionState } from "react"
import { submitFormAction } from "@/app/actions/submit-form-action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"

export default function FormSubmitWithAction() {
  const [state, action, isPending] = useActionState(submitFormAction)
  const [condition, setCondition] = useState("")

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Submit Your Item</CardTitle>
        <CardDescription>Fill out the form below to submit your item for review.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="condition">
              Condition <span className="text-red-500">*</span>
            </Label>
            <input type="hidden" name="condition" value={condition} />
            <Select value={condition} onValueChange={setCondition} name="condition">
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
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Item"
            )}
          </Button>
        </form>

        {state && (
          <div
            className={`mt-4 p-4 rounded-md flex items-center ${
              state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {state.success ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
            <p>{state.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
