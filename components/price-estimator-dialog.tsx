"use client"

import { useEffect } from "react"
import { generatePriceEstimate } from "@/lib/openai-browser"

interface SilentPriceEstimatorProps {
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
}: SilentPriceEstimatorProps) {
  useEffect(() => {
    // Skip if no description
    if (!description.trim()) return

    const estimatePrice = async () => {
      try {
        console.log("Starting price estimation for:", description.substring(0, 30) + "...")

        // First try the API
        try {
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

          if (response.ok) {
            const data = await response.json()
            if (data.price) {
              console.log(`Price estimation result: ${data.price} (source: ${data.source})`)
              if (onPriceEstimated) {
                onPriceEstimated(data.price)
              }
              return
            }
          }
        } catch (apiError) {
          console.error("API error:", apiError)
        }

        // If API fails, use local fallback
        console.log("Using local fallback for price estimation")
        const fallbackPrice = await generatePriceEstimate(description, condition || "used")

        if (onPriceEstimated) {
          onPriceEstimated(fallbackPrice)
        }
      } catch (error) {
        console.error("Unexpected error during price estimation:", error)

        // Even if everything fails, still provide a price estimate
        if (onPriceEstimated) {
          onPriceEstimated("$20-$50", "Error generating price estimate")
        }
      }
    }

    // Run the estimation
    estimatePrice()
  }, [description, itemId, name, condition, issues, onPriceEstimated])

  // This component doesn't render anything
  return null
}
