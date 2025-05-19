"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DollarSign, Wand2 } from "lucide-react"
import { SimilarEbayItems } from "@/components/similar-ebay-items"

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

  // Silent price estimation on mount
  useEffect(() => {
    // Skip if no description or dialog is open (we'll use the dialog component instead)
    if (!description.trim() || open) return

    const estimatePrice = async () => {
      try {
        console.log("Starting silent price estimation for:", description.substring(0, 30) + "...")

        // Make the API request
        const response = await fetch("/api/ebay-price-estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            itemId,
            name,
            condition,
            issues,
          }),
          cache: "no-store",
        })

        // Handle non-OK responses
        if (!response.ok) {
          console.error(`API error (${response.status})`)
          return
        }

        // Parse the response
        const data = await response.json()

        // Check if we have a price
        if (data.price) {
          console.log(`Price estimation result: ${data.price} (source: ${data.source || "ebay"})`)
          setEstimatedPrice(data.price)

          if (onPriceEstimated) {
            onPriceEstimated(data.price)
          }
        } else if (data.fallbackPrice) {
          console.log(`Using fallback price: ${data.fallbackPrice}`)
          setEstimatedPrice(data.fallbackPrice)

          if (onPriceEstimated) {
            onPriceEstimated(data.fallbackPrice)
          }
        }
      } catch (error) {
        console.error("Unexpected error during price estimation:", error)
      }
    }

    // Run the estimation
    estimatePrice()
  }, [description, itemId, name, condition, issues, onPriceEstimated, open])

  const handlePriceSelected = (price: string) => {
    setEstimatedPrice(price)

    if (onPriceEstimated) {
      onPriceEstimated(price)
    }

    setOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className={buttonClassName || ""}>
            {estimatedPrice ? (
              <>
                <DollarSign className="h-4 w-4 mr-1" />
                Update Price
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
            <DialogDescription>Find similar items on eBay to estimate the value of your item</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <SimilarEbayItems
              description={`${name || ""} ${description} ${condition || ""} ${issues || ""}`}
              onPriceSelected={handlePriceSelected}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
