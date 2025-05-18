"use client"

import { useEffect } from "react"

interface SilentPriceEstimatorProps {
  description: string
  onPriceEstimated?: (price: string) => void
  itemId?: string
}

export function PriceEstimatorDialog({ description, onPriceEstimated, itemId }: SilentPriceEstimatorProps) {
  useEffect(() => {
    // Skip if no description
    if (!description.trim()) return

    const estimatePrice = async () => {
      try {
        console.log("Starting silent price estimation for:", description.substring(0, 30) + "...")

        // Call the API route for price estimation
        const res = await fetch("/api/price-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            itemId,
          }),
        })

        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`)
        }

        const data = await res.json()

        if (res.ok && data.price) {
          console.log("Price estimation successful:", data.price)
          if (onPriceEstimated) {
            onPriceEstimated(data.price)
          }
        } else {
          console.error("Price estimation failed:", data.error || "Unknown error")
        }
      } catch (error) {
        console.error("Error during price estimation:", error)
      }
    }

    // Run the estimation
    estimatePrice()
  }, [description, itemId, onPriceEstimated])

  // This component doesn't render anything
  return null
}
