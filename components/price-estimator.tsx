"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, DollarSign, RefreshCw, AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface PriceEstimatorProps {
  initialDescription?: string
  initialName?: string
  onPriceEstimated?: (price: string) => void
  className?: string
  itemId?: string
}

export function PriceEstimator({
  initialDescription = "",
  initialName = "",
  onPriceEstimated,
  className = "",
  itemId,
}: PriceEstimatorProps) {
  const [description, setDescription] = useState(initialDescription)
  const [itemName, setItemName] = useState(initialName)
  const [condition, setCondition] = useState("Good")
  const [defects, setDefects] = useState("")
  const [estimatedPrice, setEstimatedPrice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedToDatabase, setSavedToDatabase] = useState(false)
  const [priceSource, setPriceSource] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim() && !itemName.trim()) {
      setError("Please enter either an item name or description")
      return
    }

    setIsLoading(true)
    setError(null)
    setSavedToDatabase(false)
    setPriceSource(null)

    try {
      const res = await fetch("/api/price-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          itemName,
          condition,
          defects,
          itemId,
          item_id: itemId, // Include both formats for compatibility
          item_name: itemName,
          brief_description: description,
        }),
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()

      if (data.error) {
        console.warn("API returned error:", data.error)
        // Still use the fallback price if provided
      }

      // Handle different response formats
      const price = data.price || `$${data.estimated_price}` || "$25"
      setEstimatedPrice(price)
      setPriceSource(data.source || "api")

      if (itemId) {
        setSavedToDatabase(true)
      }

      if (onPriceEstimated) {
        onPriceEstimated(price)
      }
    } catch (err: any) {
      console.error("Error estimating price:", err)
      setError("There was an issue with the pricing service, but we've provided an estimate.")

      // Set a fallback price even on error
      const fallbackPrice = "$25"
      setEstimatedPrice(fallbackPrice)
      setPriceSource("error_fallback")

      if (onPriceEstimated) {
        onPriceEstimated(fallbackPrice)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetEstimate = () => {
    setEstimatedPrice(null)
    setSavedToDatabase(false)
    setPriceSource(null)
  }

  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader className="bg-gradient-to-r from-[#0066ff]/10 via-[#6a5acd]/10 to-[#8c52ff]/10 border-b">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#6a5acd]" />
          Price Estimator
        </CardTitle>
        <CardDescription>Get an estimated price range for your item</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {estimatedPrice ? (
          <div className="text-center py-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Estimated Value</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-[#0066ff] via-[#6a5acd] to-[#8c52ff] bg-clip-text text-transparent">
              {estimatedPrice}
            </div>

            {priceSource && (
              <div className="mt-2 text-xs text-gray-500">
                {priceSource === "ai+ebay" ? (
                  <span>Estimated using AI and eBay data</span>
                ) : priceSource === "cache" ? (
                  <span>Estimated from cached data</span>
                ) : (
                  <span>Estimated using algorithm</span>
                )}
              </div>
            )}

            {savedToDatabase && (
              <div className="flex items-center justify-center gap-2 mt-3 text-green-600 text-sm">
                <Database className="h-4 w-4" />
                <span>Saved to database</span>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4">
              This is an estimate based on the provided information. Actual value may vary based on condition, market
              demand, and other factors.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={resetEstimate}>
              <RefreshCw className="h-3 w-3 mr-2" />
              Get New Estimate
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="itemName" className="block text-sm font-medium mb-1">
                Item Name
              </Label>
              <Input
                id="itemName"
                placeholder="Enter the name of your item"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description" className="block text-sm font-medium mb-1">
                Item Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail (brand, features, etc.)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div>
              <Label htmlFor="condition" className="block text-sm font-medium mb-1">
                Condition
              </Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="defects" className="block text-sm font-medium mb-1">
                Defects or Issues (if any)
              </Label>
              <Textarea
                id="defects"
                placeholder="Describe any defects, damage, or issues with the item"
                value={defects}
                onChange={(e) => setDefects(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0066ff] to-[#6a5acd]"
              disabled={isLoading || (!description.trim() && !itemName.trim())}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
        )}
      </CardContent>
    </Card>
  )
}
