"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Loader2, AlertCircle, Shield, RefreshCw, X } from "lucide-react"
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
  const [codeInputs, setCodeInputs] = useState(["", "", "", "", "", ""])
  const [focusedInput, setFocusedInput] = useState<number | null>(null)

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
  useEffect(() => {
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
  }, [codeSent, timeLeft])

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

  // Handle input change for code inputs
  const handleCodeInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newCodeInputs = [...codeInputs]
    newCodeInputs[index] = value
    setCodeInputs(newCodeInputs)

    // Auto-focus next input if this one is filled
    if (value && index < 5) {
      setFocusedInput(index + 1)
    }

    // Combine all inputs for the verification code
    setCode(newCodeInputs.join(""))

    // Clear error when typing
    if (error) setError("")
  }

  // Handle backspace in code inputs
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!codeInputs[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        setFocusedInput(index - 1)
      }
    }
  }

  // Focus the input when focusedInput changes
  useEffect(() => {
    if (focusedInput !== null) {
      const inputElement = document.getElementById(`code-input-${focusedInput}`)
      if (inputElement) {
        inputElement.focus()
      }
    }
  }, [focusedInput])

  // Verify code
  const verifyCode = async () => {
    // Combine code inputs
    const combinedCode = codeInputs.join("")

    if (combinedCode.length !== 6) {
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
        body: JSON.stringify({ phoneNumber, code: combinedCode }),
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
      setCodeInputs(["", "", "", "", "", ""])
      // Focus on the first input
      setFocusedInput(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Send code automatically when component mounts
  useEffect(() => {
    if (!codeSent && phoneNumber) {
      sendVerificationCode()
    }
  }, [])

  // Demo mode for testing without Twilio
  const handleDemoVerification = () => {
    const combinedCode = codeInputs.join("")
    if (combinedCode === "123456") {
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
      <div className="bg-gradient-to-r from-[#0ea5e9]/5 via-[#6366f1]/5 to-[#8b5cf6]/5 rounded-xl overflow-hidden border border-[#e2e8f0] dark:border-gray-700">
        <div className="p-6 border-b border-[#e2e8f0] dark:border-gray-700 bg-gradient-to-r from-[#0ea5e9]/10 via-[#6366f1]/10 to-[#8b5cf6]/10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">Phone Verified</h2>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Your phone number has been verified!</p>
        </div>
        <div className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-[2px]">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#0ea5e9]/10 via-[#6366f1]/10 to-[#8b5cf6]/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-[#6366f1]" />
            </div>
            <p className="text-center text-muted-foreground mb-6">
              Thank you for verifying your phone number. You can now continue.
            </p>
            <Button
              onClick={onVerified}
              className="bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] hover:from-[#0ea5e9]/90 hover:via-[#6366f1]/90 hover:to-[#8b5cf6]/90 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  return (
    <div className="bg-gradient-to-r from-[#0ea5e9]/5 via-[#6366f1]/5 to-[#8b5cf6]/5 rounded-xl overflow-hidden border border-[#e2e8f0] dark:border-gray-700">
      <div className="p-6 border-b border-[#e2e8f0] dark:border-gray-700 bg-gradient-to-r from-[#0ea5e9]/10 via-[#6366f1]/10 to-[#8b5cf6]/10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">Phone Verification</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          {codeSent
            ? `We've sent a verification code to ${displayPhone}`
            : "We'll send a verification code to your phone"}
        </p>
      </div>
      <div className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-[2px]">
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-center items-center mb-2">
              <Shield className="h-5 w-5 text-[#6366f1] mr-2" />
              <span className="text-sm font-medium">Enter verification code</span>
            </div>

            <div className="flex justify-center gap-2">
              {codeInputs.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => setFocusedInput(index)}
                  className="w-10 h-12 text-center text-lg font-medium p-0 border-[#e2e8f0] dark:border-gray-700 focus-visible:ring-[#6366f1] focus-visible:border-[#6366f1] bg-white dark:bg-gray-900"
                />
              ))}
            </div>

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
                        setCodeInputs(["", "", "", "", "", ""])
                        setFocusedInput(0)
                        sendVerificationCode()
                      }}
                      className="text-[#6366f1] hover:text-[#4f46e5] flex items-center"
                      disabled={isSending}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Resend code
                    </button>
                  )}
                </div>

                {resendDisabled && (
                  <Progress
                    value={progress}
                    className="h-1 w-full bg-gray-200 dark:bg-gray-700"
                    indicatorClassName="bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6]"
                  />
                )}
              </div>
            )}
          </div>

          {!codeSent && (
            <Button
              className="w-full bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] hover:from-[#0ea5e9]/90 hover:via-[#6366f1]/90 hover:to-[#8b5cf6]/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
              onClick={sendVerificationCode}
              disabled={isSending}
            >
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

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-[#e2e8f0] dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground shadow-sm hover:bg-muted/50 transition-all duration-300"
          >
            Cancel
          </Button>
          <Button
            onClick={isDemoMode ? handleDemoVerification : verifyCode}
            disabled={isLoading || codeInputs.some((input) => !input)}
            className="bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] hover:from-[#0ea5e9]/90 hover:via-[#6366f1]/90 hover:to-[#8b5cf6]/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
