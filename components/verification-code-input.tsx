"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface VerificationCodeInputProps {
  onComplete: (code: string) => void
  isVerifying: boolean
  error?: string
  onResendCode: () => void
  phoneNumber: string
}

export function VerificationCodeInput({
  onComplete,
  isVerifying,
  error,
  onResendCode,
  phoneNumber,
}: VerificationCodeInputProps) {
  const [code, setCode] = useState("")
  const [resendDisabled, setResendDisabled] = useState(true)
  const [countdown, setCountdown] = useState(60)

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown <= 0) {
      setResendDisabled(false)
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown])

  const handleResendCode = () => {
    onResendCode()
    setResendDisabled(true)
    setCountdown(60)
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <Label className="text-base font-medium">Verify Your Phone Number</Label>
        <p className="text-sm text-muted-foreground mt-1">We've sent a 6-digit code to {phoneNumber}</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => {
            // Only allow numbers
            if (!/^\d*$/.test(e.target.value)) return
            setCode(e.target.value)

            // Auto-submit when code is complete
            if (e.target.value.length === 6) {
              onComplete(e.target.value)
            }
          }}
          placeholder="Enter 6-digit code"
          className="w-full max-w-xs text-center text-lg font-medium border-[#e2e8f0] dark:border-gray-700 focus:border-[#6366f1] focus:ring-[#6366f1]"
          disabled={isVerifying}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm justify-center mt-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-center mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleResendCode}
          disabled={resendDisabled || isVerifying}
          className="text-sm"
        >
          {resendDisabled ? `Resend code in ${countdown}s` : "Resend code"}
        </Button>
      </div>
    </div>
  )
}
