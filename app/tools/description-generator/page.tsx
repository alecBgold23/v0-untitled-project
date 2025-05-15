"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AIItemDescriptionButton } from "@/components/ai-item-description-button"
import { Copy, Check, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DescriptionGeneratorPage() {
  const [itemName, setItemName] = useState("")
  const [itemCondition, setItemCondition] = useState("excellent")
  const [description, setDescription] = useState("")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = () => {
    if (!description) {
      toast({
        title: "Nothing to copy",
        description: "Generate a description first.",
        variant: "destructive",
      })
      return
    }

    navigator.clipboard.writeText(description)
    setCopied(true)
    toast({
      title: "Copied!",
      description: "Description copied to clipboard.",
    })

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const handleReset = () => {
    setDescription("")
    toast({
      title: "Reset",
      description: "Description has been cleared.",
    })
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">eBay Description Generator</h1>
          <p className="text-muted-foreground">
            Create professional eBay-style descriptions for your items with AI assistance
          </p>
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">Description Generator</TabsTrigger>
            <TabsTrigger value="about">About This Tool</TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <Card>
              <CardHeader>
                <CardTitle>Generate eBay Description</CardTitle>
                <CardDescription>
                  Enter your item details below and click "Create eBay Description" to generate a professional listing
                  description.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    placeholder="e.g., Sony PlayStation 5 Console"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Item Condition</Label>
                  <Select value={itemCondition} onValueChange={setItemCondition}>
                    <SelectTrigger>
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

                <div className="flex justify-end">
                  <AIItemDescriptionButton
                    itemName={itemName}
                    itemCondition={itemCondition}
                    onDescriptionCreated={setDescription}
                    disabled={!itemName}
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Generated Description</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={!description}
                        className="flex items-center gap-1 text-xs"
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        disabled={!description}
                        className="flex items-center gap-1 text-xs"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Reset</span>
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="description"
                    placeholder="Your generated description will appear here..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-xs text-muted-foreground">
                  {process.env.OPENAI_API_KEY
                    ? "Using OpenAI for generation"
                    : "Using demo mode (OpenAI API key not configured)"}
                </p>
                <Button variant="default" onClick={handleCopy} disabled={!description}>
                  Copy to Clipboard
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About the eBay Description Generator</CardTitle>
                <CardDescription>How this tool works and tips for getting the best results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">How It Works</h3>
                  <p className="text-muted-foreground mb-4">
                    This tool uses AI to generate professional eBay-style descriptions for your items. Simply enter the
                    item name and select its condition, and the AI will create a detailed, well-formatted description
                    ready to use in your eBay listings.
                  </p>

                  <h3 className="text-lg font-medium mb-2">Tips for Best Results</h3>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>
                      Be specific with your item name (e.g., "Sony WH-1000XM4 Wireless Headphones" instead of just
                      "Headphones")
                    </li>
                    <li>Select the most accurate condition category for your item</li>
                    <li>Edit the generated description to add specific details about your particular item</li>
                    <li>Add your own photos and specific measurements that the AI can't know about</li>
                    <li>Review the description for accuracy before posting to eBay</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Demo Mode</h3>
                  <p className="text-muted-foreground">
                    If you haven't configured an OpenAI API key, the tool will operate in demo mode, providing
                    pre-written templates based on your inputs. For more customized and dynamic descriptions, add your
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
