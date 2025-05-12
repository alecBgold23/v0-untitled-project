"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SMSVerificationStepProps {
  onVerificationComplete?: (phoneNumber: string) => void
  onCancel?: () => void
  initialPhoneNumber?: string
}

export default function SMSVerificationStep({
  onVerificationComplete,
  onCancel,
  initialPhoneNumber = "",
}: SMSVerificationStepProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [code, setCode] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const { toast } = useToast()

  // Handle countdown for resend button
  useEffect(() => {
    if (!isCodeSent || countdown <= 0) return

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, isCodeSent])

  // Reset resend button after countdown
  useEffect(() => {
    if (countdown === 0) {
      setResendDisabled(false)
    }
  }, [countdown])

  const setupRecaptcha = () => {
    try {
      // Clear any existing recaptcha verifier
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
      }

      // Create a new recaptcha verifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved!")
        },
        "expired-callback": () => {
          setError("reCAPTCHA verification expired. Please try again.")
          setIsLoading(false)
        },
      })

      return window.recaptchaVerifier
    } catch (error) {
      console.error("Error setting up reCAPTCHA:", error)
      throw error
    }
  }

  const handleSendCode = async () => {
    setError("")
    setIsLoading(true)

    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      setIsLoading(false)
      return
    }

    try {
      // Format phone number if needed
      const formattedPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber}`

      // Setup reCAPTCHA
      const appVerifier = setupRecaptcha()

      // Send verification code
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier)
      setConfirmationResult(result)
      setIsCodeSent(true)
      setResendDisabled(true)
      setCountdown(60)

      toast({
        title: "Verification code sent",
        description: `We've sent a code to ${formattedPhoneNumber}`,
      })
    } catch (error: any) {
      console.error("Send code error:", error)
      setError(error.message || "Failed to send verification code")

      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
      }

      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      await confirmationResult.confirm(code)
      setIsVerified(true)

      toast({
        title: "Success",
        description: "Phone number verified successfully!",
      })

      // Call the callback if provided
      if (onVerificationComplete) {
        onVerificationComplete(phoneNumber)
      }
    } catch (error: any) {
      console.error("Verification error:", error)
      setError(error.message || "Invalid verification code")

      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle code input change with auto-submit when complete
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    setCode(value)

    // Auto-submit when code is complete
    if (value.length === 6) {
      setTimeout(() => handleVerifyCode(), 500)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-[#0ea5e9]/20 via-[#6366f1]/20 to-[#8b5cf6]/20">
        <CardTitle className="text-xl text-center">Phone Verification</CardTitle>
        <CardDescription className="text-center">Verify your phone number with a code sent via SMS</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
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
                <div className="relative">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    We've sent a 6-digit code to {phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={handleCodeChange}
                    maxLength={6}
                    disabled={isLoading}
                    className="text-center text-lg font-medium tracking-wider"
                  />
                </div>

                {resendDisabled && countdown > 0 && (
                  <p className="text-xs text-center text-muted-foreground">Resend code in {countdown} seconds</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {!isVerified && (
          <>
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}

            {!isCodeSent ? (
              <Button onClick={handleSendCode} disabled={isLoading || !phoneNumber}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Code"
                )}
              </Button>
            ) : (
              <div className="flex gap-2 ml-auto">
                {!resendDisabled && (
                  <Button variant="outline" onClick={handleSendCode} disabled={isLoading || resendDisabled}>
                    Resend Code
                  </Button>
                )}

                <Button onClick={handleVerifyCode} disabled={isLoading || code.length !== 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {isVerified && onVerificationComplete && (
          <Button className="w-full" onClick={() => onVerificationComplete(phoneNumber)}>
            Continue
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// Add this to global.d.ts or a separate types file
declare global {
  interface Window {
    recaptchaVerifier: any
  }
}
