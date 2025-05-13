import { MultiStepSignup } from "@/components/auth/multi-step-signup"

export const metadata = {
  title: "Sign Up | BluBerry",
  description: "Create a new account with phone verification",
}

// Add dynamic flag to prevent static generation
export const dynamic = "force-dynamic"

export default function MultiStepSignupPage() {
  return (
    <div className="container max-w-md py-10">
      <MultiStepSignup />
    </div>
  )
}
