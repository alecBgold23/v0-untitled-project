"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIDescriptionButtonProps {
  itemName?: string
  inputText?: string
  condition?: string
  onDescriptionGenerated: (description: string) => void
}

export function AIDescriptionButton({
  itemName = "",
  inputText = "",
  condition = "used",
  onDescriptionGenerated,
}: AIDescriptionButtonProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const generateDescription = async () => {
    // Use inputText if provided, otherwise use itemName
    const promptText = inputText.trim() || itemName.trim()

    if (!promptText) {
      toast({
        title: "Error",
        description: "Please enter item details first",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // First try the enhanced eBay description endpoint
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `${promptText} - ${condition} condition`,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Extract description and clean up
      let cleanDescription = data.description || ""

      // Remove markdown headers
      cleanDescription = cleanDescription.replace(/^#+ .*$/gm, "")

      // Remove markdown bullet points but keep the dash
      cleanDescription = cleanDescription.replace(/^\* /gm, "- ")

      // Remove section headers (##)
      cleanDescription = cleanDescription.replace(/^## .*$/gm, "")

      // Clean up extra newlines
      cleanDescription = cleanDescription.replace(/\n{3,}/g, "\n\n")

      // Trim whitespace
      cleanDescription = cleanDescription.trim()

      onDescriptionGenerated(cleanDescription)

      // Show different toast based on if we used the API or fallback
      if (data.fromApi) {
        toast({
          title: "AI Description Generated",
          description: "Used OpenAI to create a custom description",
        })
      } else if (data.fromFallback) {
        toast({
          title: "Description Generated",
          description: "Used built-in template (OpenAI key not configured)",
          variant: "default",
        })
      }
    } catch (err) {
      console.error("Error generating description:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to generate description",
        variant: "destructive",
      })

      // Try to generate a basic fallback description client-side if everything fails
      try {
        const fallback = `This ${promptText} is in ${condition} condition and functions as expected. It shows typical signs of ${condition === "new" ? "being brand new" : "normal use"} and represents great value.`
        onDescriptionGenerated(fallback)
      } catch (e) {
        // If even this fails, just inform the user
        console.error("Fallback description failed:", e)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="flex items-center gap-1"
      onClick={generateDescription}
      disabled={isGenerating || !(inputText.trim() || itemName.trim())}
    >
      {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
      <span className="text-xs">Generate Description</span>
    </Button>
  )
}
