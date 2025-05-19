"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AIDescriptionButtonProps {
  onGenerate: () => Promise<string>
  onSuccess: (description: string) => void
  disabled?: boolean
  className?: string
}

export function AIDescriptionButton({
  onGenerate,
  onSuccess,
  disabled = false,
  className = "",
}: AIDescriptionButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateDescription = async () => {
    if (isGenerating || disabled) return

    setIsGenerating(true)
    setError(null)

    try {
      const description = await onGenerate()
      onSuccess(description)
    } catch (err) {
      console.error("Failed to generate description:", err)
      setError(err instanceof Error ? err.message : "Failed to generate description")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${className}`}
            onClick={handleGenerateDescription}
            disabled={isGenerating || disabled}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate AI Description
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {error ? <p className="text-red-500">{error}</p> : <p>Generate an optimized description using AI</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
