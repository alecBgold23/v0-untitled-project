"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, AlertCircle, Shield, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

interface SMSVerificationFlowProps {
  phoneNumber?: string
  onVerified?: () => void
  onCancel?: () => void
  standalone?: boolean
}

// Format phone number to E.164 format - robust implementation
const formatPhoneNumber = (input: string): string => {
  if (!input) return ""

  // Remove all non-digit characters except the leading +
  const cleaned = input.replace(/[^\d+]/g, "")

  // If it doesn't start with +, assume it's a US number
  if (!cleaned.startsWith("+")) {
    // If it's a 10-digit US number
    if (cleaned.length === 10) {
      return `+1${cleaned}`
    }
    // If it's an 11-digit number starting with 1 (US with country code)
    else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+${cleaned}`
    }
    // For any other case, add + prefix if missing
    else {
      return `+${cleaned}`
    }
  }

  return cleaned
}

// Use real Twilio verification instead of simulation mode
const SIMULATION_MODE = false

export function SMSVerificationFlow({
  phoneNumber = "",
  onVerified = () => {},
  onCancel = () => {},
  standalone = false,
}: SMSVerificationFlowProps) {
  const { toast } = useToast()
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [resendDisabled, setResendDisabled] = useState(true)
  const [progress, setProgress] = useState(100)
  const [focusedInput, setFocusedInput] = useState<number | null>(null)
  const [codeInputs, setCodeInputs] = useState(["", "", "", "", "", ""])
  const [simulatedCode, setSimulatedCode] = useState("")

  // Format the phone number for API calls
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber)

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

  const sendVerificationCode = async () => {
    if (!formattedPhoneNumber) {
      setError("Phone number is required")
      return
    }

    // Validate phone number format (E.164 format: +[country code][number])
    if (!formattedPhoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      console.error("Invalid phone format:", formattedPhoneNumber)
      setError("Invalid phone number format. Please enter a valid phone number.")
      return
    }

    setIsSending(true)
    setError("")

    try {
      console.log("Sending verification to formatted number:", formattedPhoneNumber)

      // Real API call with better error handling
      const response = await fetch("/api/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: formattedPhoneNumber }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("API error response:", data)
        throw new Error(data.error || "Failed to send verification code")
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
      setVerificationCode(newCodeInputs.join(""))

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
    setVerificationCode(newCodeInputs.join(""))

    // Clear error when typing
    if (error) setError("")
  }

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

  const handleVerify = async () => {
    // Combine code inputs
    const combinedCode = codeInputs.join("")

    if (combinedCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("Verifying code for phone:", formattedPhoneNumber)

      // Real API call with better error handling
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

      if (!response.ok) {
        console.error("API error response:", data)
        throw new Error(data.error || "Verification failed")
      }

      if (data.success === false) {
        throw new Error("Invalid verification code. Please try again.")
      }

      if (data.success) {
        setIsVerified(true)
        toast({
          title: "Phone verified",
          description: "Your phone number has been successfully verified",
        })

        // Call the onVerified callback after a short delay
        setTimeout(() => {
          onVerified()
        }, 1000)
      } else {
        throw new Error("Invalid verification code. Please try again.")
      }
    } catch (err: any) {
      console.error("Error verifying code:", err)
      setError(err.message || "Verification failed")
      toast({
        title: "Verification failed",
        description: err.message || "The code you entered is invalid. Please try again.",
        variant: "destructive",
      })

      // Clear the code inputs
      setCodeInputs(["", "", "", "", "", ""])
      // Focus on the first input
      setFocusedInput(0)
    } finally {
      setIsLoading(false)
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

  // Send code automatically when component mounts
  useEffect(() => {
    if (!codeSent && formattedPhoneNumber) {
      sendVerificationCode()
    }
  }, [])

  if (standalone) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phone Verification</CardTitle>
          <CardDescription>
            {isVerified
              ? "Your phone number has been verified!"
              : codeSent
                ? `We've sent a verification code to ${displayPhone}`
                : "We'll send a verification code to your phone"}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
        <CardFooter className="flex justify-between">{renderFooter()}</CardFooter>
      </Card>
    )
  }

  function renderContent() {
    if (isVerified) {
      return (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
          </div>
          <p className="text-center text-muted-foreground">
            Thank you for verifying your phone number. You can now continue.
          </p>
        </div>
      )
    }

    return (
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
                className="w-10 h-12 text-center text-lg font-medium p-0"
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
    )
  }

  function renderFooter() {
    if (isVerified) {
      return (
        <Button className="w-full" onClick={onVerified}>
          Continue
        </Button>
      )
    }

    return (
      <>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleVerify} disabled={isLoading || codeInputs.some((input) => !input)}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </>
    )
  }

  return (
    <>
      {renderContent()}
      <div className="flex justify-between mt-6">{renderFooter()}</div>
    </>
  )
}

export default SMSVerificationFlow
