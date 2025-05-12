"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, ShieldCheck, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase"

interface SMSVerificationProps {
  onVerificationComplete?: (phoneNumber: string) => void
  onCancel?: () => void
  initialPhoneNumber?: string
  showPhoneInput?: boolean
  title?: string
  description?: string
}

export function SMSVerification({
  onVerificationComplete,
  onCancel,
  initialPhoneNumber = "",
  showPhoneInput = true,
  title = "Phone Verification",
  description = "Verify your phone number with a code sent via SMS",
}: SMSVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [verificationCode, setVerificationCode] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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
      // Skip verification in development/testing
      if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_SKIP_SMS_VERIFICATION === "true") {
        console.log("Skipping SMS verification in development mode")
        setIsCodeSent(true)
        setIsLoading(false)
        setResendDisabled(true)
        setCountdown(60)
        toast({
          title: "Development Mode",
          description: "SMS verification is skipped in development mode",
        })
        return
      }

      const formattedPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber}` // Default to US format if no country code

      // Check if auth is available
      if (!auth) {
        throw new Error("Firebase auth is not initialized")
      }

      // Create a new RecaptchaVerifier instance
      const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved!")
        },
        "expired-callback": () => {
          setError("reCAPTCHA verification expired. Please try again.")
          setIsLoading(false)
        },
      })

      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifier)
      setConfirmationResult(confirmation)
      setIsCodeSent(true)
      setResendDisabled(true)
      setCountdown(60)

      toast({
        title: "Verification code sent",
        description: `We've sent a code to ${formattedPhoneNumber}`,
      })
    } catch (error: any) {
      console.error("Error during phone authentication:", error)
      setError(error.message || "Error sending verification code")

      // Show a more user-friendly error message
      toast({
        title: "Verification Error",
        description: "We couldn't send a verification code. Please check your phone number and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verify the code entered by the user
  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      // Skip verification in development/testing
      if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_SKIP_SMS_VERIFICATION === "true") {
        console.log("Skipping SMS code verification in development mode")
        setIsVerified(true)
        setIsLoading(false)

        if (onVerificationComplete) {
          onVerificationComplete(phoneNumber)
        }

        toast({
          title: "Phone verified",
          description: "Your phone number has been successfully verified",
        })
        return
      }

      await confirmationResult.confirm(verificationCode)
      setIsVerified(true)

      toast({
        title: "Phone verified",
        description: "Your phone number has been successfully verified",
      })

      // Call the callback if provided
      if (onVerificationComplete) {
        onVerificationComplete(phoneNumber)
      }
    } catch (error: any) {
      console.error("Error verifying code:", error)
      setError(error.message || "Invalid verification code")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle code input change with auto-submit when complete
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    setVerificationCode(value)

    // Auto-submit when code is complete
    if (value.length === 6) {
      verifyCode()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-gradient-to-r from-[#0ea5e9]/20 via-[#6366f1]/20 to-[#8b5cf6]/20">
        <div className="flex items-center justify-center mb-2">
          <ShieldCheck className="h-6 w-6 text-[#6366f1]" />
        </div>
        <CardTitle className="text-xl text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
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
            {showPhoneInput && !isCodeSent && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading || isCodeSent}
                    className="pl-10"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
              </div>
            )}

            {isCodeSent && (
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
                    value={verificationCode}
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
              <Button className="w-full" onClick={sendVerificationCode} disabled={isLoading || !phoneNumber}>
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
              <div className="flex gap-2 w-full justify-end">
                {!resendDisabled && (
                  <Button variant="outline" onClick={sendVerificationCode} disabled={isLoading || resendDisabled}>
                    Resend Code
                  </Button>
                )}

                <Button onClick={verifyCode} disabled={isLoading || verificationCode.length !== 6}>
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
