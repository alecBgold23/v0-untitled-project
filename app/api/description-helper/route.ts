import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid input. Please provide a text field." }, { status: 400 })
    }

    const prompt = `
    You are a product identification and description expert specializing in marketplace listings.
    
    Your task is to:
    1. Identify the EXACT model, make, and specifications of the item based on the basic information provided
    2. Create a detailed, accurate description of the specific item with its exact features and specifications
    3. Include technical details that would be relevant to a buyer
    4. Maintain a professional, informative tone
    
    For example, if the input is "oculus", you should identify it as something like "Oculus Meta Quest 3S" and provide specific details about that exact model, including storage capacity, resolution, controllers, etc.
    
    Only include information that would be accurate for the specific model you've identified. Do not make up features that don't exist for that model.
    
    Basic item information: ${text}
    
    Detailed identification and description:
    `

    const { text: improvedText } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 500,
    })

    return NextResponse.json({ result: improvedText.trim() })
  } catch (error) {
    console.error("Error in description-helper API:", error)
    return NextResponse.json({ error: "Failed to identify and describe item" }, { status: 500 })
  }
}
