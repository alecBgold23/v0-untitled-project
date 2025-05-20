"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Copy, CheckCircle2, AlertCircle, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EbayDescriptionGenerator() {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [condition, setCondition] = useState("used")
  const [extraDetails, setExtraDetails] = useState("")
  const [shortTitle, setShortTitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const generateTitle = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item title",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setError("")
    setShortTitle("")

    try {
      const response = await fetch("/api/generate-ebay-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          condition,
          extraDetails: extraDetails.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate title")
      }

      setShortTitle(data.shortTitle)
      toast({
        title: "Success",
        description: "Title generated successfully",
      })
    } catch (err: any) {
      console.error("Error generating title:", err)
      setError(err.message || "Failed to generate title")
      toast({
        title: "Error",
        description: err.message || "Failed to generate title",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortTitle)
    setCopied(true)
    toast({
      title: "Copied",
      description: "Title copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          eBay Title Generator
        </CardTitle>
        <CardDescription>Generate professional eBay-style titles for your items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="item-title">Item Description</Label>
          <Input
            id="item-title"
            placeholder="e.g., iPhone 13 Pro Max 256GB Graphite Unlocked"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Describe your item with details like brand, model, size, color, etc.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger id="condition">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
              <SelectItem value="for-parts">For Parts/Not Working</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="extra-details">Extra Details (Optional)</Label>
          <Input
            id="extra-details"
            placeholder="e.g., Unlocked, With Original Box, etc."
            value={extraDetails}
            onChange={(e) => setExtraDetails(e.target.value)}
          />
        </div>

        <Button onClick={generateTitle} disabled={isGenerating || !title.trim()} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Title
            </>
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {shortTitle && (
          <div className="mt-4 space-y-3">
            <Label htmlFor="generated-title">Generated Title</Label>
            <div className="flex gap-2">
              <Input
                id="generated-title"
                value={shortTitle}
                onChange={(e) => setShortTitle(e.target.value)}
                className="font-medium"
              />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
