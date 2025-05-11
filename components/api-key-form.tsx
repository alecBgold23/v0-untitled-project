"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function ApiKeyForm() {
  const [apiKey, setApiKey] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      setStatus({
        type: "error",
        message: "Please enter your OpenAI API key.",
      })
      return
    }

    setIsSubmitting(true)
    setStatus({ type: null, message: "" })

    try {
      // Send the API key to the server to set it as an environment variable
      const response = await fetch("/api/set-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({
          type: "success",
          message: data.message || "API Key has been saved successfully!",
        })
        // Clear the input after successful submission
        setApiKey("")
      } else {
        setStatus({
          type: "error",
          message: data.error || "There was an error saving the API key.",
        })
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "There was a network error. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">OpenAI API Key</CardTitle>
        <CardDescription>Enter your OpenAI API key to enable AI features</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored securely and never shared with third parties.
            </p>
          </div>

          {status.type && (
            <Alert variant={status.type === "error" ? "destructive" : "default"} className="mt-4">
              <div className="flex items-center gap-2">
                {status.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{status.message}</AlertDescription>
              </div>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save API Key"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-muted-foreground text-center">
          You can get your API key from the{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            OpenAI dashboard
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
