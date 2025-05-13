import { PhoneVerification } from "@/components/auth/phone-verification"

export const metadata = {
  title: "Phone Verification | BluBerry",
  description: "Verify your phone number to enhance account security",
}

// Add dynamic flag to prevent static generation
export const dynamic = "force-dynamic"

export default function PhoneVerificationPage() {
  return (
    <div className="container max-w-md py-10">
      <PhoneVerification />
    </div>
  )
}
