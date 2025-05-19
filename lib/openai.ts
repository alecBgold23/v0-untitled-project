import { hasOpenAIKey, getOpenAIKey } from "@/lib/env"

/**
 * Creates a properly configured OpenAI API request with the correct headers
 * @param endpoint The OpenAI API endpoint (without the base URL)
 * @param method HTTP method
 * @param body Request body
 * @returns Fetch response
 */
export async function openaiRequest(endpoint: string, method: "GET" | "POST" = "POST", body?: any): Promise<Response> {
  const apiKey = getOpenAIKey()

  if (!apiKey) {
    throw new Error("OpenAI API key is not configured")
  }

  const url = `https://api.openai.com/v1${endpoint}`

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  }

  const options: RequestInit = {
    method,
    headers,
    cache: "no-store",
  }

  if (body && method === "POST") {
    options.body = JSON.stringify(body)
  }

  return fetch(url, options)
}

/**
 * Safely extracts text from OpenAI API response
 * @param data The response data from OpenAI API
 * @returns The extracted text or empty string if not found
 */
function safelyExtractText(data: any): string {
  try {
    // Log the response for debugging
    console.log("OpenAI API response:", JSON.stringify(data).substring(0, 500))

    // Check if we have a chat completion response
    if (data?.choices && data.choices.length > 0 && data.choices[0]?.message?.content) {
      return data.choices[0].message.content.trim()
    }

    // Check if we have a completion response
    if (data?.choices && data.choices.length > 0 && data.choices[0]?.text) {
      return data.choices[0].text.trim()
    }

    // If we can't find the expected format, log and return empty
    console.warn("Unexpected OpenAI API response format:", JSON.stringify(data).substring(0, 500))
    return ""
  } catch (error) {
    console.error("Error extracting text from OpenAI response:", error)
    return ""
  }
}

/**
 * Generates text using OpenAI's completion API with fallback to older models if needed
 * @param prompt The prompt to send to OpenAI
 * @param options Additional options
 * @returns Generated text
 */
export async function generateText(
  prompt: string,
  options: {
    model?: string
    temperature?: number
    max_tokens?: number
  } = {},
): Promise<string> {
  // Default options
  const { temperature = 0.7, max_tokens = 500 } = options

  // Try different models in order of preference
  const models = [options.model || "gpt-3.5-turbo", "gpt-3.5-turbo-instruct", "text-davinci-003"]

  // Track errors for logging
  const errors: any[] = []

  try {
    // First, check if the API key is valid
    if (!hasOpenAIKey()) {
      console.warn("OpenAI API key is not configured, returning empty result")
      return ""
    }

    // Try each model in sequence
    for (const model of models) {
      try {
        console.log(`Attempting to generate text with model: ${model}`)

        let response: Response
        let data: any

        // Different handling based on model type
        if (model.includes("gpt-3.5-turbo") && !model.includes("instruct")) {
          // Chat completion API
          response = await openaiRequest("/chat/completions", "POST", {
            model,
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant that provides concise, accurate information.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature,
            max_tokens,
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`OpenAI API error (${model}): ${errorData.error?.message || response.statusText}`)
          }

          data = await response.json()

          // Extract text from chat completion response
          if (data?.choices && data.choices.length > 0 && data.choices[0]?.message?.content) {
            return data.choices[0].message.content.trim()
          }
        } else {
          // Completion API (for older models)
          response = await openaiRequest("/completions", "POST", {
            model,
            prompt,
            temperature,
            max_tokens,
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`OpenAI API error (${model}): ${errorData.error?.message || response.statusText}`)
          }

          data = await response.json()

          // Extract text from completion response
          if (data?.choices && data.choices.length > 0 && data.choices[0]?.text) {
            return data.choices[0].text.trim()
          }
        }

        // If we got here but couldn't extract text, log and continue to next model
        console.warn(`Failed to extract text from ${model} response:`, JSON.stringify(data).substring(0, 500))
        errors.push(`No text found in ${model} response`)
      } catch (modelError) {
        console.error(`Error with model ${model}:`, modelError)
        errors.push(modelError)
        // Continue to next model
      }
    }

    // If we've tried all models and none worked, throw an error with all collected errors
    throw new Error(`All OpenAI models failed: ${errors.map((e) => e.message || e).join("; ")}`)
  } catch (error) {
    console.error("Error generating text with OpenAI:", error)
    // Return empty string instead of throwing to make the API more resilient
    return ""
  }
}

/**
 * Checks if the OpenAI API key is valid and working
 * @returns Boolean indicating if the key is valid
 */
export async function isOpenAIKeyValid(): Promise<boolean> {
  if (!hasOpenAIKey()) {
    return false
  }

  try {
    // Make a simple models list request to verify the key
    const response = await openaiRequest("/models", "GET")
    return response.ok
  } catch (error) {
    console.error("Error validating OpenAI API key:", error)
    return false
  }
}

/**
 * Generates a price estimate using OpenAI
 * @param description Item description
 * @param condition Item condition
 * @returns Estimated price range
 */
export async function generatePriceEstimate(description: string, condition = "used"): Promise<string> {
  const prompt = `
    You are an expert in estimating the resale value of used items.
    
    Please estimate the current market value of the following item:
    
    Item Description: ${description}
    Condition: ${condition}
    
    Provide only a price range in USD format (e.g., "$50-$75" or "$100-$150").
    Do not include any explanations or additional text.
  `

  try {
    const priceRange = await generateText(prompt, {
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 20, // Very short response needed
    })

    // If we got no response from OpenAI, use the fallback
    if (!priceRange) {
      return generateFallbackPrice(description)
    }

    // Clean up the response to ensure it's just a price range
    const cleanedPrice = priceRange.replace(/[^$0-9\-\s.]/g, "").trim()

    // If we got a valid-looking price range, return it
    if (/\$\d+\s*-\s*\$\d+/.test(cleanedPrice)) {
      return cleanedPrice
    }

    // If we just got a single price, convert to a range
    if (/\$\d+/.test(cleanedPrice)) {
      const price = Number.parseFloat(cleanedPrice.replace(/[^0-9.]/g, ""))
      const min = Math.floor(price * 0.9)
      const max = Math.ceil(price * 1.1)
      return `$${min}-$${max}`
    }

    // Fallback
    return generateFallbackPrice(description)
  } catch (error) {
    console.error("Error generating price estimate with OpenAI:", error)
    return generateFallbackPrice(description)
  }
}

/**
 * Generates a fallback price estimate based on description length and keywords
 * @param description Item description
 * @returns Estimated price range
 */
function generateFallbackPrice(description: string): string {
  const text = description.toLowerCase()

  // Base price factors
  let baseMin = 15
  let baseMax = 50

  // Adjust based on description length
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length > 20) {
    baseMin += 20
    baseMax += 100
  } else if (words.length > 10) {
    baseMin += 10
    baseMax += 50
  }

  // Check for premium keywords
  const premiumKeywords = [
    "vintage",
    "antique",
    "rare",
    "limited",
    "edition",
    "collector",
    "brand new",
    "unopened",
    "sealed",
    "mint",
    "perfect",
    "excellent",
    "designer",
    "luxury",
    "premium",
    "high-end",
    "professional",
  ]

  let premiumCount = 0
  premiumKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      premiumCount++
    }
  })

  // Adjust for premium items
  if (premiumCount > 3) {
    baseMin *= 3
    baseMax *= 4
  } else if (premiumCount > 0) {
    baseMin *= 1.5
    baseMax *= 2
  }

  // Add some randomness
  const min = Math.floor(baseMin + Math.random() * 20)
  const max = Math.floor(baseMax + min + Math.random() * 100)

  return `$${min}-$${max}`
}

/**
 * Generates a product description using OpenAI
 * @param title Item title
 * @param condition Item condition
 * @param extraDetails Additional details
 * @returns Generated description
 */
export async function generateProductDescription(title: string, condition: string, extraDetails = ""): Promise<string> {
  const prompt = `
    Write a compelling, detailed product description for an online marketplace listing with the following details:
    
    Title: ${title}
    Condition: ${condition}
    Additional Details: ${extraDetails}
    
    The description should be 3-4 paragraphs, highlighting the item's features, condition, and benefits.
    Use a professional, engaging tone that would appeal to potential buyers.
  `

  try {
    const description = await generateText(prompt, {
      temperature: 0.7,
      max_tokens: 500,
    })

    // If we got no response from OpenAI, use the fallback
    if (!description) {
      return generateFallbackDescription(title, condition, extraDetails)
    }

    return description
  } catch (error) {
    console.error("Error generating product description with OpenAI:", error)
    return generateFallbackDescription(title, condition, extraDetails)
  }
}

/**
 * Generates a fallback description when OpenAI is unavailable
 */
function generateFallbackDescription(title = "", condition = "", extraDetails = ""): string {
  return `
    ${title}
    
    This item is in ${condition || "used"} condition. ${extraDetails}
    
    Please contact the seller for more information about this item.
  `.trim()
}

/**
 * Generates an optimized title for a marketplace listing
 * @param description Item description
 * @param platform Platform (e.g., "eBay", "Facebook Marketplace")
 * @returns Optimized title
 */
export async function generateOptimizedTitle(description: string, platform = "eBay"): Promise<string> {
  const prompt = `
    Create an optimized product title for ${platform} based on this description:
    
    ${description}
    
    The title should:
    - Be under 80 characters
    - Include key product details (brand, model, size, color, etc.)
    - Use popular search keywords
    - NOT use all caps
    - NOT include excessive punctuation
    
    Return ONLY the title, nothing else.
  `

  try {
    const title = await generateText(prompt, {
      temperature: 0.3,
      max_tokens: 60,
    })

    // If we got no response from OpenAI, use the fallback
    if (!title) {
      return generateFallbackTitle(description)
    }

    // Ensure the title isn't too long
    return title.slice(0, 80)
  } catch (error) {
    console.error("Error generating optimized title with OpenAI:", error)
    return generateFallbackTitle(description)
  }
}

/**
 * Generates a fallback title when OpenAI is unavailable
 */
function generateFallbackTitle(description: string): string {
  // Create a simple title from the first few words
  const words = description.split(/\s+/).filter(Boolean)
  return words.slice(0, 6).join(" ")
}
