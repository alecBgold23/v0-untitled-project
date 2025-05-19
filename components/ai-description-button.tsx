"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIDescriptionButtonProps {
  title: string
  condition: string
  extraDetails?: string
  onDescriptionGenerated: (description: string) => void
}

export function AIDescriptionButton({
  title,
  condition,
  extraDetails = "",
  onDescriptionGenerated,
}: AIDescriptionButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateDescription = async () => {
    if (!title) {
      toast({
        title: "Error",
        description: "Please enter an item title first",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          condition,
          extraDetails,
        }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()

      if (data.description) {
        onDescriptionGenerated(data.description)
        toast({
          title: "Success",
          description: "Description generated successfully",
        })
      } else {
        // Use a simple fallback if no description is returned
        const fallbackDescription = `${title} in ${condition} condition. ${extraDetails}`
        onDescriptionGenerated(fallbackDescription)
        toast({
          title: "Notice",
          description: "Using simple description format due to generation issues",
        })
      }
    } catch (error) {
      console.error("Error generating description:", error)

      // Use a simple fallback on error
      const fallbackDescription = `${title} in ${condition} condition. ${extraDetails}`
      onDescriptionGenerated(fallbackDescription)

      toast({
        title: "Notice",
        description: "Using simple description format due to generation issues",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={generateDescription}
      disabled={isGenerating || !title}
      className="gap-1.5"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Wand2 className="h-3.5 w-3.5" />
          <span>Generate Description</span>
        </>
      )}
    </Button>
  )
}
