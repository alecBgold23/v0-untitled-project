import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth"

// Add this to window object for TypeScript
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null
    recaptchaWidgetId: string | number | null
  }
}

interface SendVerificationCodeResult {
  success: boolean
  confirmationResult?: ConfirmationResult
  error?: string
}

interface VerifyCodeResult {
  success: boolean
  error?: string
}

/**
 * Sets up the reCAPTCHA verifier
 * @param containerId The ID of the container element for reCAPTCHA
 * @returns True if setup was successful, false otherwise
 */
export function setupRecaptcha(containerId = "recaptcha-container"): boolean {
  // Clear any existing recaptcha
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear()
    window.recaptchaVerifier = null
  }

  try {
    // Create new recaptcha verifier
    window.recaptchaVerifier = new RecaptchaVerifier(
      containerId,
      {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        "expired-callback": () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear()
            window.recaptchaVerifier = null
          }
        },
      },
      auth,
    )
    return true
  } catch (error) {
    console.error("Error setting up reCAPTCHA:", error)
    return false
  }
}

/**
 * Formats a phone number to ensure it has a country code
 * @param phoneNumber The phone number to format
 * @returns The formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Ensure phone number has country code
  if (!phoneNumber.startsWith("+")) {
    // Default to US if no country code
    return `+1${phoneNumber.replace(/\D/g, "")}`
  }
  return phoneNumber
}

/**
 * Sends a verification code to the provided phone number
 * @param phoneNumber The phone number to send the code to
 * @param containerId The ID of the container element for reCAPTCHA
 * @returns An object with the result of the operation
 */
export async function sendVerificationCode(
  phoneNumber: string,
  containerId = "recaptcha-container",
): Promise<SendVerificationCodeResult> {
  // Basic validation
  if (!phoneNumber || phoneNumber.trim() === "") {
    return { success: false, error: "Please enter a valid phone number" }
  }

  try {
    // Set up reCAPTCHA
    if (!setupRecaptcha(containerId)) {
      return { success: false, error: "Failed to set up verification. Please refresh and try again." }
    }

    const appVerifier = window.recaptchaVerifier!
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber)

    // Send verification code
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier)
    return { success: true, confirmationResult }
  } catch (error: any) {
    console.error("Send code error:", error)

    // Reset reCAPTCHA on error
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
      window.recaptchaVerifier = null
    }

    return { success: false, error: error.message || "Failed to send verification code" }
  }
}

/**
 * Verifies a code with the provided confirmation result
 * @param confirmationResult The confirmation result from sending the code
 * @param code The verification code to verify
 * @returns An object with the result of the operation
 */
export async function verifyCode(confirmationResult: ConfirmationResult, code: string): Promise<VerifyCodeResult> {
  // Basic validation
  if (!code || code.length !== 6) {
    return { success: false, error: "Please enter a valid 6-digit code" }
  }

  try {
    await confirmationResult.confirm(code)
    return { success: true }
  } catch (error: any) {
    console.error("Verification error:", error)
    return { success: false, error: error.message || "Invalid verification code" }
  }
}

/**
 * Cleans up the reCAPTCHA verifier
 */
export function cleanupRecaptcha(): void {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear()
    window.recaptchaVerifier = null
  }
}
