"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, Search, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ItemDetails {
  exactModel: string
  brand: string
  specifications: string[]
  features: string[]
  releaseYear: string | number
  marketValue: string
  category: string
  listingTitle: string
  keywords: string[]
}

export default function ItemIdentifierPage() {
  const [itemName, setItemName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [itemDetails, setItemDetails] = useState<ItemDetails | null>(null)
  const [listingTitle, setListingTitle] = useState("")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const identifyItem = async () => {
    if (!itemName.trim()) {
      toast({
        title: "Input required",
        description: "Please enter an item name to identify.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/identify-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemName: itemName.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to identify item")
      }

      const data = await response.json()

      if (data.itemDetails) {
        setItemDetails(data.itemDetails)
        setListingTitle(data.itemDetails.listingTitle || "")
        toast({
          title: "Item identified",
          description: `Identified as: ${data.itemDetails.exactModel}`,
        })
      } else {
        throw new Error("No item details returned")
      }
    } catch (error) {
      console.error("Error identifying item:", error)
      toast({
        title: "Identification failed",
        description: "Unable to identify this item. Please try with more details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard.`,
    })

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const generateListingDescription = () => {
    if (!itemDetails) return ""

    return `${itemDetails.listingTitle}

PRODUCT DETAILS:
• Brand: ${itemDetails.brand}
• Model: ${itemDetails.exactModel}
• Category: ${itemDetails.category}
• Release Year: ${itemDetails.releaseYear}
• Estimated Value: ${itemDetails.marketValue}

SPECIFICATIONS:
${itemDetails.specifications.map((spec) => `• ${spec}`).join("\n")}

KEY FEATURES:
${itemDetails.features.map((feature) => `• ${feature}`).join("\n")}

This listing is for a ${itemDetails.exactModel}. Please review all details and photos before purchasing. Feel free to ask any questions!

Keywords: ${itemDetails.keywords.join(", ")}`
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Item Identifier & Listing Helper</h1>
          <p className="text-muted-foreground">Identify exact models and specifications from basic item descriptions</p>
        </div>

        <Tabs defaultValue="identifier" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="identifier">Item Identifier</TabsTrigger>
            <TabsTrigger value="about">About This Tool</TabsTrigger>
          </TabsList>

          <TabsContent value="identifier">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Identify Your Item</CardTitle>
                <CardDescription>
                  Enter a basic item description (e.g., "oculus" or "iphone") and we'll identify the exact model and
                  specifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter item name (e.g., oculus, iphone, playstation)"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && identifyItem()}
                    />
                  </div>
                  <Button onClick={identifyItem} disabled={isLoading || !itemName.trim()}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Identifying...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Identify
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {itemDetails && (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{itemDetails.exactModel}</CardTitle>
                        <CardDescription>
                          {itemDetails.brand} • {itemDetails.category} • Released: {itemDetails.releaseYear}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        Est. Value: {itemDetails.marketValue}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Suggested Listing Title</h3>
                      <div className="flex items-center gap-2">
                        <Input value={listingTitle} onChange={(e) => setListingTitle(e.target.value)} />
                        <Button size="sm" variant="outline" onClick={() => handleCopy(listingTitle, "Listing title")}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Specifications</h3>
                        <ul className="space-y-1">
                          {itemDetails.specifications.map((spec, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              • {spec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Key Features</h3>
                        <ul className="space-y-1">
                          {itemDetails.features.map((feature, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              • {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Recommended Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {itemDetails.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(JSON.stringify(itemDetails, null, 2), "Item details (JSON)")}
                    >
                      Copy All Details (JSON)
                    </Button>
                    <Button
                      variant="default"
                      className="gap-2"
                      onClick={() => handleCopy(generateListingDescription(), "Full listing description")}
                    >
                      <Sparkles className="h-4 w-4" />
                      Copy Full Listing
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Complete Listing Description</CardTitle>
                    <CardDescription>
                      Ready-to-use description with all details formatted for marketplace listings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea value={generateListingDescription()} readOnly rows={12} className="font-mono text-sm" />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={() => handleCopy(generateListingDescription(), "Full listing description")}>
                      {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                      {copied ? "Copied!" : "Copy to Clipboard"}
                    </Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About the Item Identifier</CardTitle>
                <CardDescription>How this tool works and tips for getting the best results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">How It Works</h3>
                  <p className="text-muted-foreground mb-4">
                    This tool uses AI to identify the exact model, specifications, and details of items based on minimal
                    information. Simply enter a basic item description (like "oculus" or "iphone"), and the system will
                    identify the specific model and provide detailed specifications.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Example Inputs</h3>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>
                      <strong>oculus</strong> → Identifies as Meta Quest 3 128GB with full specifications
                    </li>
                    <li>
                      <strong>iphone</strong> → Identifies as iPhone 14 Pro 256GB with detailed features
                    </li>
                    <li>
                      <strong>playstation</strong> → Identifies as PlayStation 5 Digital Edition with specs
                    </li>
                    <li>
                      <strong>macbook</strong> → Identifies as MacBook Pro 14-inch M2 Pro with details
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Tips for Best Results</h3>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>Start with a basic term and let the system identify the specific model</li>
                    <li>If you know more details, include them (e.g., "iphone 13" instead of just "iphone")</li>
                    <li>For very specific or rare items, provide more context</li>
                    <li>Always verify the identified details against your actual item</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Demo Mode</h3>
                  <p className="text-muted-foreground">
                    If you haven't configured an OpenAI API key, the tool will operate in demo mode, providing
                    pre-defined responses for common items. For more accurate and comprehensive identification, add your
                    OpenAI API key to the environment variables.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
