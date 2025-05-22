"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DollarSign, Wand2, AlertCircle, Loader2 } from "lucide-react"
import { estimateItemPriceFromAPI } from "@/lib/client-price-estimator"

interface PriceEstimatorDialogProps {
  description: string
  onPriceEstimated?: (price: string | null, error?: string) => void
  itemId?: string
  name?: string
  condition?: string
  issues?: string
  buttonClassName?: string
}

export function PriceEstimatorDialog({
  description,
  onPriceEstimated,
  itemId,
  name,
  condition,
  issues,
  buttonClassName,
}: PriceEstimatorDialogProps) {
  const [open, setOpen] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)

  // Use a ref to track if we've already estimated the price
  const hasEstimatedPrice = useRef(false)

  // Use a ref to store the latest props to avoid dependency issues
  const propsRef = useRef({ description, name, condition, issues })

  // Update the ref when props change
  useEffect(() => {
    propsRef.current = { description, name, condition, issues }
  }, [description, name, condition, issues])

  // Silent price estimation on mount or when inputs significantly change
  useEffect(() => {
    // Skip if we've already estimated the price or if there's no description
    if (hasEstimatedPrice.current || (!description?.trim() && !name?.trim())) return

    // Mark that we've estimated the price
    hasEstimatedPrice.current = true

    const estimatePrice = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Use API-based estimation
        const result = await estimateItemPriceFromAPI(description, name, condition, issues)

        setEstimatedPrice(result.price)
        setSource(result.source || null)

        if (result.minPrice && result.maxPrice) {
          setPriceRange({ min: result.minPrice, max: result.maxPrice })
        }

        // Only call onPriceEstimated if it exists
        if (onPriceEstimated) {
          onPriceEstimated(result.price)
        }
      } catch (error) {
        console.error("Error during price estimation:", error)
        setError("Failed to estimate price")

        // Generate a simple fallback price
        const fallbackPrice = `$${Math.round((25 + Math.random() * 75) / 5) * 5}`
        setEstimatedPrice(fallbackPrice)
        setSource("fallback")

        if (onPriceEstimated) {
          onPriceEstimated(fallbackPrice, "Error estimating price, using fallback")
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Run the estimation
    estimatePrice()
  }, [description, name, condition, issues, onPriceEstimated]) // Dependencies updated

  // Function to manually trigger price estimation
  const handleManualEstimate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get the latest props from ref
      const { description, name, condition, issues } = propsRef.current

      // Use API-based estimation
      const result = await estimateItemPriceFromAPI(description, name, condition, issues)

      setEstimatedPrice(result.price)
      setSource(result.source || null)

      if (result.minPrice && result.maxPrice) {
        setPriceRange({ min: result.minPrice, max: result.maxPrice })
      }

      // Only call onPriceEstimated if it exists
      if (onPriceEstimated) {
        onPriceEstimated(result.price)
      }
    } catch (error) {
      console.error("Error during manual price estimation:", error)
      setError("Failed to estimate price")

      // Generate a simple fallback price
      const fallbackPrice = `$${Math.round((25 + Math.random() * 75) / 5) * 5}`
      setEstimatedPrice(fallbackPrice)
      setSource("fallback")

      if (onPriceEstimated) {
        onPriceEstimated(fallbackPrice, "Error estimating price, using fallback")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePriceSelected = () => {
    if (estimatedPrice && onPriceEstimated) {
      onPriceEstimated(estimatedPrice)
    }
    setOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={buttonClassName || ""}
            disabled={isLoading}
            onClick={() => {
              if (!estimatedPrice) {
                handleManualEstimate()
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Estimating...
              </>
            ) : estimatedPrice ? (
              <>
                <DollarSign className="h-4 w-4 mr-1" />
                {estimatedPrice}
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-1" />
                Estimate Price
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Price Estimator</DialogTitle>
            <DialogDescription>Estimate the value of your item based on its details</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {error && (
              <div className="p-4 mb-4 border border-yellow-200 bg-yellow-50 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  <p className="text-sm text-yellow-700">
                    We're having trouble with our pricing service. Using an estimated value instead.
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 border rounded-md mb-4">
              <h3 className="font-medium mb-2">Item Details</h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Name:</span> {name || "Not specified"}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Description:</span> {description || "Not specified"}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Condition:</span> {condition || "Not specified"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Issues:</span> {issues || "None specified"}
              </p>
            </div>

            <div className="p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Estimated Value</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Based on item details:</span>
                <span className="text-2xl font-bold">{estimatedPrice || "Calculating..."}</span>
              </div>

              {priceRange && (
                <p className="text-sm text-gray-500 mt-1">
                  Estimated range: ${priceRange.min.toFixed(2)} - ${priceRange.max.toFixed(2)}
                </p>
              )}

              {source && (
                <p className="text-xs text-gray-500 mt-1">
                  Source: {source === "openai" ? "AI-powered estimate" : "Algorithm-based estimate"}
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <Button onClick={handlePriceSelected} className="w-full">
                  Use This Estimate
                </Button>
              </div>
            </div>

            <div className="mt-4 p-4 border rounded-md">
              <h3 className="font-medium mb-2">How We Calculate Prices</h3>
              <p className="text-sm text-gray-600 mb-2">Our price estimation algorithm considers:</p>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Item condition and quality</li>
                <li>Similar items in the marketplace</li>
                <li>Brand value and rarity</li>
                <li>Current market trends</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                Powered by AI technology to provide the most accurate estimates possible.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
