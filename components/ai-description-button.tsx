"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wand2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIDescriptionButtonProps {
  prompt: string
  onDescriptionCreated: (description: string) => void
  disabled?: boolean
}

export function AIDescriptionButton({ prompt, onDescriptionCreated, disabled = false }: AIDescriptionButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const createDescription = async () => {
    if (!prompt) {
      toast({
        title: "Missing information",
        description: "Please provide a prompt first.",
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
          prompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate description")
      }

      const data = await response.json()

      if (data.description) {
        onDescriptionCreated(data.description)
        toast({
          title: "Description generated",
          description: "AI-generated description has been applied.",
        })
      } else {
        throw new Error("No description returned")
      }
    } catch (error) {
      console.error("Error generating description:", error)
      toast({
        title: "Generation failed",
        description: "Unable to generate a description. Please try again later.",
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
      onClick={createDescription}
      disabled={disabled || isGenerating}
      className="flex items-center gap-1 text-xs"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Creating...</span>
        </>
      ) : (
        <>
          <Wand2 className="h-3 w-3" />
          <span>Generate Description</span>
        </>
      )}
    </Button>
  )
}
