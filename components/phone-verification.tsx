"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, AlertCircle, Shield, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

interface PhoneVerificationProps {
  phoneNumber: string
  onVerified: () => void
  onCancel: () => void
}

export default function PhoneVerification({ phoneNumber, onVerified, onCancel }: PhoneVerificationProps) {
  const { toast } = useToast()
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [resendDisabled, setResendDisabled] = useState(true)
  const [progress, setProgress] = useState(100)

  // Format phone number for display
  const formatPhoneForDisplay = (phone: string) => {
    if (!phone) return ""

    // If it already has formatting, return as is
    if (phone.includes("(") || phone.includes(" ")) {
      return phone
    }

    // Remove all non-digit characters except the leading +
    const cleaned = phone.replace(/[^\d+]/g, "")

    // If it starts with +1 (US), format nicely
    if (cleaned.startsWith("+1") && cleaned.length >= 12) {
      return `+1 (${cleaned.substring(2, 5)}) ${cleaned.substring(5, 8)}-${cleaned.substring(8)}`
    }

    // For other international numbers or shorter numbers
    return cleaned
  }

  const displayPhone = formatPhoneForDisplay(phoneNumber)

  // Timer for resend code
  useState(() => {
    if (!codeSent) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setResendDisabled(false)
          return 0
        }
        return prev - 1
      })

      setProgress((prev) => {
        const newProgress = (timeLeft / 60) * 100
        return newProgress > 0 ? newProgress : 0
      })
    }, 1000)

    return () => clearInterval(timer)
  })

  // Send verification code
  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      setError("Phone number is required")
      return
    }

    setIsSending(true)
    setError("")

    try {
      console.log("Sending verification to:", phoneNumber)

      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      })

      const data = await response.json()
      console.log("Verification API response:", data)

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || "Failed to send verification code")
      }

      setCodeSent(true)
      setTimeLeft(60)
      setProgress(100)
      setResendDisabled(true)

      toast({
        title: "Verification code sent",
        description: `We've sent a verification code to ${displayPhone}`,
      })
    } catch (err: any) {
      console.error("Error sending code:", err)
      setError(err.message || "Failed to send verification code")
      toast({
        title: "Error",
        description: err.message || "Failed to send verification code",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Verify code
  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("Verifying code for:", phoneNumber)

      const response = await fetch("/api/check-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, code }),
      })

      const data = await response.json()
      console.log("Verification check API response:", data)

      if (!response.ok) {
        throw new Error(data.error || data.details || "Verification failed")
      }

      if (data.verified) {
        setIsVerified(true)
        toast({
          title: "Phone verified",
          description: "Your phone number has been successfully verified",
        })

        // Call the onVerified callback after a short delay
        setTimeout(() => {
          onVerified()
        }, 1500)
      } else {
        throw new Error(data.error || "Invalid verification code. Please try again.")
      }
    } catch (err: any) {
      console.error("Error verifying code:", err)
      setError(err.message || "Verification failed")
      toast({
        title: "Verification failed",
        description: err.message || "The code you entered is invalid. Please try again.",
        variant: "destructive",
      })

      // Clear the code input
      setCode("")
    } finally {
      setIsLoading(false)
    }
  }

  // Send code automatically when component mounts
  useState(() => {
    if (!codeSent && phoneNumber) {
      sendVerificationCode()
    }
  })

  // Demo mode for testing without Twilio
  const handleDemoVerification = () => {
    if (code === "123456") {
      setIsVerified(true)
      toast({
        title: "Demo mode: Phone verified",
        description: "Your phone number has been verified in demo mode",
      })
      setTimeout(() => {
        onVerified()
      }, 1500)
    } else {
      setError("Invalid code. In demo mode, use 123456.")
    }
  }

  if (isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phone Verified</CardTitle>
          <CardDescription>Your phone number has been verified!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>
            <p className="text-center text-muted-foreground">
              Thank you for verifying your phone number. You can now continue.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onVerified}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phone Verification</CardTitle>
        <CardDescription>
          {codeSent
            ? `We've sent a verification code to ${displayPhone}`
            : "We'll send a verification code to your phone"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-center items-center mb-2">
              <Shield className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium">Enter verification code</span>
            </div>

            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => {
                // Only allow numbers
                if (!/^\d*$/.test(e.target.value)) return
                setCode(e.target.value)
                // Clear error when typing
                if (error) setError("")
              }}
              placeholder="6-digit code"
              className="text-center text-lg font-medium"
            />

            {error && (
              <div className="flex items-center justify-center text-red-500 text-sm mt-2">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{error}</span>
              </div>
            )}

            {isDemoMode && (
              <div className="text-center text-amber-500 text-xs p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                Demo mode: Use code 123456 for testing
              </div>
            )}

            {codeSent && (
              <div className="text-center space-y-2 mt-2">
                <div className="flex items-center justify-center text-xs text-muted-foreground">
                  {resendDisabled ? (
                    <span>Resend code in {timeLeft}s</span>
                  ) : (
                    <button
                      onClick={() => {
                        setCode("")
                        sendVerificationCode()
                      }}
                      className="text-primary hover:text-primary/80 flex items-center"
                      disabled={isSending}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Resend code
                    </button>
                  )}
                </div>

                {resendDisabled && <Progress value={progress} className="h-1 w-full" />}
              </div>
            )}
          </div>

          {!codeSent && (
            <Button className="w-full" onClick={sendVerificationCode} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={isDemoMode ? handleDemoVerification : verifyCode} disabled={isLoading || code.length !== 6}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
