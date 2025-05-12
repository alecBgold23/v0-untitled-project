"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import SMSVerificationStep from "@/components/sms-verification-step"

export default function MultiStepVerificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNextStep = () => {
    setStep(2)
  }

  const handleVerificationComplete = (phoneNumber: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber }))
    setStep(3)

    toast({
      title: "Phone Verified",
      description: "Your phone number has been successfully verified.",
    })
  }

  const handleSubmit = () => {
    // In a real application, you would submit the form data to your backend
    toast({
      title: "Registration Complete",
      description: "Your account has been created successfully!",
    })

    // Redirect to home page
    setTimeout(() => {
      router.push("/")
    }, 2000)
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

        {/* Progress indicator */}
        <div className="flex justify-between mb-8">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step > 1 ? "bg-green-500 text-white" : "bg-blue-500 text-white"
              }`}
            >
              1
            </div>
            <span className="text-xs mt-1">Info</span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-200 self-center mx-2">
            <div className={`h-full bg-blue-500 transition-all ${step > 1 ? "w-full" : "w-0"}`}></div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step > 2 ? "bg-green-500 text-white" : step === 2 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span className="text-xs mt-1">Verify</span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-200 self-center mx-2">
            <div className={`h-full bg-blue-500 transition-all ${step > 2 ? "w-full" : "w-0"}`}></div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 3 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              3
            </div>
            <span className="text-xs mt-1">Complete</span>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Enter your basic information</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                onClick={handleNextStep}
                disabled={!formData.name || !formData.email || !formData.phoneNumber}
              >
                Continue to Verification
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <SMSVerificationStep
            initialPhoneNumber={formData.phoneNumber}
            onVerificationComplete={handleVerificationComplete}
            onCancel={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Registration</CardTitle>
              <CardDescription>Review your information</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400">
                Phone number verified successfully!
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <div className="p-2 border rounded-md">{formData.name}</div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="p-2 border rounded-md">{formData.email}</div>
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="p-2 border rounded-md">{formData.phoneNumber}</div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Edit Information
              </Button>
              <Button onClick={handleSubmit}>Complete Registration</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
