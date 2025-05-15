"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ItemIdentifierPage() {
  const [itemName, setItemName] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any>(null)
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setSearchResults(null)

    try {
      // Simulate a search delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create a mock result based on the item name
      const mockResult = {
        name: itemName,
        category: getCategoryFromName(itemName),
        specifications: generateMockSpecifications(itemName),
        estimatedValue: generateMockValue(itemName),
        condition: "Used - Good",
        marketDemand: Math.floor(Math.random() * 5) + 1,
        shippingWeight: (Math.random() * 10).toFixed(1) + " lbs",
      }

      setSearchResults(mockResult)

      toast({
        title: "Search Complete",
        description: `Found information for ${itemName}`,
      })
    } catch (error) {
      console.error("Error searching for item:", error)
      toast({
        title: "Error",
        description: "Failed to search for item information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Helper functions to generate mock data
  const getCategoryFromName = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("phone") || lowerName.includes("iphone") || lowerName.includes("samsung")) {
      return "Electronics - Smartphones"
    } else if (lowerName.includes("laptop") || lowerName.includes("computer") || lowerName.includes("macbook")) {
      return "Electronics - Computers"
    } else if (lowerName.includes("watch") || lowerName.includes("jewelry")) {
      return "Jewelry & Watches"
    } else if (lowerName.includes("shoe") || lowerName.includes("sneaker") || lowerName.includes("boot")) {
      return "Clothing - Footwear"
    } else if (lowerName.includes("camera") || lowerName.includes("lens")) {
      return "Electronics - Cameras"
    } else {
      return "Miscellaneous"
    }
  }

  const generateMockSpecifications = (name: string) => {
    const lowerName = name.toLowerCase()

    if (lowerName.includes("phone") || lowerName.includes("iphone") || lowerName.includes("samsung")) {
      return [
        "Screen Size: 6.1 inches",
        "Storage: 128GB",
        "Camera: 12MP dual lens",
        "Battery: 3000mAh",
        "Color: Space Gray",
      ]
    } else if (lowerName.includes("laptop") || lowerName.includes("computer") || lowerName.includes("macbook")) {
      return [
        "Processor: Intel Core i5",
        "RAM: 8GB",
        "Storage: 256GB SSD",
        "Screen Size: 13.3 inches",
        "Graphics: Integrated",
      ]
    } else if (lowerName.includes("watch") || lowerName.includes("jewelry")) {
      return [
        "Material: Stainless Steel",
        "Band Type: Leather",
        "Water Resistant: Yes",
        "Battery Life: 18 hours",
        "Features: Heart rate monitor",
      ]
    } else {
      return [
        "Material: Mixed",
        "Dimensions: Medium size",
        "Color: Various",
        "Condition: Used",
        "Additional Features: Standard",
      ]
    }
  }

  const generateMockValue = (name: string) => {
    const lowerName = name.toLowerCase()

    if (lowerName.includes("iphone") || lowerName.includes("macbook") || lowerName.includes("pro")) {
      return "$" + (Math.floor(Math.random() * 900) + 300).toString()
    } else if (lowerName.includes("samsung") || lowerName.includes("galaxy") || lowerName.includes("laptop")) {
      return "$" + (Math.floor(Math.random() * 700) + 200).toString()
    } else if (lowerName.includes("watch") || lowerName.includes("jewelry")) {
      return "$" + (Math.floor(Math.random() * 500) + 100).toString()
    } else {
      return "$" + (Math.floor(Math.random() * 200) + 50).toString()
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Item Identifier Tool</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search for Item Information</CardTitle>
            <CardDescription>Enter an item name to get detailed specifications and information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="e.g., iPhone 13, Nike Air Jordan, Sony Camera"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Search</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {isSearching && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Searching for item information...</p>
          </div>
        )}

        {searchResults && (
          <Card>
            <CardHeader>
              <CardTitle>{searchResults.name}</CardTitle>
              <CardDescription>Category: {searchResults.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="specs">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="market">Market Info</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                </TabsList>

                <TabsContent value="specs" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Item Specifications</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {searchResults.specifications.map((spec: string, index: number) => (
                        <li key={index}>{spec}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Condition</h3>
                    <p>{searchResults.condition}</p>
                  </div>
                </TabsContent>

                <TabsContent value="market">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Estimated Value</h3>
                      <p className="text-2xl font-bold">{searchResults.estimatedValue}</p>
                      <p className="text-sm text-muted-foreground">
                        Based on similar items and current market conditions
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Market Demand</h3>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded-full mr-1 ${
                              i < searchResults.marketDemand ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        ))}
                        <span className="ml-2">{searchResults.marketDemand}/5</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="shipping">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Shipping Information</h3>
                      <p>
                        <strong>Estimated Weight:</strong> {searchResults.shippingWeight}
                      </p>
                      <p>
                        <strong>Recommended Packaging:</strong> Standard Box
                      </p>
                      <p>
                        <strong>Special Handling:</strong> None required
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(searchResults, null, 2))
                  toast({
                    title: "Copied",
                    description: "Item information copied to clipboard",
                  })
                }}
              >
                Copy Item Information
              </Button>
            </CardFooter>
          </Card>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">How to Use This Tool</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Enter the name of your item in the search box</li>
            <li>Click "Search" to find detailed information</li>
            <li>Review the specifications, market information, and shipping details</li>
            <li>Use this information to create accurate listings for your items</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
