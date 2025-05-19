"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"

export function PriceEstimationStatus() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<"available" | "unavailable" | "fallback" | "error">("unavailable")
  const [message, setMessage] = useState("")
  const [testPrice, setTestPrice] = useState<string | null>(null)
  const [testSource, setTestSource] = useState<string | null>(null)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/check-openai-key")
      const data = await response.json()

      if (data.valid) {
        setStatus("available")
        setMessage("OpenAI API is configured and working")
      } else {
        setStatus("fallback")
        setMessage("Using fallback price estimation (OpenAI API not available)")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error checking OpenAI API status")
    } finally {
      setLoading(false)
    }
  }

  const testPriceEstimation = async () => {
    setTestLoading(true)
    setTestPrice(null)
    setTestSource(null)

    try {
      const response = await fetch("/api/price-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: "Vintage leather jacket in good condition, size medium",
          condition: "good",
        }),
      })

      const data = await response.json()
      setTestPrice(data.price)
      setTestSource(data.source)

      if (data.source === "openai") {
        setStatus("available")
        setMessage("OpenAI API is configured and working")
      } else if (data.source === "fallback") {
        setStatus("fallback")
        setMessage("Using fallback price estimation (OpenAI API not available)")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error testing price estimation")
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : status === "available" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : status === "fallback" ? (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
          Price Estimation Status
        </CardTitle>
        <CardDescription>Check the status of the price estimation service</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking price estimation service...
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={status === "available" ? "default" : status === "fallback" ? "outline" : "destructive"}>
                {status === "available" ? "Available" : status === "fallback" ? "Fallback Mode" : "Error"}
              </Badge>
              <span>{message}</span>
            </div>

            {testPrice && (
              <Alert className="mt-4">
                <AlertTitle>Test Result</AlertTitle>
                <AlertDescription>
                  <div className="mt-2">
                    <div className="font-medium">Estimated Price: {testPrice}</div>
                    <div className="text-sm text-muted-foreground">Source: {testSource}</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={checkStatus} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
        <Button onClick={testPriceEstimation} disabled={testLoading}>
          {testLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Price Estimation"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
