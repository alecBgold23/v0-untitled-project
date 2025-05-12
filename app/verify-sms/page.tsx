"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SMSVerificationStep from "@/components/sms-verification-step"
import { useToast } from "@/hooks/use-toast"

export default function VerifySMSPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isVerified, setIsVerified] = useState(false)

  const handleVerificationComplete = (phoneNumber: string) => {
    setIsVerified(true)

    toast({
      title: "Verification Complete",
      description: `Phone number ${phoneNumber} has been verified successfully.`,
    })

    // In a real application, you would save this information to your database
    // and update the user's profile

    // Redirect after a short delay
    setTimeout(() => {
      router.push("/")
    }, 2000)
  }

  const handleCancel = () => {
    router.push("/")
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Phone Verification</h1>

        <SMSVerificationStep onVerificationComplete={handleVerificationComplete} onCancel={handleCancel} />

        <p className="text-sm text-muted-foreground mt-6 text-center">
          This verification helps us ensure the security of your account and enables important notifications.
        </p>
      </div>
    </div>
  )
}
