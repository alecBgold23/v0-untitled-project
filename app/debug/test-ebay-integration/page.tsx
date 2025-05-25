"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface TestResult {
  name: string
  status: "PASS" | "FAIL" | "UNKNOWN"
  details?: any
  error?: string
}

interface TestResults {
  timestamp: string
  tests: TestResult[]
  overall: "PASS" | "FAIL" | "UNKNOWN"
  summary: string
}

export default function TestEbayIntegration() {
  const [results, setResults] = useState<TestResults | null>(null)
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/test-ebay-integration")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({
        timestamp: new Date().toISOString(),
        tests: [
          {
            name: "Test Execution",
            status: "FAIL",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        ],
        overall: "FAIL",
        summary: "❌ Failed to execute tests",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "FAIL":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PASS":
        return (
          <Badge variant="default" className="bg-green-500">
            PASS
          </Badge>
        )
      case "FAIL":
        return <Badge variant="destructive">FAIL</Badge>
      default:
        return <Badge variant="secondary">UNKNOWN</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">eBay Integration Test</h1>
        <p className="text-muted-foreground">
          This will test your eBay API integration to verify if it's working correctly.
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={runTests} disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            "Run eBay Integration Tests"
          )}
        </Button>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(results.overall)}
                Overall Status: {getStatusBadge(results.overall)}
              </CardTitle>
              <CardDescription>Test completed at {new Date(results.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{results.summary}</p>
            </CardContent>
          </Card>

          {/* Individual Test Results */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Test Details</h2>
            {results.tests.map((test, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      {test.name}
                    </span>
                    {getStatusBadge(test.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {test.error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-700 font-medium">Error:</p>
                      <p className="text-red-600 text-sm font-mono">{test.error}</p>
                    </div>
                  )}

                  {test.details && (
                    <div className="space-y-2">
                      <p className="font-medium">Details:</p>
                      <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
