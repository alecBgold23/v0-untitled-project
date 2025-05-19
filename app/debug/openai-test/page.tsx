"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, AlertTriangle } from "lucide-react"

export default function OpenAITest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [condition, setCondition] = useState("used")
  const [result, setResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("price")

  const testPriceEstimation = async () => {
    if (!description) {
      setError("Please enter a description")
      return
    }

    setLoading(true)
    setError(null)
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

      if (data.error) {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message || "Failed to estimate price")
    } finally {
      setLoading(false)
    }
  }

  const testDescriptionGeneration = async () => {
    if (!description) {
      setError("Please enter a title")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: description,
          condition,
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.error) {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate description")
    } finally {
      setLoading(false)
    }
  }

  const testTitleGeneration = async () => {
    if (!description) {
      setError("Please enter a description")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/generate-ebay-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.error) {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate title")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (activeTab === "price") {
      testPriceEstimation()
    } else if (activeTab === "description") {
      testDescriptionGeneration()
    } else if (activeTab === "title") {
      testTitleGeneration()
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>OpenAI Integration Test</CardTitle>
          <CardDescription>
            Test the OpenAI integration for price estimation, description generation, and title optimization
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="price">Price Estimation</TabsTrigger>
              <TabsTrigger value="description">Description Generation</TabsTrigger>
              <TabsTrigger value="title">Title Optimization</TabsTrigger>
            </TabsList>

            <TabsContent value="price" className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Description</label>
                <Textarea
                  placeholder="Enter item description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Condition</label>
                <Input
                  placeholder="Enter condition (e.g., new, used, like new)"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="description" className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Title</label>
                <Input
                  placeholder="Enter item title"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Condition</label>
                <Input
                  placeholder="Enter condition (e.g., new, used, like new)"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="title" className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Description</label>
                <Textarea
                  placeholder="Enter item description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-medium mb-2">Result</h3>

              {activeTab === "price" && (
                <div>
                  <p className="text-2xl font-bold">{result.price}</p>
                  <p className="text-sm text-gray-500">Source: {result.source}</p>
                </div>
              )}

              {activeTab === "description" && (
                <div>
                  <p className="whitespace-pre-wrap">{result.description}</p>
                  <p className="text-sm text-gray-500 mt-2">Source: {result.source}</p>
                </div>
              )}

              {activeTab === "title" && (
                <div>
                  <p className="text-xl font-medium">{result.title}</p>
                  <p className="text-sm text-gray-500">Source: {result.source}</p>
                </div>
              )}

              <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Test OpenAI Integration"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
