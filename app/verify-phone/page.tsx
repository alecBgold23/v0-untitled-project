"use client"

import { PhoneVerification } from "@/components/auth/phone-verification"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPhonePage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Phone Verification</CardTitle>
            <CardDescription className="text-center">
              Verify your phone number to enhance account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhoneVerification />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
