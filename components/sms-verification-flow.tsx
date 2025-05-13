"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"

interface SMSVerificationFlowProps {
  phoneNumber?: string
  onVerified?: () => void
  onCancel?: () => void
}

export function SMSVerificationFlow({
  phoneNumber = "+1 (555) 123-4567",
  onVerified = () => {},
  onCancel = () => {},
}: SMSVerificationFlowProps) {
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate verification process
    setTimeout(() => {
      setIsLoading(false)
      setIsVerified(true)

      // Call the onVerified callback after a short delay
      setTimeout(() => {
        onVerified()
      }, 1500)
    }, 2000)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Phone Verification</CardTitle>
        <CardDescription>
          {isVerified ? "Your phone number has been verified!" : `We've sent a verification code to ${phoneNumber}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isVerified ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>
            <p className="text-center text-muted-foreground">
              Thank you for verifying your phone number. You can now continue.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => {
                  // Only allow numbers
                  if (!/^\d*$/.test(e.target.value)) return
                  setVerificationCode(e.target.value)
                  if (error) setError("")
                }}
                className="text-center text-lg font-medium"
              />
              {error && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isVerified && (
          <>
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleVerify} disabled={isLoading || verificationCode.length !== 6}>
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
        )}
        {isVerified && (
          <Button className="w-full" onClick={onVerified}>
            Continue
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default SMSVerificationFlow
