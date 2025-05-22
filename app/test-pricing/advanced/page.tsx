"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdvancedTestPricingPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [prompt, setPrompt] = useState("How much is a used iPhone 11 worth?")
  const [model, setModel] = useState("gpt-4o")
  const [temperature, setTemperature] = useState(0.7)
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant that specializes in estimating the value of used items. Provide concise, accurate price estimates based on current market conditions.",
  )

  async function testPricingApi() {
    setLoading(true)
    setResult("")

    try {
      const res = await fetch("/api/ask-openai-advanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model,
          temperature,
          systemPrompt,
        }),
      })

      const data = await res.json()
      setLoading(false)

      if (data?.choices?.[0]?.message?.content) {
        setResult(data.choices[0].message.content)
      } else {
        setResult(`Error: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      setLoading(false)
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Pricing API Test</CardTitle>
          <CardDescription>Test the OpenAI API with custom parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Temperature</label>
            <Input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number.parseFloat(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">System Prompt</label>
            <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={3} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">User Prompt</label>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={testPricingApi} disabled={loading} className="w-full">
            {loading ? "Processing..." : "Send Request"}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-md border">{result}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
