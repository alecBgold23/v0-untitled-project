import { NextResponse } from "next/server"
import { openaiRequest } from "@/lib/openai"
import { hasOpenAIKey } from "@/lib/env"

export async function GET() {
  try {
    if (!hasOpenAIKey()) {
      return NextResponse.json({
        error: "OpenAI API key is not configured",
        isValid: false,
        models: [],
      })
    }

    // Try to get the list of available models
    const response = await openaiRequest("/models", "GET")

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({
        error: `OpenAI API error: ${errorData.error?.message || response.statusText}`,
        isValid: false,
        models: [],
      })
    }

    const data = await response.json()

    // Extract model IDs
    const models = data.data?.map((model: any) => model.id) || []

    // Check if we have the models we need
    const requiredModels = ["gpt-3.5-turbo", "gpt-3.5-turbo-instruct", "text-davinci-003"]
    const availableRequiredModels = requiredModels.filter((model) => models.includes(model))

    return NextResponse.json({
      isValid: true,
      models: models,
      availableRequiredModels,
      hasRequiredModels: availableRequiredModels.length > 0,
    })
  } catch (error: any) {
    console.error("Error checking OpenAI models:", error)
    return NextResponse.json({
      error: error.message || "Error checking OpenAI models",
      isValid: false,
      models: [],
    })
  }
}
