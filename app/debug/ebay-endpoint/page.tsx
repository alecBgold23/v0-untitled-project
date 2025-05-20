"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function EbayEndpointDebugPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  const testEndpoint = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-ebay-endpoint")

      if (!response.ok) {
        throw new Error(`Error testing endpoint: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err: any) {
      console.error("Error testing eBay endpoint:", err)
      setError(err.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testEndpoint()
  }, [])

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">eBay API Endpoint Debug</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>eBay API Endpoint Configuration</CardTitle>
          <CardDescription>Testing your eBay API endpoint configuration</CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Configured Endpoint:</h3>
                <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded block">{data.configuredEndpoint}</code>
              </div>

              <div>
                <h3 className="font-medium mb-1">Base Endpoint (Used for API calls):</h3>
                <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded block">{data.baseEndpoint}</code>
                {data.configuredEndpoint !== data.baseEndpoint && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      The base endpoint was extracted from your configured endpoint. This is normal if you included the
                      full path.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-1">OAuth Token Test:</h3>
                <div className="flex items-center">
                  {data.tokenTest.status === "Success" ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Success! Token length: {data.tokenTest.length}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span>Failed: {data.tokenTest.error}</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-1">Search Test:</h3>
                <div className="flex items-center">
                  {data.searchTest.status === "Success" ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Success! Found {data.searchTest.totalResults} results</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span>Failed: {data.searchTest.error}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500">Last tested: {new Date(data.timestamp).toLocaleString()}</div>
            </div>
          ) : (
            <div className="text-center p-6 text-gray-500">No data available</div>
          )}
        </CardContent>

        <CardFooter>
          <Button onClick={testEndpoint} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Again
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Endpoint Format</AlertTitle>
        <AlertDescription>
          The recommended format for EBAY_BROWSE_API_ENDPOINT is{" "}
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">https://api.ebay.com/buy/browse/v1</code>.
          If you include <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">/item_summary/search</code>{" "}
          in your endpoint, the code will automatically extract the base part.
        </AlertDescription>
      </Alert>
    </div>
  )
}
