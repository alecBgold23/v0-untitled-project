"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, DollarSign, RefreshCw, AlertCircle, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface PriceEstimatorProps {
  initialDescription?: string
  initialName?: string
  onPriceEstimated?: (price: string, numericPrice: number) => void
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
  const [numericPrice, setNumericPrice] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedToDatabase, setSavedToDatabase] = useState(false)
  const [priceSource, setPriceSource] = useState<string | null>(null)
  const [category, setCategory] = useState("Auto-detect")

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
          category,
        }),
      })

      // Parse the JSON response
      const data = await res.json()

      // Check if there was an API key error
      if (data.error && data.error.includes("API key")) {
        setError("Pricing API key is invalid or missing. Please contact support.")
        setIsLoading(false)
        return
      }

      // Check for other errors
      if (data.error) {
        setError(data.error)
        setIsLoading(false)
        return
      }

      // Handle successful response
      const price = data.price
      setEstimatedPrice(price)
      setPriceSource(data.source || "openai")

      // Check if the price was saved to Supabase
      setSavedToDatabase(data.savedToSupabase || false)

      // Extract numeric price for database storage
      const numericValue = extractNumericPrice(price)
      setNumericPrice(numericValue)

      if (onPriceEstimated) {
        onPriceEstimated(price, numericValue)
      }
    } catch (err: any) {
      console.error("Error estimating price:", err)
      setError("There was an error connecting to the pricing service. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to extract numeric price from string (e.g., "$1,200" -> 1200)
  const extractNumericPrice = (priceString: string): number => {
    try {
      // Handle price ranges by taking the average
      if (priceString.includes("-")) {
        const [minStr, maxStr] = priceString.split("-")
        const min = Number.parseFloat(minStr.replace(/[^0-9.]/g, "")) || 0
        const max = Number.parseFloat(maxStr.replace(/[^0-9.]/g, "")) || 0
        return (min + max) / 2
      }

      // Remove currency symbol, commas, and any other non-numeric characters except decimal point
      const numericString = priceString.replace(/[^0-9.]/g, "")
      return Number.parseFloat(numericString) || 0
    } catch (error) {
      console.error("Error extracting numeric price:", error)
      return 0
    }
  }

  const resetEstimate = () => {
    setEstimatedPrice(null)
    setNumericPrice(null)
    setSavedToDatabase(false)
    setPriceSource(null)
    setError(null)
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
        {error ? (
          <div className="py-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pricing Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button variant="outline" size="sm" className="mt-4" onClick={resetEstimate}>
              <RefreshCw className="h-3 w-3 mr-2" />
              Try Again
            </Button>
          </div>
        ) : estimatedPrice ? (
          <div className="text-center py-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Estimated Value</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-[#0066ff] via-[#6a5acd] to-[#8c52ff] bg-clip-text text-transparent">
              {estimatedPrice}
            </div>

            {priceSource && (
              <div className="mt-2 text-xs text-gray-500">
                {priceSource === "openai" ? <span>Estimated using AI</span> : <span>Estimated using algorithm</span>}
              </div>
            )}

            {savedToDatabase && (
              <div className="flex items-center justify-center gap-2 mt-3 text-green-600 text-sm">
                <Check className="h-4 w-4" />
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
                  <SelectItem value="Brand New">Brand New</SelectItem>
                  <SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                  <SelectItem value="For Parts">For Parts/Not Working</SelectItem>
                  {/* Vehicle-specific conditions */}
                  <SelectItem value="Low Mileage">Low Mileage</SelectItem>
                  <SelectItem value="High Mileage">High Mileage</SelectItem>
                  <SelectItem value="Certified Pre-Owned">Certified Pre-Owned</SelectItem>
                  <SelectItem value="Salvage Title">Salvage Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category" className="block text-sm font-medium mb-1">
                Category (Optional)
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto-detect">Auto-detect</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="vehicle_luxury">Luxury Vehicle</SelectItem>
                  <SelectItem value="vehicle_suv">SUV/Truck</SelectItem>
                  <SelectItem value="vehicle_electric">Electric Vehicle</SelectItem>
                  <SelectItem value="vehicle_motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="jewelry">Jewelry</SelectItem>
                  <SelectItem value="watch_luxury">Luxury Watch</SelectItem>
                  <SelectItem value="art">Art/Collectible</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
