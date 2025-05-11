"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DescriptionGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const generateDescription = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some item details to generate a description.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/description-helper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: prompt }),
      })

      const data = await res.json()

      if (res.ok) {
        setDescription(data.result)
        toast({
          title: "Description generated",
          description: "Your AI-powered description has been created successfully.",
        })
      } else {
        toast({
          title: "Generation failed",
          description: data.error || "Failed to generate description. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating description:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Description Generator</h1>
          <p className="text-muted-foreground">
            Transform basic item details into compelling, professional descriptions using AI.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Enter information about your item to generate a description</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter item details, features, condition, etc..."
              rows={6}
              className="mb-4 resize-none"
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">{prompt.length} characters</div>
              <Button
                onClick={generateDescription}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Description
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {description && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Description</CardTitle>
              <CardDescription>Your AI-enhanced description</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-md p-4 whitespace-pre-line">{description}</div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(description)
                    toast({
                      title: "Copied to clipboard",
                      description: "The description has been copied to your clipboard.",
                    })
                  }}
                >
                  Copy to Clipboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
