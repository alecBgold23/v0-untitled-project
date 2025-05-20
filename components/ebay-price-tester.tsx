"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, DollarSign, RefreshCw } from "lucide-react"

export default function EbayPriceTester() {
  const [itemName, setItemName] = useState("")
  const [description, setDescription] = useState("")
  const [condition, setCondition] = useState("used")
  const [category, setCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!itemName && !description) {
      setError("Please provide either an item name or description")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/price-with-ebay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName,
          description,
          condition,
          category,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred while estimating the price")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>eBay Price Estimator</CardTitle>
        <CardDescription>Test the eBay integration by estimating a price for an item</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              placeholder="e.g., iPhone 13 Pro Max 256GB"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about the item"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like new">Like New</SelectItem>
                  <SelectItem value="very good">Very Good</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="for parts">For Parts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category ID (optional)</Label>
              <Input
                id="category"
                placeholder="e.g., 9355 for Cell Phones"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Estimating...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" />
                Estimate Price
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm font-medium mb-1">Estimated Price:</div>
              <div className="text-3xl font-bold">{result.price}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Source: {result.source} | Confidence: {Math.round(result.confidence * 100)}%
              </div>
            </div>

            {result.reasoning && (
              <div className="rounded-lg bg-muted p-4">
                <div className="text-sm font-medium mb-1">Reasoning:</div>
                <div className="text-sm">{result.reasoning}</div>
              </div>
            )}

            {result.comparables && result.comparables.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Comparable Items:</div>
                <div className="space-y-2">
                  {result.comparables.map((item: any, index: number) => (
                    <div key={index} className="rounded-lg border p-3 text-sm">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="flex justify-between mt-1">
                        <span>
                          Price: {item.currency} {item.price}
                        </span>
                        <span>Condition: {item.condition}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
