"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

export default function OpenAIModelsDebug() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modelData, setModelData] = useState<any>(null)

  const checkModels = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/check-openai-models")
      const data = await response.json()

      setModelData(data)

      if (data.error) {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message || "Failed to check OpenAI models")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkModels()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>OpenAI Models Debug</CardTitle>
          <CardDescription>Check which OpenAI models are available with your API key</CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2">Checking OpenAI models...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <Alert variant={modelData.isValid ? "default" : "destructive"}>
                {modelData.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>API Key Status</AlertTitle>
                <AlertDescription>
                  {modelData.isValid
                    ? "Your OpenAI API key is valid and working."
                    : "Your OpenAI API key is invalid or not configured."}
                </AlertDescription>
              </Alert>

              {modelData.isValid && (
                <>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Required Models</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {["gpt-3.5-turbo", "gpt-3.5-turbo-instruct", "text-davinci-003"].map((model) => (
                        <div key={model} className="flex items-center p-2 border rounded">
                          {modelData.availableRequiredModels?.includes(model) ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <span>{model}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!modelData.hasRequiredModels && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        None of the required models are available with your API key. The application will use fallback
                        methods for price estimation and description generation.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <h3 className="text-lg font-medium mb-2">All Available Models</h3>
                    <div className="max-h-60 overflow-y-auto border rounded p-2">
                      {modelData.models?.length > 0 ? (
                        <ul className="space-y-1">
                          {modelData.models.map((model: string) => (
                            <li key={model} className="text-sm">
                              {model}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No models available</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button onClick={checkModels} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
