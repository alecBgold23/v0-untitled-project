"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Tag, DollarSign, Info, AlertCircle } from "lucide-react"
import { estimateItemPriceFromAPI } from "@/lib/client-price-estimator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SimilarEbayItemsProps {
  description: string
  onPriceSelected: (price: string) => void
  className?: string
}

export function SimilarEbayItems({ description, onPriceSelected, className = "" }: SimilarEbayItemsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [suggestedPrice, setSuggestedPrice] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null)
  const [confidence, setConfidence] = useState<"low" | "medium" | "high">("medium")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const estimatePrice = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Use API-based estimation
        const result = await estimateItemPriceFromAPI(description)

        if (result.error) {
          setError(result.error)
          setIsLoading(false)
          return
        }

        setSuggestedPrice(result.price)
        setConfidence(result.source === "openai" ? "high" : "medium")

        if (result.minPrice && result.maxPrice) {
          setPriceRange({ min: result.minPrice, max: result.maxPrice })
        }
      } catch (err) {
        console.error("Error estimating price:", err)
        setError("Failed to estimate price. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    estimatePrice()
  }, [description])

  const handleSelectPrice = () => {
    if (suggestedPrice) {
      onPriceSelected(suggestedPrice)
    }
  }

  const getConfidenceLabel = () => {
    switch (confidence) {
      case "high":
        return { text: "High Confidence", color: "text-green-700 bg-green-50" }
      case "medium":
        return { text: "Medium Confidence", color: "text-amber-700 bg-amber-50" }
      case "low":
        return { text: "Low Confidence", color: "text-red-700 bg-red-50" }
    }
  }

  const confidenceInfo = getConfidenceLabel()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#6a5acd] mb-4" />
        <p className="text-gray-500">Analyzing item details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Pricing Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader className="bg-gradient-to-r from-[#0066ff]/10 via-[#6a5acd]/10 to-[#8c52ff]/10 border-b">
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-[#6a5acd]" />
          Price Estimator
        </CardTitle>
        <CardDescription>Based on your item's details and market trends</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="mb-6 p-4 bg-[#6a5acd]/5 rounded-lg border border-[#6a5acd]/20">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-800">Estimated Value</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${confidenceInfo.color}`}>{confidenceInfo.text}</span>
          </div>

          <p className="text-3xl font-bold text-[#6a5acd] mb-2">{suggestedPrice}</p>

          {priceRange && (
            <p className="text-sm text-gray-600 mb-4">
              Estimated range: ${priceRange.min} - ${priceRange.max}
            </p>
          )}

          <Button onClick={handleSelectPrice} className="w-full bg-[#6a5acd] hover:bg-[#5949b7]">
            <DollarSign className="h-4 w-4 mr-1" />
            Use This Estimate
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Info className="h-4 w-4 text-[#6a5acd]" />
            How We Calculate This Price
          </h3>

          <div className="grid gap-3">
            <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="bg-[#6a5acd]/10 p-2 rounded-full">
                  <Info className="h-4 w-4 text-[#6a5acd]" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Item Condition</h4>
                  <p className="text-xs text-gray-600">
                    {description.includes("new")
                      ? "New or like-new items typically sell for 50-80% more"
                      : description.includes("good")
                        ? "Good condition items maintain most of their value"
                        : "Item condition significantly impacts the final price"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="bg-[#6a5acd]/10 p-2 rounded-full">
                  <Info className="h-4 w-4 text-[#6a5acd]" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Market Factors</h4>
                  <p className="text-xs text-gray-600">
                    We analyze current market trends and recently sold similar items
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="bg-[#6a5acd]/10 p-2 rounded-full">
                  <Info className="h-4 w-4 text-[#6a5acd]" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Item Details</h4>
                  <p className="text-xs text-gray-600">
                    Brand, age, rarity, and specific features all contribute to the final value
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
