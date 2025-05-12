"use client"

import { useState, useRef } from "react"
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function PhoneVerification() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Set up reCAPTCHA for Firebase phone verification
  const setUpRecaptcha = () => {
    if (!recaptchaContainerRef.current) return null

    window.recaptchaVerifier = new RecaptchaVerifier(
      recaptchaContainerRef.current,
      {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved!")
        },
      },
      auth,
    )

    return window.recaptchaVerifier
  }

  // Send verification code
  const sendVerificationCode = async () => {
    setError("")
    setIsLoading(true)

    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      setIsLoading(false)
      return
    }

    try {
      const formattedPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber}` // Default to US format if no country code

      const recaptchaVerifier = setUpRecaptcha()
      if (!recaptchaVerifier) {
        throw new Error("reCAPTCHA initialization failed")
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifier)
      setConfirmationResult(confirmation)
      setIsCodeSent(true)

      toast({
        title: "Verification code sent",
        description: `We've sent a code to ${formattedPhoneNumber}`,
      })
    } catch (error: any) {
      console.error("Error during phone authentication:", error)
      setError(error.message || "Error sending verification code")
    } finally {
      setIsLoading(false)
    }
  }

  // Verify the code entered by the user
  const verifyCode = async () => {
    setError("")
    setIsLoading(true)

    if (!verificationCode || verificationCode.length < 6) {
      setError("Please enter a valid verification code")
      setIsLoading(false)
      return
    }

    try {
      await confirmationResult.confirm(verificationCode)
      setIsVerified(true)

      toast({
        title: "Phone verified",
        description: "Your phone number has been successfully verified",
      })
    } catch (error: any) {
      console.error("Error verifying code:", error)
      setError(error.message || "Invalid verification code")
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
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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
            {!isCodeSent ? (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>
            )}
          </>
        )}

        {/* Invisible reCAPTCHA container */}
        <div ref={recaptchaContainerRef} id="recaptcha-container"></div>
      </CardContent>
      <CardFooter>
        {!isVerified && (
          <Button className="w-full" onClick={isCodeSent ? verifyCode : sendVerificationCode} disabled={isLoading}>
            {isLoading ? "Processing..." : isCodeSent ? "Verify Code" : "Send Verification Code"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// Add this to make TypeScript happy with the global recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: any
  }
}
