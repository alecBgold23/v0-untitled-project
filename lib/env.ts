/**
 * Gets the OpenAI API key from environment variables
 * Tries PRICING_OPENAI_API_KEY first, then falls back to OPENAI_API_KEY
 */
export function getOpenAIKey(): string {
  // Try to get the pricing-specific OpenAI API key first
  const pricingKey = process.env.PRICING_OPENAI_API_KEY?.trim()
  if (pricingKey) {
    return pricingKey
  }

  // Fall back to the general OpenAI API key
  const generalKey = process.env.OPENAI_API_KEY?.trim()
  if (generalKey) {
    return generalKey
  }

  return ""
}

/**
 * Checks if an OpenAI API key is configured
 */
export function hasOpenAIKey(): boolean {
  return !!getOpenAIKey()
}
