/**
 * Environment variable utility functions
 */

// Validate required environment variables
export function validateEnv() {
  const requiredEnvVars = ["EMAIL_PASSWORD"]

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missingEnvVars.length > 0) {
    console.warn(`Warning: The following required environment variables are missing: ${missingEnvVars.join(", ")}`)
    return false
  }

  return true
}

// Get a server-side environment variable with type safety
export function getServerEnv(key: string, defaultValue = ""): string {
  return process.env[key] || defaultValue
}

// Get a client-side environment variable with type safety
export function getClientEnv(key: string, defaultValue = ""): string {
  // Only NEXT_PUBLIC_ variables are available on the client
  if (!key.startsWith("NEXT_PUBLIC_")) {
    console.warn(`Warning: Attempted to access non-public env var '${key}' on the client`)
    return defaultValue
  }

  return typeof window !== "undefined"
    ? (window as any).__ENV?.[key] || process.env[key] || defaultValue
    : process.env[key] || defaultValue
}

export const ENV = {
  // SMS verification settings
  NEXT_PUBLIC_SKIP_SMS_VERIFICATION: process.env.NEXT_PUBLIC_SKIP_SMS_VERIFICATION === "true",
}
