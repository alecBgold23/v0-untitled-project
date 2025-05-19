/**
 * Checks if the OpenAI API key is configured
 * @returns Boolean indicating if the key is configured
 */
export function hasOpenAIKey(): boolean {
  const key = getOpenAIKey()
  return !!key
}

/**
 * Gets the OpenAI API key from environment variables
 * @returns The OpenAI API key or null if not configured
 */
export function getOpenAIKey(): string | null {
  // Try the pricing-specific key first
  const pricingKey = process.env.PRICING_OPENAI_API_KEY
  if (pricingKey && pricingKey.trim() !== "") {
    return pricingKey.trim()
  }

  // Fall back to the general key
  const generalKey = process.env.OPENAI_API_KEY
  if (generalKey && generalKey.trim() !== "") {
    return generalKey.trim()
  }

  return null
}
