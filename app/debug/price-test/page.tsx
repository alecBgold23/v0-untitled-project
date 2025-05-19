"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function PriceTestPage() {
  const [itemName, setItemName] = useState("")
  const [description, setDescription] = useState("")
  const [condition, setCondition] = useState("Good")
  const [defects, setDefects] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/price-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName,
          description,
          condition,
          defects,
          item_name: itemName,
          brief_description: description,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error testing price API:", error)
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Price API Test</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Input</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g., Sony PlayStation 5"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the item in detail"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="defects">Defects/Issues</Label>
                <Textarea
                  id="defects"
                  value={defects}
                  onChange={(e) => setDefects(e.target.value)}
                  placeholder="Any defects or issues with the item"
                  rows={2}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Testing..." : "Test Price API"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-[400px]">
                  <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                </div>

                {result.estimated_price && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">Estimated Price</p>
                    <p className="text-3xl font-bold">${result.estimated_price}</p>
                    {result.source && <p className="text-xs text-gray-500 mt-1">Source: {result.source}</p>}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">API response will appear here</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
