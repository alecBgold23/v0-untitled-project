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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

        if (result.error) {
          setError(result.error)
          if (onPriceEstimated) {
            onPriceEstimated(null, result.error)
          }
          return
        }

        setEstimatedPrice(result.price)
        setSource(result.source || null)

        if (result.minPrice && result.maxPrice) {
          setPriceRange({ min: result.minPrice, max: result.maxPrice })
        }

        // Only call onPriceEstimated if it exists
        if (onPriceEstimated) {
          onPriceEstimated(result.price)
        }
      } catch (error: any) {
        console.error("Error during price estimation:", error)
        const errorMessage = "Failed to estimate price. Please try again later."
        setError(errorMessage)

        if (onPriceEstimated) {
          onPriceEstimated(null, errorMessage)
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

      if (result.error) {
        setError(result.error)
        if (onPriceEstimated) {
          onPriceEstimated(null, result.error)
        }
        return
      }

      setEstimatedPrice(result.price)
      setSource(result.source || null)

      if (result.minPrice && result.maxPrice) {
        setPriceRange({ min: result.minPrice, max: result.maxPrice })
      }

      // Only call onPriceEstimated if it exists
      if (onPriceEstimated) {
        onPriceEstimated(result.price)
      }
    } catch (error: any) {
      console.error("Error during manual price estimation:", error)
      const errorMessage = "Failed to estimate price. Please try again later."
      setError(errorMessage)

      if (onPriceEstimated) {
        onPriceEstimated(null, errorMessage)
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
              if (!estimatedPrice && !error) {
                handleManualEstimate()
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Estimating...
              </>
            ) : error ? (
              <>
                <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                Pricing Error
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
            {error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pricing Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <>
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

                {isLoading ? (
                  <div className="p-8 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p>Calculating price estimate...</p>
                  </div>
                ) : estimatedPrice ? (
                  <div className="p-4 border rounded-md bg-gray-50">
                    <h3 className="font-medium mb-2">Estimated Value</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Based on item details:</span>
                      <span className="text-2xl font-bold">{estimatedPrice}</span>
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
                ) : (
                  <div className="p-4 border rounded-md bg-gray-50">
                    <h3 className="font-medium mb-2">Waiting for Price Estimate</h3>
                    <p className="text-sm text-gray-600">
                      Click the button below to generate a price estimate for your item.
                    </p>
                    <Button onClick={handleManualEstimate} className="w-full mt-4" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Estimating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate Estimate
                        </>
                      )}
                    </Button>
                  </div>
                )}

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
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
