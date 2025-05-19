/**
 * Gets the OpenAI API key from environment variables
 * @returns The OpenAI API key or empty string if not found
 */
export function getOpenAIKey(): string {
  // Try to get the pricing-specific key first
  const pricingKey = process.env.PRICING_OPENAI_API_KEY || ""
  if (pricingKey.trim()) {
    return pricingKey.trim()
  }

  // Fall back to the general OpenAI key
  const openaiKey = process.env.OPENAI_API_KEY || ""
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
 * Checks if an environment variable exists and is not empty
 */
export function hasEnvVariable(name: string): boolean {
  const value = process.env[name]
  return value !== undefined && value !== null && value !== ""
}

/**
 * Gets an environment variable with a fallback value
 */
export function getEnvVariable(name: string, fallback = ""): string {
  return hasEnvVariable(name) ? process.env[name]! : fallback
}

/**
 * Checks if Twilio is configured
 */
export function hasTwilioConfig(): boolean {
  return (
    hasEnvVariable("TWILIO_ACCOUNT_SID") &&
    hasEnvVariable("TWILIO_AUTH_TOKEN") &&
    hasEnvVariable("TWILIO_VERIFY_SERVICE_SID")
  )
}

/**
 * Checks if email is configured
 */
export function hasEmailConfig(): boolean {
  return hasEnvVariable("CONTACT_EMAIL") && hasEnvVariable("EMAIL_PASSWORD")
}

/**
 * Checks if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true"
}

/**
 * Checks if SMS verification should be skipped
 */
export function shouldSkipSMSVerification(): boolean {
  return process.env.NEXT_PUBLIC_SKIP_SMS_VERIFICATION === "true"
}
