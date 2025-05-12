"use client"

import type React from "react"

import { useState } from "react"
import { SMSVerification } from "@/components/sms-verification"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle } from "lucide-react"

export default function SMSVerificationExamplePage() {
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  })
  const [isVerified, setIsVerified] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleVerificationComplete = (phoneNumber: string) => {
    setIsVerified(true)
    setUserData((prev) => ({ ...prev, phoneNumber }))
    setStep(3)

    toast({
      title: "Phone Verified",
      description: "Your phone number has been successfully verified.",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    toast({
      title: "Registration Complete",
      description: "Your account has been successfully created!",
    })

    // In a real app, you would submit the data to your backend here
    console.log("Form submitted with data:", userData)
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Account Registration</h1>

        {/* Step indicator */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step > 1 ? "bg-green-500 text-white" : step === 1 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <span className="text-xs mt-1">Basic Info</span>
          </div>

          <div className="h-0.5 flex-1 bg-gray-200 mx-2">
            <div className={`h-full bg-blue-500 transition-all ${step > 1 ? "w-full" : "w-0"}`}></div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step > 2 ? "bg-green-500 text-white" : step === 2 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span className="text-xs mt-1">Verification</span>
          </div>

          <div className="h-0.5 flex-1 bg-gray-200 mx-2">
            <div className={`h-full bg-blue-500 transition-all ${step > 2 ? "w-full" : "w-0"}`}></div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
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
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Please enter your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={userData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!userData.name || !userData.email || !userData.phoneNumber}
              >
                Continue to Verification
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <SMSVerification
            onVerificationComplete={handleVerificationComplete}
            onCancel={() => setStep(1)}
            initialPhoneNumber={userData.phoneNumber}
            title="Verify Your Phone"
            description="We'll send a verification code to confirm your phone number"
          />
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Registration</CardTitle>
              <CardDescription>Review your information and complete registration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-green-600 dark:text-green-400 text-sm">Phone number verified successfully!</p>
              </div>

              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800">{userData.name}</div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800">{userData.email}</div>
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800">{userData.phoneNumber}</div>
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
