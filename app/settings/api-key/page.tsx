"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Key, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ApiKeyPage() {
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [keyStatus, setKeyStatus] = useState<"unknown" | "valid" | "invalid">("unknown")
  const [errorMessage, setErrorMessage] = useState("")
  const { toast } = useToast()

  // Check if API key is already set
  useEffect(() => {
    const checkApiKey = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/check-openai-key")
        const data = await response.json()

        if (data.success) {
          setKeyStatus("valid")
        } else if (data.hasKey) {
          setKeyStatus("invalid")
          setErrorMessage(data.message || "API key is invalid")
        } else {
          setKeyStatus("unknown")
        }
      } catch (error) {
        console.error("Error checking API key:", error)
        setKeyStatus("unknown")
        setErrorMessage("Failed to check API key status")
      } finally {
        setIsLoading(false)
      }
    }

    checkApiKey()
  }, [])

  const validateApiKey = (key: string): boolean => {
    // Simple validation: Key should start with 'sk-' and be at least 20 chars
    return key.startsWith("sk-") && key.length >= 20
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      })
      return
    }

    // Validate key format before sending to server
    if (!validateApiKey(apiKey.trim())) {
      toast({
        title: "Invalid Key Format",
        description: "OpenAI keys should start with 'sk-' and be at least 20 characters",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/set-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      const data = await response.json()

      if (data.success) {
        setKeyStatus("valid")
        toast({
          title: "Success",
          description: "API key has been validated successfully",
        })
      } else {
        setKeyStatus("invalid")
        setErrorMessage(data.message || data.error || "Failed to validate API key")
        toast({
          title: "Error",
          description: data.message || "Failed to validate API key",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving API key:", error)
      setKeyStatus("invalid")
      setErrorMessage("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Key className="h-5 w-5" />
              OpenAI API Key
            </CardTitle>
            <CardDescription>Configure your OpenAI API key to enable AI-powered features.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Your API key is stored securely and never shared with third parties.
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking API key status...</span>
                </div>
              ) : keyStatus === "valid" ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <span>API key is valid and working</span>
                </div>
              ) : keyStatus === "invalid" ? (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errorMessage || "API key is invalid or has expired"}</span>
                </div>
              ) : null}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveApiKey} disabled={isSaving || !apiKey.trim()} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Validate API Key"
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-medium">How to get an OpenAI API key</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Go to{" "}
              <a
                href="https://platform.openai.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                OpenAI's website
              </a>{" "}
              and sign up for an account
            </li>
            <li>
              Navigate to the{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                API keys section
              </a>
            </li>
            <li>Click on "Create new secret key"</li>
            <li>Copy the key and paste it in the field above</li>
            <li>Click "Validate API Key"</li>
          </ol>
          <p className="text-sm text-muted-foreground mt-4">
            Note: OpenAI API usage is not free. You will be charged based on your usage. Check{" "}
            <a
              href="https://openai.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              OpenAI's pricing
            </a>{" "}
            for more details.
          </p>
        </div>
      </div>
    </div>
  )
}
