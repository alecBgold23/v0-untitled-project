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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate description")
      }

      if (data.description) {
        onDescriptionGenerated(data.description)
        toast({
          title: "Success",
          description: "AI-generated description added",
        })
      } else {
        throw new Error("No description was generated")
      }
    } catch (error) {
      console.error("Error generating description:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate description",
        variant: "destructive",
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
          <span>Generate AI Description</span>
        </>
      )}
    </Button>
  )
}
