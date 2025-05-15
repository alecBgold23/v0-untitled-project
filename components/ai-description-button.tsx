"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface AIDescriptionButtonProps {
  inputText: string
  onDescriptionGenerated: (description: string) => void
  disabled?: boolean
  className?: string
}

export function AIDescriptionButton({
  inputText,
  onDescriptionGenerated,
  disabled = false,
  className = "",
}: AIDescriptionButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const createDescription = async () => {
    if (!inputText.trim()) {
      alert("Please enter some basic details about your item before generating a description.")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputText }),
      })

      const data = await response.json()

      if (response.ok && data.description) {
        onDescriptionGenerated(data.description)
      } else {
        alert("Failed to generate description. Please try again.")
      }
    } catch (error) {
      console.error("Error generating description:", error)
      alert("An error occurred while generating the description. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={createDescription}
      disabled={disabled || isGenerating || !inputText.trim()}
      className={`flex items-center gap-2 ${className}`}
      variant="outline"
    >
      <Sparkles className="h-4 w-4" />
      {isGenerating ? "Improving..." : "Improve with AI"}
    </Button>
  )
}
