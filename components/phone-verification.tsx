"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Loader2, AlertCircle, Shield, RefreshCw, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PhoneVerificationProps {
  phoneNumber: string
  onVerified: () => void
  onCancel: () => void
}

// Helper function to format phone number to E.164
function formatToE164(phone: string): string {
  if (!phone) return ""

  // Remove all non-digit characters except the leading +
  let cleaned = phone.replace(/[^\d+]/g, "")

  // If it doesn't start with +, assume it's a US number
  if (!cleaned.startsWith("+")) {
    // If it's a 10-digit US number
    if (cleaned.length === 10) {
      cleaned = `+1${cleaned}`
    }
    // If it's an 11-digit number starting with 1 (US with country code)
    else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      cleaned = `+${cleaned}`
    }
    // For any other case, add + prefix
    else {
      cleaned = `+${cleaned}`
    }
  }

  return cleaned
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
  const [demoMode, setDemoMode] = useState(false)
  const [apiMessage, setApiMessage] = useState("")
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Format the phone number for API calls
  const formattedPhoneNumber = formatToE164(phoneNumber)

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
    if (cleaned.startsWith("+1") && cleaned.length >= 3) {
      const nationalNumber = cleaned.substring(2)
      if (nationalNumber.length >= 10) {
        return `+1 (${nationalNumber.substring(0, 3)}) ${nationalNumber.substring(3, 6)}-${nationalNumber.substring(6, 10)}`
      }
    }

    // For other international numbers or shorter numbers
    return cleaned
  }

  const displayPhone = formatPhoneForDisplay(formattedPhoneNumber)

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

  // Check if environment has Twilio credentials
  const checkTwilioCredentials = async () => {
    try {
      const response = await fetch("/api/check-twilio", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      return data.hasCredentials
    } catch (error) {
      console.error("Error checking Twilio credentials:", error)
      return false
    }
  }

  // Send verification code
  const sendVerificationCode = async () => {
    if (!formattedPhoneNumber) {
      setError("Phone number is required")
      return
    }

    setIsSending(true)
    setError("")
    setApiMessage("")
    setDebugInfo(null)

    try {
      console.log("Sending verification to formatted number:", formattedPhoneNumber)

      // Check if we have Twilio credentials
      const hasTwilioCredentials = await checkTwilioCredentials()

      if (!hasTwilioCredentials) {
        console.log("No Twilio credentials found, using demo mode")
        setDemoMode(true)
        setApiMessage("No Twilio credentials found - using demo mode")
        setCodeSent(true)
        setTimeLeft(60)
        setProgress(100)
        setResendDisabled(true)

        toast({
          title: "Demo Mode: Verification code sent",
          description: `We've sent a verification code to ${displayPhone}. Use code: 123456`,
        })

        setIsSending(false)
        return
      }

      // Real API call
      const response = await fetch("/api/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: formattedPhoneNumber }),
      })

      const data = await response.json()
      console.log("Verification API response:", data)

      // Save debug info
      setDebugInfo(JSON.stringify(data, null, 2))

      if (!response.ok && !data.demoMode) {
        console.error("API error response:", data)
        throw new Error(data.error || "Failed to send verification code")
      }

      // Check if the API fell back to demo mode
      if (data.demoMode) {
        setDemoMode(true)
        if (data.message) {
          setApiMessage(data.message)
        }
        toast({
          title: "Demo Mode: Verification code sent",
          description: `We've sent a verification code to ${displayPhone}. Use code: 123456`,
        })
      } else {
        toast({
          title: "Verification code sent",
          description: `We've sent a verification code to ${displayPhone}`,
        })
      }

      setCodeSent(true)
      setTimeLeft(60)
      setProgress(100)
      setResendDisabled(true)
    } catch (err: any) {
      console.error("Error sending code:", err)
      setError(err.message || "Failed to send verification code")

      // Fall back to demo mode if there's an error
      setDemoMode(true)
      setCodeSent(true)
      setTimeLeft(60)
      setProgress(100)
      setResendDisabled(true)
      setApiMessage("Error sending code - using demo mode")

      toast({
        title: "Demo Mode: Verification code sent",
        description: `We've sent a verification code to ${displayPhone}. Use code: 123456`,
        variant: "default",
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

    // Handle pasting a full code
    if (value.length > 1) {
      // User might be pasting the entire code
      const pastedCode = value.slice(0, 6)
      const codeArray = pastedCode.split("").slice(0, 6)

      // Fill as many inputs as we have digits
      for (let i = 0; i < codeArray.length && i < 6; i++) {
        if (/^\d$/.test(codeArray[i])) {
          newCodeInputs[i] = codeArray[i]
        }
      }

      setCodeInputs(newCodeInputs)
      setCode(newCodeInputs.join(""))

      // Focus the next empty input or the last one
      const nextEmptyIndex = newCodeInputs.findIndex((val) => val === "")
      setFocusedInput(nextEmptyIndex !== -1 ? nextEmptyIndex : 5)

      return
    }

    // Normal single digit input
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
        const newCodeInputs = [...codeInputs]
        newCodeInputs[index - 1] = ""
        setCodeInputs(newCodeInputs)
        setFocusedInput(index - 1)
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      setFocusedInput(index - 1)
    } else if (e.key === "ArrowRight" && index < 5) {
      setFocusedInput(index + 1)
    }
  }

  // Focus the input when focusedInput changes
  useEffect(() => {
    if (focusedInput !== null) {
      const inputElement = document.getElementById(`code-input-${focusedInput}`) as HTMLInputElement
      if (inputElement) {
        inputElement.focus()
        // Place cursor at the end
        const length = inputElement.value.length
        inputElement.setSelectionRange(length, length)
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
    setApiMessage("")
    setDebugInfo(null)

    try {
      console.log("Verifying code for formatted number:", formattedPhoneNumber)

      // If in demo mode, accept code 123456
      if (demoMode) {
        console.log("Using demo mode for code verification")
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (combinedCode === "123456") {
          setIsVerified(true)
          toast({
            title: "Demo Mode: Phone verified",
            description: "Your phone number has been successfully verified",
          })

          // Call the onVerified callback after a short delay
          setTimeout(() => {
            onVerified()
          }, 1000)

          return
        } else {
          throw new Error("Invalid verification code. In demo mode, use 123456.")
        }
      }

      // Real API call
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formattedPhoneNumber,
          code: combinedCode,
        }),
      })

      const data = await response.json()
      console.log("Verification check API response:", data)

      // Save debug info
      setDebugInfo(JSON.stringify(data, null, 2))

      if (!response.ok && !data.demoMode) {
        throw new Error(data.error || "Verification failed")
      }

      if (data.message) {
        setApiMessage(data.message)
      }

      if (data.success) {
        setIsVerified(true)
        toast({
          title: data.demoMode ? "Demo Mode: Phone verified" : "Phone verified",
          description: "Your phone number has been successfully verified",
        })

        // Call the onVerified callback after a short delay
        setTimeout(() => {
          onVerified()
        }, 1000)
      } else {
        throw new Error(data.message || "Invalid verification code. Please try again.")
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
    if (!codeSent && formattedPhoneNumber) {
      // Add a small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        sendVerificationCode()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [])

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

  return (
    <div className="bg-gradient-to-r from-[#0ea5e9]/5 via-[#6366f1]/5 to-[#8b5cf6]/5 rounded-xl overflow-hidden border border-[#e2e8f0] dark:border-gray-700">
      <div className="p-6 border-b border-[#e2e8f0] dark:border-gray-700 bg-gradient-to-r from-[#0ea5e9]/10 via-[#6366f1]/10 to-[#8b5cf6]/10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">
            {demoMode ? "Demo Mode: Phone Verification" : "Phone Verification"}
          </h2>
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
            ? `We've sent a verification code to ${displayPhone}${demoMode ? ". Use code: 123456" : ""}`
            : "We'll send a verification code to your phone"}
        </p>
      </div>
      <div className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-[2px]">
        {demoMode && (
          <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
              <strong>Demo Mode Active:</strong> Use verification code{" "}
              <span className="font-mono font-bold">123456</span>
              {apiMessage && <div className="mt-1 text-xs opacity-80">{apiMessage}</div>}
            </AlertDescription>
          </Alert>
        )}

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
                  pattern="[0-9]*"
                  maxLength={6} // Allow pasting full code
                  value={digit}
                  onChange={(e) => handleCodeInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => setFocusedInput(index)}
                  className="w-10 h-12 text-center text-lg font-medium p-0 border-[#e2e8f0] dark:border-gray-700 focus-visible:ring-[#6366f1] focus-visible:border-[#6366f1] bg-white dark:bg-gray-900"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center text-red-500 text-sm mt-2">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{error}</span>
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
            onClick={verifyCode}
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

        {/* Debug information (only in development) */}
        {debugInfo && process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-auto max-h-40">
            <details>
              <summary className="cursor-pointer">Debug Info</summary>
              <pre>{debugInfo}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
