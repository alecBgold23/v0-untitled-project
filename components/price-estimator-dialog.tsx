"use client"

import { useEffect } from "react"

interface SilentPriceEstimatorProps {
  description: string
  onPriceEstimated?: (price: string | null, error?: string) => void
  itemId?: string
  name?: string
  condition?: string
  issues?: string
}

export function PriceEstimatorDialog({
  description,
  onPriceEstimated,
  itemId,
  name,
  condition,
  issues,
}: SilentPriceEstimatorProps) {
  useEffect(() => {
    // Skip if no description
    if (!description.trim()) return

    const estimatePrice = async () => {
      try {
        console.log("Starting price estimation for:", description.substring(0, 30) + "...")

        // Make the API request
        const response = await fetch("/api/price-item", {
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
          const errorText = await response.text().catch(() => "Unknown error")
          console.error(`API error (${response.status}):`, errorText)

          // Call the callback with an error
          if (onPriceEstimated) {
            onPriceEstimated(null, `Pricing service unavailable (${response.status})`)
          }
          return
        }

        // Parse the response
        try {
          const data = await response.json()

          // Check if the API returned an error
          if (data.error) {
            console.error("API returned error:", data.error)
            if (onPriceEstimated) {
              onPriceEstimated(null, data.error)
            }
            return
          }

          // Check if we have a price
          if (data.price) {
            console.log(`Price estimation result: ${data.price} (source: ${data.source})`)
            if (onPriceEstimated) {
              onPriceEstimated(data.price)
            }
          } else {
            // No price in the response
            console.error("API response missing price")
            if (onPriceEstimated) {
              onPriceEstimated(null, "Pricing service returned no data")
            }
          }
        } catch (parseError) {
          console.error("Error parsing API response:", parseError)
          if (onPriceEstimated) {
            onPriceEstimated(null, "Error processing pricing data")
          }
        }
      } catch (error) {
        console.error("Unexpected error during price estimation:", error)

        // Report the error
        if (onPriceEstimated) {
          onPriceEstimated(null, "Pricing service unavailable")
        }
      }
    }

    // Run the estimation
    estimatePrice()
  }, [description, itemId, name, condition, issues, onPriceEstimated])

  // This component doesn't render anything
  return null
}
