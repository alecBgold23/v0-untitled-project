"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"

export default function AIDescriptionHelper() {
  const [inputText, setInputText] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (inputText.trim().length < 3) {
      setSuggestion("")
      return
    }

    const timeout = setTimeout(() => {
      fetchSuggestion(inputText)
    }, 800) // wait for user to stop typing

    return () => clearTimeout(timeout)
  }, [inputText])

  const fetchSuggestion = async (text: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/description-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuggestion(data.suggestion)
      } else {
        setSuggestion("No suggestion available.")
      }
    } catch (err) {
      console.error(err)
      setSuggestion("Error fetching suggestion.")
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card className="border-border/40 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#3b82f6]/10 via-[#6366f1]/10 to-[#4f46e5]/10 border-b border-border/40">
          <CardTitle className="text-2xl font-medium">AI Description Helper</CardTitle>
          <CardDescription>Start typing to get AI-powered suggestions for your item description</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="item-input" className="text-sm font-medium text-muted-foreground">
              Enter your item name or brief description
            </label>
            <Input
              id="item-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Start typing item name (e.g., iPhone, Samsung TV, leather sofa)..."
              className="w-full border border-input rounded-lg focus-visible:ring-[#3b82f6] bg-background shadow-sm transition-all duration-200"
            />
            <p className="text-xs text-muted-foreground">Type at least 3 characters to get suggestions</p>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating suggestion...</span>
            </div>
          )}

          {suggestion && !loading && (
            <div className="rounded-lg border border-[#3b82f6]/20 bg-[#3b82f6]/5 p-4 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-[#3b82f6]" />
                <span className="text-sm font-medium text-[#3b82f6]">AI Suggestion</span>
              </div>
              <p className="text-muted-foreground">{suggestion}</p>
            </div>
          )}

          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h3 className="text-sm font-medium mb-2">Tips for better suggestions:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Include brand names when possible (e.g., "Samsung" instead of just "TV")</li>
              <li>• Mention key features (e.g., "4K", "leather", "wireless")</li>
              <li>• Include the condition (e.g., "like new", "used")</li>
              <li>• Be specific about the model if you know it</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
