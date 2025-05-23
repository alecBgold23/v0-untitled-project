"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, DollarSign } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TechPricingTestPage() {
  const [description, setDescription] = useState("")
  const [condition, setCondition] = useState("Good")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/price-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          condition,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error testing tech pricing:", error)
      setResult({ error: "Failed to test tech pricing" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Tech Pricing Test</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Tech Pricing</CardTitle>
            <CardDescription>Enter a tech item description to test the pricing logic</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Item Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., MacBook Air 13 inch M4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brand New">Brand New</SelectItem>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Test Price
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>The pricing result will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Price:</h3>
                  <p className="text-2xl font-bold">{result.price}</p>
                </div>
                <div>
                  <h3 className="font-medium">Source:</h3>
                  <p>{result.source}</p>
                </div>
                <div>
                  <h3 className="font-medium">Confidence:</h3>
                  <p>{result.confidence}</p>
                </div>
                {result.error && (
                  <div>
                    <h3 className="font-medium text-red-500">Error:</h3>
                    <p className="text-red-500">{result.error}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">Raw Response:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center p-8">No result yet. Test a tech item to see the price.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Test Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            "MacBook Air 13 inch M4",
            "iPhone 15 Pro Max",
            "MacBook Pro 16 inch M3",
            "iPad Pro 12.9 M2",
            "Samsung Galaxy S24 Ultra",
            "AirPods Pro 2",
          ].map((example) => (
            <Button
              key={example}
              variant="outline"
              onClick={() => {
                setDescription(example)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
