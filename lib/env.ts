// Environment variable helper functions

/**
 * Check if an environment variable exists and is not empty
 */
export function hasEnvVariable(name: string): boolean {
  const value = process.env[name]
  return value !== undefined && value !== null && value !== ""
}

/**
 * Get an environment variable with a fallback value
 */
export function getEnvVariable(name: string, fallback = ""): string {
  return hasEnvVariable(name) ? process.env[name]! : fallback
}

// Check if OpenAI API key is available and appears valid
export function hasOpenAIKey(): boolean {
  const key = process.env.OPENAI_API_KEY
  // Check if key exists, has length, and starts with the expected prefix
  return !!key && key.length > 20 && (key.startsWith("sk-") || key.startsWith("org-"))
}

// Get OpenAI API key if available
export function getOpenAIKey(): string | null {
  if (hasOpenAIKey()) {
    return process.env.OPENAI_API_KEY!
  }
  return null
}

/**
 * Check if Twilio is configured
 */
export function hasTwilioConfig(): boolean {
  return (
    hasEnvVariable("TWILIO_ACCOUNT_SID") &&
    hasEnvVariable("TWILIO_AUTH_TOKEN") &&
    hasEnvVariable("TWILIO_VERIFY_SERVICE_SID")
  )
}

/**
 * Check if email is configured
 */
export function hasEmailConfig(): boolean {
  return hasEnvVariable("CONTACT_EMAIL") && hasEnvVariable("EMAIL_PASSWORD")
}

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true"
}

/**
 * Check if SMS verification should be skipped
 */
export function shouldSkipSMSVerification(): boolean {
  return process.env.NEXT_PUBLIC_SKIP_SMS_VERIFICATION === "true"
}
