"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Loader2, Phone, Shield, ArrowRight } from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import SMSVerificationFlow from "@/components/sms-verification-flow"

export default function SMSVerificationPage() {
  const { toast } = useToast()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [activeTab, setActiveTab] = useState("enter-phone")

  const handlePhoneSubmit = (e) => {
    e.preventDefault()

    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Format phone number if needed
    const formattedPhone = formatPhoneNumber(phoneNumber)

    setTimeout(() => {
      setIsLoading(false)
      setShowVerification(true)
      setActiveTab("verify")

      toast({
        title: "Phone number submitted",
        description: "Proceeding to verification step",
      })
    }, 1000)
  }

  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters except the leading +
    const cleaned = phone.replace(/[^\d+]/g, "")

    // Ensure it has country code
    if (!cleaned.startsWith("+")) {
      // US number formatting
      if (cleaned.length === 10) {
        return `+1${cleaned}`
      } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
        return `+${cleaned}`
      } else {
        // Default to adding + for international format
        return `+${cleaned}`
      }
    }

    return cleaned
  }

  const handleVerificationComplete = () => {
    setIsVerified(true)
    setActiveTab("success")

    toast({
      title: "Verification successful",
      description: "Your phone number has been verified",
    })
  }

  const resetProcess = () => {
    setPhoneNumber("")
    setShowVerification(false)
    setIsVerified(false)
    setActiveTab("enter-phone")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] dark:from-gray-900 dark:to-gray-950 py-16 px-4">
      <ContentAnimation>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-[#0ea5e9] to-transparent"></div>
              <span className="mx-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Security Feature
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-[#0ea5e9] to-transparent"></div>
            </div>

            <h1 className="font-semibold text-3xl tracking-tight mb-4">
              <span className="bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                Phone Verification
              </span>
            </h1>

            <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
              Secure your account with SMS verification
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="enter-phone" disabled={activeTab !== "enter-phone" && !isVerified}>
                Enter Phone
              </TabsTrigger>
              <TabsTrigger value="verify" disabled={!showVerification && activeTab !== "verify"}>
                Verify
              </TabsTrigger>
              <TabsTrigger value="success" disabled={!isVerified && activeTab !== "success"}>
                Complete
              </TabsTrigger>
            </TabsList>

            <TabsContent value="enter-phone">
              <Card>
                <CardHeader>
                  <CardTitle>Enter Your Phone Number</CardTitle>
                  <CardDescription>We'll send a verification code to this number</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePhoneSubmit}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="pl-10"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <p className="text-xs text-muted-foreground text-center">Standard message and data rates may apply</p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="verify">
              <Card>
                <CardHeader>
                  <CardTitle>Verify Your Phone</CardTitle>
                  <CardDescription>Enter the code sent to {phoneNumber}</CardDescription>
                </CardHeader>
                <CardContent>
                  <SMSVerificationFlow
                    phoneNumber={formatPhoneNumber(phoneNumber)}
                    onVerified={handleVerificationComplete}
                    onCancel={() => {
                      setActiveTab("enter-phone")
                      setShowVerification(false)
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="success">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Complete</CardTitle>
                  <CardDescription>Your phone number has been verified</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Success!</h3>
                  <p className="text-center text-muted-foreground mb-6">
                    Your phone number {phoneNumber} has been successfully verified.
                  </p>
                  <Button onClick={resetProcess}>Verify Another Number</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Shield className="h-5 w-5 text-[#6366f1]" />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Why verify your phone?</h3>
                <p className="text-xs text-muted-foreground">
                  Phone verification helps secure your account, prevent fraud, and enables important account recovery
                  features. We'll only use your phone number for security purposes and won't share it with third
                  parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ContentAnimation>
    </div>
  )
}
