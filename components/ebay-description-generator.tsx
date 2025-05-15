"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wand2, Loader2, Copy, Check, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EbayDescriptionGenerator() {
  const [itemName, setItemName] = useState("")
  const [itemCondition, setItemCondition] = useState("excellent")
  const [description, setDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const generateDescription = async () => {
    if (!itemName) {
      toast({
        title: "Missing information",
        description: "Please provide an item name first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // First, get a specific eBay-style title
      const titleResponse = await fetch("/api/generate-ebay-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName,
          itemCondition,
        }),
        cache: "no-store",
      })

      if (!titleResponse.ok) {
        throw new Error(`Title API returned status: ${titleResponse.status}`)
      }

      const titleData = await titleResponse.json()
      const specificTitle = titleData.title || itemName

      // Now generate a description using the specific title
      const descResponse = await fetch("/api/description-suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: specificTitle, // Use the specific title for better description
        }),
        cache: "no-store",
      })

      if (!descResponse.ok) {
        throw new Error(`Description API returned status: ${descResponse.status}`)
      }

      const descData = await descResponse.json()

      if (descData && descData.suggestion) {
        // Combine the title and description
        const fullDescription = `${specificTitle}\n\n${descData.suggestion}`
        setDescription(fullDescription)
        toast({
          title: "eBay listing created",
          description: "Title and description have been generated.",
        })
      } else {
        throw new Error("No description returned from API")
      }
    } catch (error) {
      console.error("Error generating eBay listing:", error)
      toast({
        title: "Generation failed",
        description: "Unable to generate the eBay listing. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(description)
    setIsCopied(true)
    toast({
      title: "Copied!",
      description: "The eBay listing has been copied to your clipboard.",
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  const resetForm = () => {
    setDescription("")
    setItemName("")
    setItemCondition("excellent")
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">eBay Description Generator</CardTitle>
        <CardDescription>Generate professional eBay listings with detailed titles and descriptions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="item-name">Item Name</Label>
          <Input
            id="item-name"
            placeholder="e.g., iPhone, PlayStation, Oculus Quest"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter a basic item name and we'll generate a specific, detailed title
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-condition">Item Condition</Label>
          <Select value={itemCondition} onValueChange={setItemCondition}>
            <SelectTrigger id="item-condition">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generateDescription} disabled={isGenerating || !itemName} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating eBay Listing...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate eBay Listing
            </>
          )}
        </Button>

        {description && (
          <div className="space-y-2 mt-6">
            <Label htmlFor="description">Generated eBay Listing</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
        )}
      </CardContent>
      {description && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetForm}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={copyToClipboard}>
            {isCopied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
