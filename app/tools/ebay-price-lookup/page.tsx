"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SimilarEbayItems } from "@/components/similar-ebay-items"
import { Search } from "lucide-react"

export default function EbayPriceLookupPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [description, setDescription] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setDescription(searchTerm)
    setIsSearching(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">eBay Price Lookup Tool</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Find similar items on eBay to estimate the value of your items
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search for Similar Items</CardTitle>
            <CardDescription>
              Enter a detailed description of your item to find similar listings on eBay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="search">Item Description</Label>
                <Textarea
                  id="search"
                  placeholder="e.g., iPhone 13 Pro Max 256GB Graphite Unlocked Good Condition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Include brand, model, condition, and any specific details for better results
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0066ff] to-[#6a5acd]"
                disabled={!searchTerm.trim()}
              >
                <Search className="h-4 w-4 mr-2" />
                Find Similar Items
              </Button>
            </form>
          </CardContent>
        </Card>

        {isSearching && description && (
          <SimilarEbayItems
            description={description}
            onPriceSelected={(price) => {
              // You could add functionality here to save the price or do something with it
              console.log("Selected price:", price)
            }}
          />
        )}
      </div>
    </div>
  )
}
