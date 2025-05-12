"use client"

import { useState } from "react"
import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// Add this to window object for TypeScript
declare global {
  interface Window {
    recaptchaVerifier: any
  }
}

export default function PhoneVerification() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
        },
        auth,
      )
    }
  }

  const handleSendCode = async () => {
    setIsLoading(true)
    setMessage("")

    // Basic validation
    if (!phoneNumber || phoneNumber.trim() === "") {
      setMessage("Please enter a valid phone number")
      setIsLoading(false)
      return
    }

    try {
      setupRecaptcha()
      const appVerifier = window.recaptchaVerifier

      // Format phone number if needed
      const formattedPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber.replace(/\D/g, "")}`

      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier)
      setConfirmationResult(result)
      setMessage("Verification code sent! Check your phone.")
    } catch (error: any) {
      console.error("Send code error:", error)
      setMessage(`Failed to send code: ${error.message || "Unknown error"}`)

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
      setMessage("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      await confirmationResult.confirm(code)
      setMessage("Phone number verified successfully!")
      setIsVerified(true)
    } catch (error: any) {
      console.error("Verification error:", error)
      setMessage(`Invalid code: ${error.message || "Please try again"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-gradient-to-r from-[#0ea5e9]/20 via-[#6366f1]/20 to-[#8b5cf6]/20">
        <CardTitle className="text-xl text-center">Phone Verification</CardTitle>
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
              <p className="text-xs text-gray-500">Include country code (e.g., +1 for US)</p>
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
                <Button variant="outline" onClick={handleSendCode} disabled={isLoading} className="w-full mt-2">
                  Resend Code
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-green-600 text-xl font-medium mb-2">✓ Verification Complete</div>
            <p>Your phone number has been successfully verified.</p>
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.includes("success") || message.includes("sent")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </CardContent>
    </Card>
  )
}
