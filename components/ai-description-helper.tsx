"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AIDescriptionHelper({ initialDescription = "", onDescriptionChange = (text: string) => {} }) {
  const [description, setDescription] = useState(initialDescription)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a basic description first.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/description-helper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: description }),
      })

      if (!response.ok) {
        throw new Error("Failed to improve description")
      }

      const data = await response.json()

      if (data.result) {
        setDescription(data.result)
        onDescriptionChange(data.result)

        toast({
          title: "Description Improved",
          description: "Your item description has been enhanced!",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error improving description:", error)
      toast({
        title: "Error",
        description: "Failed to improve description. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Enhance Your Description with AI</h3>
        <Button
          size="sm"
          variant="outline"
          className="bg-gradient-to-r from-[#3b82f6]/10 to-[#4f46e5]/10 hover:from-[#3b82f6]/20 hover:to-[#4f46e5]/20 border-[#3b82f6]/20"
          onClick={handleGenerate}
          disabled={loading || !description.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Enhance with AI
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Our AI can help improve your item description to make it more appealing to potential buyers.
      </p>
    </div>
  )
}
