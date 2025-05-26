"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

interface DiagnosticResult {
  timestamp: string
  status: "WORKING" | "BROKEN" | "LIMITED" | "UNKNOWN"
  issues: string[]
  details: any
}

export default function EbayDiagnostic() {
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostic = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/ebay-diagnostic")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        timestamp: new Date().toISOString(),
        status: "BROKEN",
        issues: [`Failed to run diagnostic: ${error instanceof Error ? error.message : "Unknown error"}`],
        details: {},
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "WORKING":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "LIMITED":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "BROKEN":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WORKING":
        return <Badge className="bg-green-500">WORKING</Badge>
      case "LIMITED":
        return <Badge className="bg-yellow-500">LIMITED</Badge>
      case "BROKEN":
        return <Badge variant="destructive">BROKEN</Badge>
      default:
        return <Badge variant="secondary">UNKNOWN</Badge>
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "WORKING":
        return "eBay API is fully functional"
      case "LIMITED":
        return "eBay API works but has significant limitations for price estimation"
      case "BROKEN":
        return "eBay API is not working correctly"
      default:
        return "eBay API status unknown"
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">eBay API Diagnostic</h1>
        <p className="text-muted-foreground">
          This diagnostic will honestly assess whether your eBay Browse API integration is working correctly for price
          estimation.
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={runDiagnostic} disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Diagnostic...
            </>
          ) : (
            "Run eBay API Diagnostic"
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                Status: {getStatusBadge(result.status)}
              </CardTitle>
              <CardDescription>Diagnostic completed at {new Date(result.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">{getStatusMessage(result.status)}</p>

              {result.status === "LIMITED" && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> The eBay Browse API only provides access to active listings, not
                    sold/completed items. This means price estimates are based on asking prices, not actual sale prices,
                    making them unreliable for true market value.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Issues */}
          {result.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Issues Found</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.status === "BROKEN" && (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Fix the API authentication and configuration issues before proceeding.
                    </AlertDescription>
                  </Alert>
                )}

                {result.status === "LIMITED" && (
                  <div className="space-y-3">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>For accurate pricing, consider:</strong>
                        <ul className="mt-2 ml-4 list-disc space-y-1">
                          <li>Using eBay's Finding API (deprecated but has sold listings)</li>
                          <li>Implementing web scraping for sold listings</li>
                          <li>Using alternative pricing APIs</li>
                          <li>Relying more heavily on OpenAI price estimation</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
