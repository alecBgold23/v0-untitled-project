"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, DollarSign, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OpenAIPricingTestPage() {
  const [itemName, setItemName] = useState("")
  const [description, setDescription] = useState("")
  const [condition, setCondition] = useState("Good")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/estimate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName,
          briefDescription: description,
          condition,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch (err) {
      console.error("Error testing OpenAI pricing:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleClick = (example: { name: string; description: string }) => {
    setItemName(example.name)
    setDescription(example.description)
  }

  const examples = [
    { name: "MacBook Air 13 inch M4", description: "Apple laptop in good condition, 16GB RAM, 512GB SSD" },
    { name: "iPhone 15 Pro", description: "256GB, Titanium finish, minor scratches on screen" },
    { name: "Vintage Leather Jacket", description: "Brown leather, size L, some wear on elbows" },
    { name: "Diamond Ring", description: "1 carat, princess cut, 14k white gold band" },
    { name: "Antique Wooden Chair", description: "Oak, hand-carved, circa 1920, good condition" },
  ]

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">OpenAI Pricing Test</h1>
      <p className="text-gray-600 mb-8">
        This page tests the OpenAI pricing API directly. Enter an item description to get a price estimate.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Test OpenAI Pricing</CardTitle>
            <CardDescription>Enter item details to get a price estimate</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g., MacBook Air 13 inch M4"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the item in detail"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brand New">Brand New</SelectItem>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="For Parts">For Parts/Not Working</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={isLoading || (!itemName && !description)}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Price...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Get Price Estimate
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Example Items</h3>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, index) => (
                  <Button key={index} variant="outline" size="sm" onClick={() => handleExampleClick(example)}>
                    {example.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Price estimate and details</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : result ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md border">
                  <h3 className="font-medium mb-2">Estimated Price</h3>
                  <p className="text-3xl font-bold text-[#6a5acd]">${result.price}</p>
                  {result.minPrice && result.maxPrice && (
                    <p className="text-sm text-gray-600 mt-1">
                      Range: ${result.minPrice.toFixed(2)} - ${result.maxPrice.toFixed(2)}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    Source: {result.source === "openai" ? "OpenAI" : result.source}
                  </p>
                </div>

                {result.comparableItems && result.comparableItems.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Comparable Items</h3>
                    <div className="space-y-2">
                      {result.comparableItems.map((item: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-md border">
                          <p className="font-medium">{item.title}</p>
                          <div className="flex justify-between text-sm">
                            <span>Price: ${item.price.value}</span>
                            <span>Condition: {item.condition}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-md border">
                  <h3 className="font-medium mb-2">Raw Response</h3>
                  <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                <DollarSign className="h-12 w-12 mb-4 opacity-20" />
                <p>Enter item details and click "Get Price Estimate" to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
