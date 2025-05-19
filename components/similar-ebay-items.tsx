"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign, ExternalLink, Tag } from "lucide-react"

interface SimilarEbayItemsProps {
  description: string
  onPriceSelected?: (price: string) => void
  className?: string
}

export function SimilarEbayItems({ description, onPriceSelected, className = "" }: SimilarEbayItemsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [averagePrice, setAveragePrice] = useState<string | null>(null)

  useEffect(() => {
    if (!description) return

    const fetchSimilarItems = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/ebay-price-estimate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description }),
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          setError(data.error)
          if (data.fallbackPrice) {
            setAveragePrice(data.fallbackPrice)
          }
        } else {
          setItems(data.references || [])
          setAveragePrice(data.price)
        }
      } catch (err) {
        setError("Failed to fetch similar items")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSimilarItems()
  }, [description])

  const handleSelectPrice = () => {
    if (averagePrice && onPriceSelected) {
      onPriceSelected(averagePrice)
    }
  }

  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader className="bg-gradient-to-r from-[#0066ff]/10 via-[#6a5acd]/10 to-[#8c52ff]/10 border-b">
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-[#6a5acd]" />
          Similar Items on eBay
        </CardTitle>
        <CardDescription>Based on recently sold items similar to your description</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#6a5acd]" />
            <p className="mt-2 text-sm text-gray-500">Searching eBay for similar items...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            {averagePrice && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">We've generated an estimated price instead:</p>
                <div className="mt-2 text-xl font-bold">{averagePrice}</div>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleSelectPrice}>
                  Use This Price
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {averagePrice && (
              <div className="mb-6 p-4 bg-[#6a5acd]/5 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Value</p>
                <div className="text-2xl font-bold mt-1">{averagePrice}</div>
                <p className="text-xs text-gray-500 mt-1">Based on {items.length} similar items</p>
                <Button
                  variant="default"
                  size="sm"
                  className="mt-3 bg-gradient-to-r from-[#0066ff] to-[#6a5acd]"
                  onClick={handleSelectPrice}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Use This Price
                </Button>
              </div>
            )}

            {items.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Similar Items Recently Sold</h3>
                <div className="grid gap-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {item.image?.imageUrl && (
                        <div className="flex-shrink-0 w-16 h-16 relative rounded overflow-hidden">
                          <img
                            src={item.image.imageUrl || "/placeholder.svg"}
                            alt={item.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold">
                            {item.price?.currency === "USD" ? "$" : item.price?.currency}
                            {item.price?.value}
                          </span>
                          {item.condition && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                              {item.condition}
                            </span>
                          )}
                        </div>
                      </div>
                      {item.itemWebUrl && (
                        <a
                          href={item.itemWebUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                          title="View on eBay"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No similar items found. Try a more detailed description.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
