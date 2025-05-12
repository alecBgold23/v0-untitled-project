"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import FirebasePhoneVerification from "@/components/firebase-phone-verification"
import { useToast } from "@/hooks/use-toast"

export default function VerifyPhonePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isVerified, setIsVerified] = useState(false)

  // Get the return URL from query params or default to homepage
  const returnUrl = searchParams.get("returnUrl") || "/"
  // Get the phone number from query params if available
  const phoneNumber = searchParams.get("phone") || ""

  const handleVerificationComplete = (verifiedPhone: string) => {
    setIsVerified(true)

    toast({
      title: "Verification Complete",
      description: "Your phone number has been successfully verified.",
    })

    // Redirect after a short delay to show the success message
    setTimeout(() => {
      router.push(returnUrl)
    }, 1500)
  }

  const handleCancel = () => {
    router.push(returnUrl)
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Phone Verification</h1>

        <FirebasePhoneVerification
          onVerificationComplete={handleVerificationComplete}
          onCancel={handleCancel}
          initialPhoneNumber={phoneNumber as string}
        />

        <p className="text-sm text-muted-foreground mt-6 text-center">
          This verification helps us ensure the security of your account and enables important notifications.
        </p>
      </div>
    </div>
  )
}
