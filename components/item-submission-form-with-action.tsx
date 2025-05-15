"use client"
import { useActionState } from "react"
import { submitItem } from "@/app/actions/submit-item-action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"

export default function ItemSubmissionFormWithAction() {
  const [state, action, isPending] = useActionState(submitItem)

  return (
    <div className="max-w-md mx-auto">
      <form action={action} className="space-y-6">
        <div>
          <Label htmlFor="condition" className="text-sm font-medium mb-2 block">
            Condition <span className="text-red-500">*</span>
          </Label>
          <select
            id="condition"
            name="condition"
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
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
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
          className={`mt-4 p-4 rounded-md ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          <div className="flex items-center">
            {state.success ? <CheckCircle2 className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
            <p>{state.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
