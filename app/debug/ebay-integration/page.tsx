"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw, Search } from "lucide-react"

export default function EbayIntegrationDebugPage() {
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("iPhone 13")
  const [searchResults, setSearchResults] = useState<any>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  // Check API status
  async function checkApiStatus() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/debug-ebay")
      const data = await response.json()
      setApiStatus(data)
    } catch (error: any) {
      console.error("Error checking eBay API status:", error)
      setApiStatus({ error: error.message || "Failed to check API status" })
    } finally {
      setIsLoading(false)
    }
  }

  // Test search
  async function testSearch() {
    if (!searchQuery.trim()) return

    setSearchLoading(true)
    setSearchError(null)
    setSearchResults(null)

    try {
      const response = await fetch(`/api/ebay-search?q=${encodeURIComponent(searchQuery)}&limit=3`)

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`API returned error ${response.status}: ${errorData}`)
      }

      const data = await response.json()
      setSearchResults(data)
    } catch (error: any) {
      console.error("Error testing eBay search:", error)
      setSearchError(error.message || "Failed to search")
    } finally {
      setSearchLoading(false)
    }
  }

  // Automatically check API status on component mount
  useEffect(() => {
    checkApiStatus()
  }, [])

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">eBay API Integration Debug</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Check your eBay Developer API integration status and test functionality
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>eBay API Status</span>
            {apiStatus &&
              !apiStatus.error &&
              (apiStatus.tokenTest?.status === "Success" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ))}
          </CardTitle>
          <CardDescription>Checks if your eBay API credentials are properly configured</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {apiStatus?.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{apiStatus.error}</AlertDescription>
            </Alert>
          ) : apiStatus ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Environment Variables</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Client ID:</span>
                      <span
                        className={
                          apiStatus.environmentVariables?.clientId === "✓ Set" ? "text-green-500" : "text-red-500"
                        }
                      >
                        {apiStatus.environmentVariables?.clientId || "Not checked"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Client Secret:</span>
                      <span
                        className={
                          apiStatus.environmentVariables?.clientSecret === "✓ Set" ? "text-green-500" : "text-red-500"
                        }
                      >
                        {apiStatus.environmentVariables?.clientSecret || "Not checked"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>OAuth Token:</span>
                      <span
                        className={
                          apiStatus.environmentVariables?.oauthToken === "✓ Set" ? "text-green-500" : "text-red-500"
                        }
                      >
                        {apiStatus.environmentVariables?.oauthToken || "Not checked"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Browse API Endpoint:</span>
                      <span
                        className={
                          apiStatus.environmentVariables?.browseApiEndpoint === "✓ Set"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {apiStatus.environmentVariables?.browseApiEndpoint || "Not checked"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">OAuth Token Test</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={apiStatus.tokenTest?.status === "Success" ? "text-green-500" : "text-red-500"}>
                        {apiStatus.tokenTest?.status || "Not checked"}
                      </span>
                    </div>
                    {apiStatus.tokenTest?.status === "Success" && (
                      <>
                        <div className="flex justify-between">
                          <span>Token:</span>
                          <span className="font-mono">{apiStatus.tokenTest?.tokenStart}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Token Length:</span>
                          <span>{apiStatus.tokenTest?.tokenLength} characters</span>
                        </div>
                      </>
                    )}
                    {apiStatus.tokenTest?.error && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-red-600 dark:text-red-400 text-xs">
                        {apiStatus.tokenTest.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Last checked: {new Date(apiStatus.timestamp).toLocaleString()}
              </div>
            </>
          ) : (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-gray-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button onClick={checkApiStatus} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Test eBay Search</CardTitle>
          <CardDescription>Test searching eBay to verify your API integration is working</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="search-query" className="sr-only">
                Search Query
              </Label>
              <Input
                id="search-query"
                placeholder="Enter search query (e.g. iPhone 13)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && testSearch()}
              />
            </div>
            <Button onClick={testSearch} disabled={searchLoading || !searchQuery.trim()}>
              {searchLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {searchError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Search Error</AlertTitle>
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}

          {searchResults && (
            <div className="space-y-4">
              <div className="text-sm font-medium">Found {searchResults.itemSummaries?.length || 0} items</div>

              {searchResults.itemSummaries?.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.itemSummaries.map((item: any) => (
                    <Card key={item.itemId} className="overflow-hidden">
                      <div className="flex gap-3">
                        {item.image?.imageUrl && (
                          <div className="w-24 h-24 flex-shrink-0">
                            <img
                              src={item.image.imageUrl || "/placeholder.svg"}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-3 flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{item.title}</div>
                          {item.price && (
                            <div className="font-bold">
                              {item.price.currency} {item.price.value}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">ID: {item.itemId?.substring(0, 10)}...</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No results found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500 space-y-2">
        <p>
          <strong>Troubleshooting:</strong> If you're seeing errors, check your eBay Developer credentials and make sure
          they're correctly set in your environment variables.
        </p>
        <p>
          <strong>Required Environment Variables:</strong>
          EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, EBAY_BROWSE_API_ENDPOINT
        </p>
      </div>
    </div>
  )
}
