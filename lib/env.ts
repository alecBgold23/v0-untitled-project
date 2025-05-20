/**
 * Gets the OpenAI API key from environment variables
 * @returns The OpenAI API key or empty string if not found
 */
export function getOpenAIKey(): string {
  // Try to get the pricing-specific key first
  const pricingKey = process.env.PRICING_OPENAI_API_KEY || ""
  if (pricingKey.trim()) {
    console.log(`Using PRICING_OPENAI_API_KEY at: ${new Date().toISOString()}`)
    return pricingKey.trim()
  }

  // Fall back to the general OpenAI key
  const openaiKey = process.env.OPENAI_API_KEY || ""
  if (openaiKey.trim()) {
    console.log(`Using OPENAI_API_KEY at: ${new Date().toISOString()}`)
  }
  return openaiKey.trim()
}

/**
 * Checks if an OpenAI API key is configured
 * @returns Boolean indicating if an OpenAI API key is available
 */
export function hasOpenAIKey(): boolean {
  return getOpenAIKey().length > 0
}

/**
 * Gets an environment variable
 * @param name The name of the environment variable
 * @param defaultValue The default value to return if the variable is not found
 * @returns The value of the environment variable or the default value
 */
export function getEnv(name: string, defaultValue = ""): string {
  const value = process.env[name] || defaultValue
  return value
}

/**
 * Checks if an environment variable is set
 * @param name The name of the environment variable
 * @returns Boolean indicating if the environment variable is set
 */
export function hasEnv(name: string): boolean {
  return !!process.env[name]
}

/**
 * Gets a boolean environment variable
 * @param name The name of the environment variable
 * @param defaultValue The default value to return if the variable is not found
 * @returns The boolean value of the environment variable
 */
export function getBoolEnv(name: string, defaultValue = false): boolean {
  const value = process.env[name]
  if (value === undefined || value === null) {
    return defaultValue
  }
  return value.toLowerCase() === "true" || value === "1"
}
