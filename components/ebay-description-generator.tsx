"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Copy, CheckCircle2, AlertCircle, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EbayDescriptionGenerator() {
  const { toast } = useToast()
  const [itemName, setItemName] = useState("")
  const [condition, setCondition] = useState("used")
  const [extraDetails, setExtraDetails] = useState("")
  const [description, setDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const generateDescription = async () => {
    if (!itemName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setError("")
    setDescription("")

    try {
      const response = await fetch("/api/generate-ebay-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName: itemName.trim(),
          condition,
          extraDetails: extraDetails.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate description")
      }

      setDescription(data.description)
      toast({
        title: "Success",
        description: "Description generated successfully",
      })
    } catch (err: any) {
      console.error("Error generating description:", err)
      setError(err.message || "Failed to generate description")
      toast({
        title: "Error",
        description: err.message || "Failed to generate description",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(description)
    setCopied(true)
    toast({
      title: "Copied",
      description: "Description copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5" />
          eBay Description Generator
        </CardTitle>
        <CardDescription>Generate professional eBay-style descriptions for your items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="item-name">Item Name</Label>
          <Input
            id="item-name"
            placeholder="e.g., iPhone 13 Pro Max 256GB Graphite Unlocked"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
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
          <Textarea
            id="extra-details"
            placeholder="e.g., Unlocked, With Original Box, No scratches or dents, etc."
            value={extraDetails}
            onChange={(e) => setExtraDetails(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button onClick={generateDescription} disabled={isGenerating || !itemName.trim()} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Description
            </>
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {description && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="generated-description">Generated Description</Label>
              <Button onClick={copyToClipboard} variant="outline" size="sm" className="h-8">
                {copied ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Textarea
              id="generated-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[200px] font-medium"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
