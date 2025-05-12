"use client"

import type React from "react"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SmartDescriptionPage() {
  const [inputText, setInputText] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const fetchSuggestion = async (text: string) => {
    if (!text.trim()) {
      setSuggestion("")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/description-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuggestion(data.suggestion || "")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to get suggestion",
          variant: "destructive",
        })
        setSuggestion("")
      }
    } catch (err) {
      console.error("Error fetching suggestion:", err)
      toast({
        title: "Error",
        description: "Failed to connect to suggestion service",
        variant: "destructive",
      })
      setSuggestion("")
    }
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInputText(value)

    if (typingTimeout) clearTimeout(typingTimeout)
    setTypingTimeout(
      setTimeout(() => {
        fetchSuggestion(value)
      }, 500),
    )
  }

  const applySuggestion = () => {
    setInputText(suggestion)
    setSuggestion("")
    toast({
      title: "Suggestion applied",
      description: "The suggested description has been applied",
    })
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Smart Item Description</h1>
          <p className="text-muted-foreground">
            Start typing and get AI-powered suggestions to improve your item descriptions
          </p>
        </div>

        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle>Your Description</CardTitle>
            <CardDescription>As you type, our AI will suggest improvements</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputText}
              onChange={handleInputChange}
              placeholder="Start typing your item description..."
              rows={6}
              className="resize-none"
            />
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <div>{inputText.length} characters</div>
              {isLoading && (
                <div className="ml-auto flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Thinking...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {suggestion && suggestion !== inputText && (
          <Card
            className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={applySuggestion}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                Suggested Description
              </CardTitle>
              <CardDescription>Click to apply this suggestion</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{suggestion}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 bg-muted/30 rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Tips for Better Descriptions</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Include key features and specifications</li>
            <li>Mention the condition of the item</li>
            <li>Describe any accessories or items included</li>
            <li>Note any defects or issues honestly</li>
            <li>Highlight what makes your item special or valuable</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
