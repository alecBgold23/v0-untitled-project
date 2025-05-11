"use client"

import { useState } from "react"
import { AIDescriptionButton } from "@/components/ai-description-button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AIDescriptionDemoPage() {
  const [inputText, setInputText] = useState("")
  const [generatedDescription, setGeneratedDescription] = useState("")

  const handleDescriptionGenerated = (description: string) => {
    setGeneratedDescription(description)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">AI Description Generator Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Enter basic details about your product or item</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter basic details about your item (condition, brand, size, color, etc.)"
              className="min-h-[200px]"
            />
          </CardContent>
          <CardFooter>
            <AIDescriptionButton inputText={inputText} onDescriptionGenerated={handleDescriptionGenerated} />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Description</CardTitle>
            <CardDescription>AI-enhanced description for your item</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedDescription ? (
              <div className="prose">
                <p>{generatedDescription}</p>
              </div>
            ) : (
              <div className="text-muted-foreground italic">
                Your enhanced description will appear here after generation
              </div>
            )}
          </CardContent>
          <CardFooter>
            {generatedDescription && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedDescription)
                  alert("Description copied to clipboard!")
                }}
                className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                Copy to Clipboard
              </button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
