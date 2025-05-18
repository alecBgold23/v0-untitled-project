"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, DollarSign, RefreshCw, AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [savedToDatabase, setSavedToDatabase] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      setError("Please enter an item description")
      return
    }

    setIsLoading(true)
    setError(null)
    setErrorDetails(null)
    setSavedToDatabase(false)

    try {
      console.log("Sending price estimation request for:", description.substring(0, 50) + "...")

      const res = await fetch("/api/price-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          itemId, // Include the itemId if available
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("Price estimation failed:", data)
        throw new Error(data.error || "Failed to estimate price")
      }

      if (!data.price) {
        throw new Error("No price was returned from the API")
      }

      console.log("Price estimation successful:", data.price)
      setEstimatedPrice(data.price)

      // If itemId was provided, we assume it was saved to the database
      if (itemId) {
        setSavedToDatabase(true)
      }

      // Call the callback if provided
      if (onPriceEstimated) {
        onPriceEstimated(data.price)
      }
    } catch (err: any) {
      console.error("Error estimating price:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      if (err instanceof Error && err.cause) {
        setErrorDetails(JSON.stringify(err.cause))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetEstimate = () => {
    setEstimatedPrice(null)
    setSavedToDatabase(false)
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

            {savedToDatabase && (
              <div className="flex items-center justify-center gap-2 mt-3 text-green-600 text-sm">
                <Database className="h-4 w-4" />
                <span>Saved to database</span>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4">
              This is an AI-generated estimate based on the provided description. Actual value may vary based on
              condition, market demand, and other factors.
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
                <AlertDescription>
                  {error}
                  {errorDetails && (
                    <details className="mt-2 text-xs">
                      <summary>Technical details</summary>
                      <pre className="whitespace-pre-wrap">{errorDetails}</pre>
                    </details>
                  )}
                </AlertDescription>
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
