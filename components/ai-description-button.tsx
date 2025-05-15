"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIDescriptionButtonProps {
  itemName: string
  condition?: string
  onDescriptionGenerated: (description: string) => void
}

export function AIDescriptionButton({
  itemName,
  condition = "used",
  onDescriptionGenerated,
}: AIDescriptionButtonProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const generateDescription = async () => {
    if (!itemName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item name first",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-ebay-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName: itemName.trim(),
          condition,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate description")
      }

      // Extract just the description part without the markdown formatting
      let cleanDescription = data.description

      // Remove markdown headers
      cleanDescription = cleanDescription.replace(/^#+ .*$/gm, "")

      // Remove markdown bullet points
      cleanDescription = cleanDescription.replace(/^\* /gm, "- ")

      // Remove section headers (##)
      cleanDescription = cleanDescription.replace(/^## .*$/gm, "")

      // Clean up extra newlines
      cleanDescription = cleanDescription.replace(/\n{3,}/g, "\n\n")

      // Trim whitespace
      cleanDescription = cleanDescription.trim()

      onDescriptionGenerated(cleanDescription)

      toast({
        title: "Success",
        description: "eBay-style description generated successfully",
      })
    } catch (err) {
      console.error("Error generating description:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to generate description",
        variant: "destructive",
      })
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
      disabled={isGenerating || !itemName.trim()}
    >
      {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
      <span className="text-xs">Generate eBay Description</span>
    </Button>
  )
}
