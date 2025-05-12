"use client"

import { useState, useEffect } from "react"
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import "@/lib/firebase" // Make sure firebase is initialized

export function PhoneVerification() {
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [status, setStatus] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response: any) => {
            console.log("reCAPTCHA solved!")
          },
        },
        auth,
      )
    }
  }, [])

  const handleSendCode = async () => {
    setStatus("")
    setIsLoading(true)

    if (!phone || phone.length < 10) {
      setStatus("Please enter a valid phone number")
      setIsLoading(false)
      return
    }

    try {
      const auth = getAuth()
      const formattedPhoneNumber = phone.startsWith("+") ? phone : `+1${phone}` // Default to US format if no country code

      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier)
      setConfirmationResult(confirmation)
      setStatus("Code sent. Please enter it below.")
    } catch (error: any) {
      console.error("Error during phone authentication:", error)
      setStatus("Failed to send code: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setStatus("")
    setIsLoading(true)

    if (!code || code.length < 6) {
      setStatus("Please enter a valid verification code")
      setIsLoading(false)
      return
    }

    try {
      await confirmationResult.confirm(code)
      setIsVerified(true)
      setStatus("Phone number verified!")
    } catch (error: any) {
      console.error("Error verifying code:", error)
      setStatus("Invalid verification code.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Phone Verification</CardTitle>
        <CardDescription>Verify your phone number to enhance account security</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <Alert variant={status.includes("Failed") || status.includes("Invalid") ? "destructive" : "default"}>
            {status.includes("Failed") || status.includes("Invalid") ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        )}

        {isVerified ? (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Your phone number has been successfully verified!
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading || !!confirmationResult}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
            </div>

            {!confirmationResult ? (
              <Button className="w-full" onClick={handleSendCode} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
                <Button className="w-full" onClick={handleVerifyCode} disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </>
            )}
          </>
        )}

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container"></div>
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
