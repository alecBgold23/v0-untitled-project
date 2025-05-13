"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SMSVerificationFlow } from "@/components/sms-verification-flow"
import { useRouter } from "next/navigation"

// Step 1: Basic Info
// Step 2: Phone Verification
// Step 3: Complete

export function MultiStepSignup() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate inputs
    if (!email || !password || !name) {
      setError("All fields are required")
      setLoading(false)
      return
    }

    try {
      // Here you would typically create the user account
      // For this example, we'll just move to the next step

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStep(2)
      toast({
        title: "Account Created",
        description: "Now let's verify your phone number",
      })
    } catch (error: any) {
      console.error("Error creating account:", error)
      setError(error.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneVerificationComplete = (verifiedPhone: string) => {
    setPhoneNumber(verifiedPhone)
    setPhoneVerified(true)
    setStep(3)

    toast({
      title: "Registration Complete",
      description: "Your account has been created and your phone number verified",
    })

    // Redirect to profile page after a short delay
    setTimeout(() => {
      router.push("/profile")
    }, 2000)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {step === 1 && "Create Your Account"}
          {step === 2 && "Verify Your Phone"}
          {step === 3 && "Registration Complete"}
        </CardTitle>
        <CardDescription>
          {step === 1 && "Enter your information to get started"}
          {step === 2 && "Add a phone number for enhanced security"}
          {step === 3 && "Your account is now ready to use"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        )}

        {step === 2 && (
          <SMSVerificationFlow onVerificationComplete={handlePhoneVerificationComplete} showCancelButton={false} />
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Registration Complete!</h3>
            <p className="text-muted-foreground mb-4">
              Your account has been created and your phone number ({phoneNumber}) has been verified.
            </p>
            <p className="text-sm text-muted-foreground">You will be redirected to your profile page shortly...</p>
          </div>
        )}
      </CardContent>

      {step === 1 && (
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">Step {step} of 3</div>
        </CardFooter>
      )}
    </Card>
  )
}
