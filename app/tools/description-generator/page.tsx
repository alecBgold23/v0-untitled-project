"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, Sparkles, Copy, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DescriptionGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const generateDescription = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some basic item information to identify and describe it.",
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
          title: "Item identified and described",
          description: "Your item has been identified and described with specific details.",
        })
      } else {
        toast({
          title: "Generation failed",
          description: data.error || "Failed to identify and describe your item. Please try again with more details.",
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(description)
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "The detailed description has been copied to your clipboard.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Item Identifier & Description Generator</h1>
          <p className="text-muted-foreground">
            Enter basic information about your item, and our AI will identify the exact model and create a detailed,
            accurate description.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-medium">How it works:</span> If you enter "oculus" our AI will identify it as an
              "Oculus Meta Quest 3S" and generate a detailed description with accurate specifications, features, and
              condition information.
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Item Information</CardTitle>
            <CardDescription>Enter what you know about the item (brand, type, etc.)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: 'Samsung TV from 2020' or 'iPhone with cracked screen' or 'Oculus headset'"
              rows={4}
              className="mb-4 resize-none"
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">{prompt.length} characters</div>
              <Button
                onClick={generateDescription}
                disabled={loading || !prompt.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Identifying & Describing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Identify & Describe Item
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {description && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Item Description</CardTitle>
              <CardDescription>Your item has been identified with specific details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-md p-4 whitespace-pre-line">{description}</div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={copyToClipboard} className="gap-2">
                {copied ? "Copied!" : "Copy to Clipboard"}
                <Copy className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        <div className="mt-8 bg-muted/30 rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Tips for Better Results</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Include the brand name if you know it (e.g., "Sony", "Apple")</li>
            <li>Mention the type of item (e.g., "TV", "laptop", "headphones")</li>
            <li>Include any visible model numbers or identifying features</li>
            <li>Mention the condition (e.g., "like new", "scratched", "missing parts")</li>
            <li>Include the year of purchase if known</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
