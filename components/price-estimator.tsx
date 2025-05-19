"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, DollarSign, RefreshCw, AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { generatePriceEstimate } from "@/lib/openai-browser"

interface PriceEstimatorProps {
  initialDescription?: string
  onPriceEstimated?: (price: string) => void
  className?: string
  itemId?: string
}

export function PriceEstimator({
  initialDescription = "",
  onPriceEstimated,
  className = "",
  itemId,
}: PriceEstimatorProps) {
  const [description, setDescription] = useState(initialDescription)
  const [estimatedPrice, setEstimatedPrice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedToDatabase, setSavedToDatabase] = useState(false)
  const [priceSource, setPriceSource] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      setError("Please enter an item description")
      return
    }

    setIsLoading(true)
    setError(null)
    setSavedToDatabase(false)
    setPriceSource(null)

    try {
      // First try the API
      let price: string | null = null
      let source: string | null = null

      try {
        const res = await fetch("/api/price-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            itemId,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.price) {
            price = data.price
            source = data.source || "algorithm"
          }
        }
      } catch (apiError) {
        console.error("API error:", apiError)
        // Continue to fallback
      }

      // If API failed, use local fallback
      if (!price) {
        price = await generatePriceEstimate(description)
        source = "fallback"
      }

      setEstimatedPrice(price)
      setPriceSource(source)

      if (itemId) {
        try {
          // Try to save directly to Supabase
          const saveRes = await fetch("/api/save-estimated-price", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itemId,
              price,
            }),
          })

          if (saveRes.ok) {
            setSavedToDatabase(true)
          }
        } catch (err) {
          // Silently fail - the user still gets their estimate
          console.error("Failed to save price to database:", err)
        }
      }

      if (onPriceEstimated) {
        onPriceEstimated(price)
      }
    } catch (err: any) {
      console.error("Error estimating price:", err)

      // Even if everything fails, still provide a price estimate
      const fallbackPrice = "$20-$50"
      setEstimatedPrice(fallbackPrice)
      setPriceSource("fallback")

      if (onPriceEstimated) {
        onPriceEstimated(fallbackPrice)
      }

      setError("There was an issue with the pricing service, but we've provided an estimate.")
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
                {priceSource === "openai" ? <span>Estimated by AI</span> : <span>Estimated using algorithm</span>}
              </div>
            )}

            {savedToDatabase && (
              <div className="flex items-center justify-center gap-2 mt-3 text-green-600 text-sm">
                <Database className="h-4 w-4" />
                <span>Saved to database</span>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4">
              This is an estimate based on the provided description. Actual value may vary based on condition, market
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
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Item Description
              </label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail (brand, condition, age, features, etc.)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                The more details you provide, the more accurate the estimate will be.
              </p>
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
              disabled={isLoading || !description.trim()}
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
