"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function PhoneVerification() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const auth = getAuth()

  useEffect(() => {
    // Set up reCAPTCHA verifier when component mounts
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible", // Change to 'normal' if you want the visible reCAPTCHA
        callback: (response: any) => {
          console.log("reCAPTCHA solved")
        },
      },
      auth,
    )
    window.recaptchaVerifier.render()
  }, [auth])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      setLoading(false)
      return
    }

    try {
      const formattedPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber}` // Default to US format if no country code

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        window.recaptchaVerifier, // Use the reCAPTCHA verifier created in useEffect
      )
      setConfirmationResult(confirmationResult)
      setSuccess("Verification code sent successfully")
      setLoading(false)
    } catch (error: any) {
      console.error("Error sending verification code:", error)
      setError("Failed to send verification code: " + error.message)
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!verificationCode || verificationCode.length < 6) {
      setError("Please enter a valid verification code")
      setLoading(false)
      return
    }

    try {
      await confirmationResult.confirm(verificationCode) // Confirm the verification code
      setSuccess("Phone number verified successfully")
      setLoading(false)
    } catch (error: any) {
      console.error("Error verifying code:", error)
      setError("Invalid verification code")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Phone Verification</CardTitle>
        <CardDescription>Verify your phone number to enhance account security</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container"></div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        {!confirmationResult ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending Code..." : "Send Verification Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                disabled={loading}
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

// Add this to make TypeScript happy with the global recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: any
  }
}
