"use client"

import { useState } from "react"
import { submitItemToSupabase } from "@/app/actions/submit-item"

export default function SupabaseFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)

    try {
      const result = await submitItemToSupabase(formData)
      setResult(result)
    } catch (error) {
      console.error("Error submitting form:", error)
      setResult({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <form action={handleSubmit}>
        {/* Your form fields here */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      {result && <div className={result.success ? "success-message" : "error-message"}>{result.message}</div>}
    </div>
  )
}
