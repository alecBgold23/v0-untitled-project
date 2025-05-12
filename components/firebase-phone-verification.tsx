"use client"

import { useState, useEffect, useRef } from "react"
import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"

// Add this to window object for TypeScript
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null
    recaptchaWidgetId: string | number | null
  }
}

interface FirebasePhoneVerificationProps {
  onVerificationComplete?: (phoneNumber: string) => void
  onCancel?: () => void
  initialPhoneNumber?: string
}

export default function FirebasePhoneVerification({
  onVerificationComplete,
  onCancel,
  initialPhoneNumber = "",
}: FirebasePhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [code, setCode] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(0)

  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up recaptcha on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      timerRef.current = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [resendCountdown])

  const setupRecaptcha = () => {
    // Clear any existing recaptcha
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
      window.recaptchaVerifier = null
    }

    try {
      // Create new recaptcha verifier
      window.recaptchaVerifier = new RecaptchaVerifier(
        recaptchaContainerRef.current!,
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
          "expired-callback": () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            setError("reCAPTCHA expired. Please try again.")
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear()
              window.recaptchaVerifier = null
            }
          },
        },
        auth,
      )
    } catch (error) {
      console.error("Error setting up reCAPTCHA:", error)
      setError("Failed to set up verification. Please refresh and try again.")
      return false
    }

    return true
  }

  const formatPhoneNumber = (input: string) => {
    // Ensure phone number has country code
    if (!input.startsWith("+")) {
      // Default to US if no country code
      return `+1${input.replace(/\D/g, "")}`
    }
    return input
  }

  const handleSendCode = async () => {
    setIsLoading(true)
    setMessage("")
    setError(null)

    // Basic validation
    if (!phoneNumber || phoneNumber.trim() === "") {
      setError("Please enter a valid phone number")
      setIsLoading(false)
      return
    }

    try {
      // Set up reCAPTCHA
      if (!setupRecaptcha()) {
        setIsLoading(false)
        return
      }

      const appVerifier = window.recaptchaVerifier!
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber)

      // Send verification code
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier)
      setConfirmationResult(result)
      setMessage("Verification code sent! Check your phone.")
      setResendCountdown(60) // 60 second countdown for resend
    } catch (error: any) {
      console.error("Send code error:", error)
      setError(`Failed to send code: ${error.message || "Unknown error"}`)

      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)
    setMessage("")
    setError(null)

    try {
      await confirmationResult!.confirm(code)
      setMessage("Phone number verified successfully!")
      setIsVerified(true)

      // Call the completion callback if provided
      if (onVerificationComplete) {
        onVerificationComplete(formatPhoneNumber(phoneNumber))
      }
    } catch (error: any) {
      console.error("Verification error:", error)
      setError(`Invalid code: ${error.message || "Please try again"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.length === 6 && confirmationResult) {
      handleVerifyCode()
    }
  }, [code])

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-[#0ea5e9]/20 via-[#6366f1]/20 to-[#8b5cf6]/20 rounded-t-lg">
        <CardTitle className="text-xl text-center">Phone Verification</CardTitle>
        <CardDescription className="text-center">
          {!confirmationResult
            ? "We'll send a verification code to your phone"
            : "Enter the 6-digit code sent to your phone"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {!isVerified ? (
          <>
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 555-123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading || confirmationResult !== null}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
            </div>

            {confirmationResult && (
              <div className="space-y-2 mt-4">
                <label htmlFor="verificationCode" className="block text-sm font-medium">
                  Verification Code
                </label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  disabled={isLoading}
                  className="w-full text-center text-lg tracking-wider"
                  autoFocus
                />
              </div>
            )}

            <div className="flex flex-col gap-2 mt-4">
              {!confirmationResult ? (
                <Button onClick={handleSendCode} disabled={isLoading || !phoneNumber} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              ) : (
                <Button onClick={handleVerifyCode} disabled={isLoading || code.length !== 6} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              )}

              {confirmationResult && (
                <Button
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={isLoading || resendCountdown > 0}
                  className="w-full mt-2"
                >
                  {resendCountdown > 0 ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend in {resendCountdown}s
                    </>
                  ) : (
                    "Resend Code"
                  )}
                </Button>
              )}

              {onCancel && (
                <Button variant="ghost" onClick={handleCancel} disabled={isLoading} className="w-full mt-2">
                  Cancel
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <div className="text-xl font-medium mb-2">Verification Complete</div>
            <p className="text-muted-foreground">Your phone number has been successfully verified.</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm">{message}</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Invisible reCAPTCHA container */}
        <div ref={recaptchaContainerRef} id="recaptcha-container"></div>
      </CardContent>
    </Card>
  )
}
