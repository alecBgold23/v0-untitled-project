"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Loader2, Phone, Shield, ArrowRight, Info, X } from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import SMSVerificationFlow from "@/components/sms-verification-flow"
import PhoneInput from "@/components/phone-input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PhoneVerificationExamplesPage() {
  const { toast } = useToast()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [showVerification, setShowVerification] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const handlePhoneSubmit = (e) => {
    e.preventDefault()

    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setShowVerification(true)

      toast({
        title: "Phone number submitted",
        description: "Verification code sent",
      })
    }, 1000)
  }

  const handleVerificationComplete = () => {
    setIsVerified(true)
    setShowVerification(false)

    toast({
      title: "Verification successful",
      description: "Your phone number has been verified",
    })
  }

  const resetVerification = () => {
    setShowVerification(false)
    setIsVerified(false)
    setPhoneNumber("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] dark:from-gray-900 dark:to-gray-950 py-16 px-4">
      <ContentAnimation>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-[#0ea5e9] to-transparent"></div>
              <span className="mx-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Security Components
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-[#0ea5e9] to-transparent"></div>
            </div>

            <h1 className="font-semibold text-3xl md:text-4xl tracking-tight mb-4">
              <span className="bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                Phone Verification Examples
              </span>
            </h1>

            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Explore different implementations of phone verification for your application
            </p>
          </div>

          <Alert className="mb-8 bg-[#6366f1]/5 border-[#6366f1]/20">
            <Info className="h-4 w-4 text-[#6366f1]" />
            <AlertTitle>Developer Information</AlertTitle>
            <AlertDescription>
              These examples demonstrate different ways to implement phone verification in your application. In
              development mode, any 6-digit code will work except for codes with all the same digits (e.g., 111111).
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="basic">Basic Flow</TabsTrigger>
              <TabsTrigger value="inline">Inline Verification</TabsTrigger>
              <TabsTrigger value="modal">Modal Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Verification Flow</CardTitle>
                      <CardDescription>A standalone verification component</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SMSVerificationFlow
                        phoneNumber="+15551234567"
                        onVerified={() => {
                          toast({
                            title: "Verification successful",
                            description: "Phone number verified successfully",
                          })
                        }}
                        onCancel={() => {
                          toast({
                            title: "Verification cancelled",
                            description: "Phone verification was cancelled",
                          })
                        }}
                        standalone={true}
                      />
                    </CardContent>
                    <CardFooter>
                      <p className="text-xs text-muted-foreground">
                        This component handles the entire verification process
                      </p>
                    </CardFooter>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>How It Works</CardTitle>
                      <CardDescription>Understanding the basic verification flow</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-[#6366f1]/10 rounded-full p-2 mt-1">
                          <Phone className="h-4 w-4 text-[#6366f1]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">1. Send Code</h3>
                          <p className="text-xs text-muted-foreground">
                            A verification code is sent to the user's phone via SMS
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-[#6366f1]/10 rounded-full p-2 mt-1">
                          <Shield className="h-4 w-4 text-[#6366f1]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">2. Enter Code</h3>
                          <p className="text-xs text-muted-foreground">User enters the 6-digit code they received</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-[#6366f1]/10 rounded-full p-2 mt-1">
                          <CheckCircle className="h-4 w-4 text-[#6366f1]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">3. Verify</h3>
                          <p className="text-xs text-muted-foreground">
                            The code is verified and the process completes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Implementation Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-[#6366f1] font-medium">•</span>
                          <span>Uses Twilio Verify API for production</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#6366f1] font-medium">•</span>
                          <span>Includes countdown timer for code resending</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#6366f1] font-medium">•</span>
                          <span>Provides clear error messages</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#6366f1] font-medium">•</span>
                          <span>Accessible keyboard navigation</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inline">
              <Card>
                <CardHeader>
                  <CardTitle>Inline Verification Flow</CardTitle>
                  <CardDescription>Verification integrated into a form</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      {!showVerification && !isVerified ? (
                        <form onSubmit={handlePhoneSubmit} className="space-y-6">
                          <PhoneInput
                            value={phoneNumber}
                            onChange={setPhoneNumber}
                            label="Phone Number"
                            required={true}
                          />

                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                Verify Phone Number
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </form>
                      ) : showVerification ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Verify Your Phone</h3>
                            <Button variant="ghost" size="sm" onClick={resetVerification} className="h-8 text-xs">
                              Change Number
                            </Button>
                          </div>

                          <SMSVerificationFlow
                            phoneNumber={`+1${phoneNumber}`}
                            onVerified={handleVerificationComplete}
                            onCancel={resetVerification}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
                          </div>
                          <h3 className="text-xl font-medium mb-2">Verified!</h3>
                          <p className="text-center text-muted-foreground mb-6">
                            Your phone number has been successfully verified.
                          </p>
                          <Button onClick={resetVerification}>Verify Another Number</Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">About Inline Verification</h3>
                        <p className="text-xs text-muted-foreground">
                          Inline verification integrates the verification process directly into your form flow. This
                          approach is ideal for registration forms or profile updates where phone verification is a
                          required step.
                        </p>
                      </div>

                      <div className="bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">Implementation Tips</h3>
                        <ul className="text-xs text-muted-foreground space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-[#6366f1] font-medium">•</span>
                            <span>Use conditional rendering to show different steps</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#6366f1] font-medium">•</span>
                            <span>Provide a way to change the phone number</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#6366f1] font-medium">•</span>
                            <span>Show clear success state after verification</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#6366f1] font-medium">•</span>
                            <span>Format phone numbers consistently</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="modal">
              <Card>
                <CardHeader>
                  <CardTitle>Modal Verification Flow</CardTitle>
                  <CardDescription>Verification in a modal dialog</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <form onSubmit={handlePhoneSubmit} className="space-y-6">
                        <PhoneInput
                          value={phoneNumber}
                          onChange={setPhoneNumber}
                          label="Phone Number"
                          required={true}
                        />

                        <Button type="submit" className="w-full" disabled={isLoading || isVerified}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : isVerified ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Verified
                            </>
                          ) : (
                            <>
                              Verify Phone Number
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>

                      {isVerified && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" />
                            <div>
                              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                                Verification Complete
                              </h3>
                              <p className="text-xs text-green-700 dark:text-green-400">
                                Your phone number has been successfully verified.
                              </p>
                              <Button
                                variant="link"
                                className="text-green-700 dark:text-green-400 p-0 h-auto text-xs mt-2"
                                onClick={resetVerification}
                              >
                                Verify another number
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">About Modal Verification</h3>
                        <p className="text-xs text-muted-foreground">
                          Modal verification shows the verification process in a modal dialog, keeping the main form
                          context intact. This is useful when verification is an optional step or when you want to
                          minimize disruption to the main flow.
                        </p>
                      </div>

                      <div className="bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">Implementation Tips</h3>
                        <ul className="text-xs text-muted-foreground space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-[#6366f1] font-medium">•</span>
                            <span>Use a modal dialog component for the verification UI</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#6366f1] font-medium">•</span>
                            <span>Ensure the modal is accessible and can be closed</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#6366f1] font-medium">•</span>
                            <span>Update the main form state after verification</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#6366f1] font-medium">•</span>
                            <span>Provide clear visual indication of verification status</span>
                          </li>
                        </ul>
                      </div>

                      <Button
                        onClick={() => {
                          if (phoneNumber.length < 10) {
                            toast({
                              title: "Invalid phone number",
                              description: "Please enter a valid phone number first",
                              variant: "destructive",
                            })
                            return
                          }
                          setShowVerification(true)
                        }}
                        variant="outline"
                        className="w-full"
                        disabled={isVerified}
                      >
                        Show Modal Example
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Modal Verification Example */}
          {showVerification && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-[#e2e8f0] dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">Verify Your Phone</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowVerification(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>

                <SMSVerificationFlow
                  phoneNumber={`+1${phoneNumber}`}
                  onVerified={() => {
                    setIsVerified(true)
                    setShowVerification(false)
                    toast({
                      title: "Verification successful",
                      description: "Your phone number has been verified",
                    })
                  }}
                  onCancel={() => {
                    setShowVerification(false)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </ContentAnimation>
    </div>
  )
}
