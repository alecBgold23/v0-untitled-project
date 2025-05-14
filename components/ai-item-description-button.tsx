"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"

interface AIItemDescriptionButtonProps {
  itemName: string
  itemCondition: string
  onDescriptionGenerated: (description: string) => void
  disabled?: boolean
  className?: string
}

export function AIItemDescriptionButton({
  itemName,
  itemCondition,
  onDescriptionGenerated,
  disabled = false,
  className = "",
}: AIItemDescriptionButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateDescription = async () => {
    if (!itemName.trim()) {
      alert("Please enter an item name before generating a description.")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-item-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName,
          itemCondition,
        }),
      })

      const data = await response.json()

      if (response.ok && data.description) {
        onDescriptionGenerated(data.description)
      } else {
        alert(data.error || "Failed to generate description. Please try again.")
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
      onClick={generateDescription}
      disabled={disabled || isGenerating || !itemName.trim()}
      className={`flex items-center gap-2 ${className}`}
      variant="outline"
      size="sm"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Description</span>
        </>
      )}
    </Button>
  )
}
