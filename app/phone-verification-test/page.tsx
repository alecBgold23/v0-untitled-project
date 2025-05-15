"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SMSVerificationFlow } from "@/components/sms-verification-flow"

export default function PhoneVerificationTestPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showVerification, setShowVerification] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const handleStartVerification = () => {
    if (!phoneNumber) return
    setShowVerification(true)
  }

  const handleVerified = () => {
    setIsVerified(true)
    setShowVerification(false)
  }

  const handleCancel = () => {
    setShowVerification(false)
  }

  const handleReset = () => {
    setIsVerified(false)
    setPhoneNumber("")
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Phone Verification Test</CardTitle>
          <CardDescription>Test the Twilio phone verification integration</CardDescription>
        </CardHeader>
        <CardContent>
          {!showVerification && !isVerified && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Enter your phone number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 555-5555"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Enter phone number in E.164 format (e.g., +12125551234)</p>
              </div>
            </div>
          )}

          {showVerification && (
            <SMSVerificationFlow phoneNumber={phoneNumber} onVerified={handleVerified} onCancel={handleCancel} />
          )}

          {isVerified && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600 dark:text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-center text-lg font-medium">Phone Verified Successfully!</p>
              <p className="text-center text-muted-foreground">Your phone number has been successfully verified.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {!showVerification && !isVerified && (
            <Button onClick={handleStartVerification} disabled={!phoneNumber}>
              Start Verification
            </Button>
          )}
          {isVerified && <Button onClick={handleReset}>Test Another Number</Button>}
        </CardFooter>
      </Card>
    </div>
  )
}
