"use client"

import { useState } from "react"

export default function TestPricingPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")

  async function testPricingApi() {
    setLoading(true)
    setResult("")

    const res = await fetch("/api/ask-openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "How much is a used iPhone 11 worth?",
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (data?.choices?.[0]?.message?.content) {
      setResult(data.choices[0].message.content)
    } else {
      setResult(`Error: ${JSON.stringify(data)}`)
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Pricing API</h1>
      <button onClick={testPricingApi} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Testing..." : "Send Test Prompt"}
      </button>
      <div className="mt-4 whitespace-pre-wrap text-gray-800">{result}</div>
    </div>
  )
}
