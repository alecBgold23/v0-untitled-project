/**
 * Tests if the pricing OpenAI API key is valid
 * @returns Promise<boolean> indicating if the key is valid
 */
export async function isPricingKeyValid(): Promise<boolean> {
  try {
    const response = await fetch("/api/check-pricing-key")
    const data = await response.json()
    return data.valid === true
  } catch (error) {
    console.error("Error checking pricing key:", error)
    return false
  }
}
