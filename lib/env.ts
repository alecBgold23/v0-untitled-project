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

/**
 * Check if OpenAI API key is configured
 */
export function hasOpenAIKey(): boolean {
  return hasEnvVariable("OPENAI_API_KEY")
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
