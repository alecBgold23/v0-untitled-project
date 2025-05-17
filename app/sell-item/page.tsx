"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Package,
  Sparkles,
  Info,
  Calendar,
  Phone,
  Mail,
  User,
  Check,
  X,
  ImageIcon,
  DollarSign,
} from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import { useToast } from "@/hooks/use-toast"
import ConfettiEffect from "@/components/confetti-effect"
import AddressAutocomplete from "@/components/address-autocomplete"
import { EnvDebug } from "@/components/env-debug"
import { submitSellItemToSupabase } from "../actions/submit-sell-item"
import { AIDescriptionButton } from "@/components/ai-description-button"

// Helper function to format phone number to E.164
function formatToE164(phone: string): string {
  if (!phone) return ""

  // Remove all non-digit characters except the leading +
  let cleaned = phone.replace(/[^\d+]/g, "")

  // If it doesn't start with +, assume it's a US number
  if (!cleaned.startsWith("+")) {
    // If it's a 10-digit US number
    if (cleaned.length === 10) {
      cleaned = `+1${cleaned}`
    }
    // If it's an 11-digit number starting with 1 (US with country code)
    else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      cleaned = `+${cleaned}`
    }
    // For any other case, add + prefix
    else {
      cleaned = `+${cleaned}`
    }
  }

  return cleaned
}

export default function SellItemPage() {
  const { toast } = useToast()
  const [formStep, setFormStep] = useState(1)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)

  // Form field states
  const [itemName, setItemName] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemPhotos, setItemPhotos] = useState([])
  const [itemCondition, setItemCondition] = useState("")
  const [itemIssues, setItemIssues] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Refs
  const fileInputRef = useRef(null)
  const formContainerRef = useRef(null)
  const formTopRef = useRef(null)
  const section1Ref = useRef(null)
  const section2Ref = useRef(null)
  const section3Ref = useRef(null)

  // Validate step 1 (combined item details and condition)
  useEffect(() => {
    setStep1Valid(
      itemName.trim() !== "" &&
        itemDescription.trim() !== "" &&
        itemPhotos.length >= 3 &&
        itemCondition !== "" &&
        itemIssues.trim() !== "",
    )
  }, [itemName, itemDescription, itemPhotos, itemCondition, itemIssues])

  // Validate step 2 (contact info)
  useEffect(() => {
    setStep2Valid(
      fullName.trim() !== "" &&
        email.trim() !== "" &&
        email.includes("@") &&
        phone.trim() !== "" &&
        address.trim() !== "" &&
        pickupDate !== "" &&
        termsAccepted,
    )
  }, [fullName, email, phone, address, pickupDate, termsAccepted])

  // Validation states
  const [step1Valid, setStep1Valid] = useState(false)
  const [step2Valid, setStep2Valid] = useState(false)
  const [step3Valid, setStep3Valid] = useState(false)

  const validateStep1 = () => {
    const errors = {}
    if (!itemName.trim()) {
      errors.itemName = "Item name is required"
    }
    if (!itemDescription.trim()) {
      errors.itemDescription = "Item description is required"
    }
    if (itemPhotos.length < 3) {
      errors.itemPhotos = "Please upload at least 3 photos"
    }
    if (!itemCondition) {
      errors.itemCondition = "Please select the item condition"
    }
    if (!itemIssues.trim()) {
      errors.itemIssues = "Please describe any issues or indicate 'None'"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors = {}
    if (!fullName.trim()) {
      errors.fullName = "Full name is required"
    }
    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!email.includes("@")) {
      errors.email = "Please enter a valid email address"
    }
    if (!phone.trim()) {
      errors.phone = "Phone number is required"
    }
    if (!address.trim()) {
      errors.address = "Pickup address is required"
    }
    if (!pickupDate) {
      errors.pickupDate = "Pickup date is required"
    }
    if (!termsAccepted) {
      errors.terms = "You must accept the terms to continue"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Scroll to the top of the page with smooth animation
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Scroll to specific section
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleContinueStep1 = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (validateStep1()) {
      setFormStep(2)
      setFormErrors({})
      // Scroll to the top of the page after changing step
      setTimeout(scrollToTop, 50) // Small timeout to ensure state has updated
    }
  }

  const handleFileUpload = (e) => {
    try {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        // Create file objects with preview URLs
        const newPhotos = files.map((file) => {
          // Create a safe URL for preview
          const previewUrl = URL.createObjectURL(file)
          console.log(`Created preview URL for ${file.name}:`, previewUrl)

          return {
            file,
            name: file.name,
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            size: file.size,
            type: file.type,
            previewUrl, // Store the preview URL
          }
        })

        // Add to itemPhotos
        setItemPhotos((prev) => [...prev, ...newPhotos])

        // Reset the input value to prevent duplicate uploads
        e.target.value = null

        // Show success toast
        toast({
          title: "Files Added",
          description: `Successfully added ${newPhotos.length} file${newPhotos.length > 1 ? "s" : ""}`,
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error adding files:", error)
      toast({
        title: "Error",
        description: "There was a problem adding your files. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removePhoto = (index) => {
    try {
      const newPhotos = [...itemPhotos]
      // Revoke the URL before removing the photo
      if (newPhotos[index].previewUrl) {
        URL.revokeObjectURL(newPhotos[index].previewUrl)
      }
      newPhotos.splice(index, 1)
      setItemPhotos(newPhotos)
    } catch (error) {
      console.error("Error removing photo:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (validateStep2()) {
      setIsSubmitting(true)

      try {
        // Skip phone verification and proceed directly to form submission
        await completeFormSubmission()
      } catch (error) {
        console.error("Error submitting form:", error)
        setSubmitResult({
          success: false,
          message: "An unexpected error occurred. Please try again later.",
        })
        setIsSubmitting(false)

        toast({
          title: "Error",
          description: "There was a problem submitting your form. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const ErrorMessage = ({ message }) => (
    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )

  // Get step completion status
  const getStepStatus = (step) => {
    if (formStep > step) return "complete"
    if (formStep === step) return "current"
    return "incomplete"
  }

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all created object URLs to prevent memory leaks
      itemPhotos.forEach((photo) => {
        if (photo.previewUrl) {
          URL.revokeObjectURL(photo.previewUrl)
        }
      })
    }
  }, [])

  const completeFormSubmission = async () => {
    setIsSubmitting(true)

    try {
      // Format the form data
      const formData = {
        itemName,
        itemDescription,
        itemCondition,
        itemIssues,
        fullName,
        email,
        phone: formatToE164(phone),
        address,
        pickupDate,
        photoCount: itemPhotos.length,
      }

      console.log("Submitting form data:", formData)

      // Submit to Supabase
      const result = await submitSellItemToSupabase(formData)

      console.log("Supabase submission result:", result)

      if (!result.success) {
        toast({
          title: "Submission Error",
          description: result.message || "There was a problem submitting your form. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Show success and update UI
      setFormSubmitted(true)

      // Scroll to top after submission is successful
      setTimeout(scrollToTop, 50)
      setIsSubmitting(false)

      toast({
        title: "Success!",
        description: "Your item has been submitted successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitResult({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      })
      setIsSubmitting(false)

      toast({
        title: "Error",
        description: "There was a problem submitting your form. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Debug function to check image URLs
  const debugImageUrls = () => {
    console.log(
      "Current image URLs:",
      itemPhotos.map((p) => ({ id: p.id, url: p.previewUrl })),
    )
  }

  // Call debug function when photos change
  useEffect(() => {
    debugImageUrls()
  }, [itemPhotos])

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-background to-secondary dark:from-gray-900 dark:to-gray-950"
      ref={formContainerRef}
    >
      {/* Add a ref at the top of the form for scrolling */}
      <div ref={formTopRef} className="scroll-target"></div>

      <div className="container mx-auto py-16 px-4 max-w-3xl">
        <ContentAnimation>
          {/* Professional Header */}
          <div className="text-center mb-12 relative">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-[#0ea5e9] to-transparent"></div>
              <span className="mx-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Sell with confidence
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-[#0ea5e9] to-transparent"></div>
            </div>

            <h1 className="font-semibold text-3xl md:text-4xl tracking-tight mb-4">
              <span className="bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                Sell Your Item
              </span>
            </h1>

            <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base mb-2">
              Complete the form below to get an offer for your item within 24 hours.
            </p>

            <div className="absolute -z-10 w-full h-full top-0 left-0 bg-gradient-to-r from-[#0ea5e9]/10 via-[#6366f1]/10 to-[#8b5cf6]/10 blur-3xl rounded-full opacity-70"></div>
          </div>
        </ContentAnimation>

        {!formSubmitted ? (
          <>
            {submitResult && !submitResult.success && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm">
                {submitResult.message}
              </div>
            )}

            {/* Progress Steps */}
            <ContentAnimation delay={0.2}>
              <div className="mb-8 relative">
                <div className="hidden md:flex justify-between items-center relative z-10 px-8">
                  {/* Progress line */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2"></div>
                  <div
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] -translate-y-1/2 transition-all duration-500"
                    style={{ width: formStep === 1 ? "0%" : "100%" }}
                  ></div>

                  {/* Step 1 */}
                  <div className="flex flex-col items-center relative bg-[#f8fafc] dark:bg-gray-900 px-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                        getStepStatus(1) === "complete"
                          ? "bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] text-white"
                          : getStepStatus(1) === "current"
                            ? "bg-white dark:bg-gray-800 border-2 border-[#6366f1] text-[#6366f1]"
                            : "bg-white dark:bg-gray-800 border border-muted text-muted-foreground"
                      }`}
                    >
                      {getStepStatus(1) === "complete" ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Package className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium mt-2 ${
                        getStepStatus(1) === "current"
                          ? "text-[#6366f1]"
                          : getStepStatus(1) === "complete"
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      Item Details
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center relative bg-[#f8fafc] dark:bg-gray-900 px-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                        getStepStatus(2) === "complete"
                          ? "bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] text-white"
                          : getStepStatus(2) === "current"
                            ? "bg-white dark:bg-gray-800 border-2 border-[#6366f1] text-[#6366f1]"
                            : "bg-white dark:bg-gray-800 border border-muted text-muted-foreground"
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-sm font-medium mt-2 ${
                        getStepStatus(2) === "current"
                          ? "text-[#6366f1]"
                          : getStepStatus(2) === "complete"
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      Contact Info
                    </span>
                  </div>
                </div>

                {/* Mobile progress indicator */}
                <div className="flex md:hidden justify-between items-center mb-4">
                  <div className="text-lg font-medium">
                    Step {formStep} of 2: {formStep === 1 ? "Item Details" : "Contact Info"}
                  </div>
                  <div className="text-sm text-muted-foreground">{Math.round((formStep / 2) * 100)}% Complete</div>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden mb-6 md:hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] transition-all duration-500"
                    style={{ width: `${(formStep / 2) * 100}%` }}
                  ></div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-[#e2e8f0] dark:border-gray-700 overflow-hidden transition-all duration-300 relative"
              >
                {/* Form header */}
                <div className="bg-gradient-to-r from-[#00b4ff]/50 via-[#4338ca]/50 to-[#c026d3]/50 p-6 border-b border-[#e2e8f0] dark:border-gray-700 text-center shadow-sm">
                  <div className="mb-2">
                    <Link href="/sell-multiple-items" className="text-[#6366f1] hover:underline text-sm">
                      Need to sell multiple items? Click here
                    </Link>
                  </div>
                  <h2 className="text-xl font-medium tracking-tight text-gray-800 dark:text-gray-100">
                    {formStep === 1 ? "Item Details & Condition" : "Your contact information"}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {formStep === 1
                      ? "Provide details about what you're selling and its condition"
                      : "Let us know how to reach you and arrange pickup"}
                  </p>
                </div>

                <div className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-[2px]">
                  {process.env.NODE_ENV === "development" && <EnvDebug />}
                  {formStep === 1 && (
                    <div className="space-y-6" id="section1" ref={section1Ref}>
                      <div className="transition-all duration-300">
                        <Label htmlFor="item-name" className="text-sm font-medium mb-2 block">
                          Item Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="item-name"
                          name="name"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          placeholder="e.g., Leather Sofa, Samsung TV"
                          className={`w-full border ${
                            formErrors.itemName ? "border-red-300" : "border-[#e2e8f0] dark:border-gray-700"
                          } rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-900 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50 relative z-10`}
                          required
                        />
                        {formErrors.itemName && <ErrorMessage message={formErrors.itemName} />}
                      </div>

                      <div className="transition-all duration-300">
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="item-description" className="text-sm font-medium">
                            Brief Description <span className="text-red-500">*</span>
                          </Label>
                          <div className="text-xs text-muted-foreground">{itemDescription.length} characters</div>
                        </div>
                        <div className="relative">
                          <Textarea
                            id="item-description"
                            name="description"
                            value={itemDescription}
                            onChange={(e) => setItemDescription(e.target.value)}
                            placeholder="Describe your item in detail including brand, model, size, color, etc."
                            rows={3}
                            className={`w-full border ${
                              formErrors.itemDescription ? "border-red-300" : "border-[#e2e8f0] dark:border-gray-700"
                            } rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-900 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50 relative z-10`}
                            required
                          />
                          <div className="absolute right-2 bottom-2">
                            <AIDescriptionButton
                              itemName={itemName}
                              condition={itemCondition || "used"}
                              onDescriptionGenerated={(desc) => setItemDescription(desc)}
                            />
                          </div>
                        </div>
                        {formErrors.itemDescription && <ErrorMessage message={formErrors.itemDescription} />}
                      </div>

                      <div className="transition-all duration-300">
                        <Label className="text-sm font-medium mb-2 block">
                          Item Condition <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-5 gap-1">
                          {/* Clickable condition options */}
                          <div
                            className={`flex flex-col items-center p-2 rounded-lg border ${
                              itemCondition === "like-new"
                                ? "border-[#6366f1] bg-[#6366f1]/5"
                                : "border-[#e2e8f0] dark:border-gray-700"
                            } cursor-pointer hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all duration-200 shadow-sm hover:shadow-md relative z-10`}
                            onClick={() => setItemCondition("like-new")}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                itemCondition === "like-new"
                                  ? "bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <Label htmlFor="like-new" className="text-xs font-medium cursor-pointer text-center">
                              Like New
                            </Label>
                          </div>

                          <div
                            className={`flex flex-col items-center p-2 rounded-lg border ${
                              itemCondition === "excellent"
                                ? "border-[#6366f1] bg-[#6366f1]/5"
                                : "border-[#e2e8f0] dark:border-gray-700"
                            } cursor-pointer hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all duration-200 shadow-sm hover:shadow-md relative z-10`}
                            onClick={() => setItemCondition("excellent")}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                itemCondition === "excellent"
                                  ? "bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <Label htmlFor="excellent" className="text-xs font-medium cursor-pointer text-center">
                              Excellent
                            </Label>
                          </div>

                          <div
                            className={`flex flex-col items-center p-2 rounded-lg border ${
                              itemCondition === "good"
                                ? "border-[#6366f1] bg-[#6366f1]/5"
                                : "border-[#e2e8f0] dark:border-gray-700"
                            } cursor-pointer hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all duration-200 shadow-sm hover:shadow-md relative z-10`}
                            onClick={() => setItemCondition("good")}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                itemCondition === "good"
                                  ? "bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Check className="w-4 h-4" />
                            </div>
                            <Label htmlFor="good" className="text-xs font-medium cursor-pointer text-center">
                              Good
                            </Label>
                          </div>

                          <div
                            className={`flex flex-col items-center p-2 rounded-lg border ${
                              itemCondition === "fair"
                                ? "border-[#6366f1] bg-[#6366f1]/5"
                                : "border-[#e2e8f0] dark:border-gray-700"
                            } cursor-pointer hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all duration-200 shadow-sm hover:shadow-md relative z-10`}
                            onClick={() => setItemCondition("fair")}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                itemCondition === "fair"
                                  ? "bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Info className="w-4 h-4" />
                            </div>
                            <Label htmlFor="fair" className="text-xs font-medium cursor-pointer text-center">
                              Fair
                            </Label>
                          </div>

                          <div
                            className={`flex flex-col items-center p-2 rounded-lg border ${
                              itemCondition === "poor"
                                ? "border-[#6366f1] bg-[#6366f1]/5"
                                : "border-[#e2e8f0] dark:border-gray-700"
                            } cursor-pointer hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all duration-200 shadow-sm hover:shadow-md relative z-10`}
                            onClick={() => setItemCondition("poor")}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                itemCondition === "poor"
                                  ? "bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <AlertCircle className="w-4 h-4" />
                            </div>
                            <Label htmlFor="poor" className="text-xs font-medium cursor-pointer text-center">
                              Poor
                            </Label>
                          </div>
                        </div>
                        {formErrors.itemCondition && <ErrorMessage message={formErrors.itemCondition} />}
                      </div>

                      <div className="transition-all duration-300">
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="item-issues" className="text-sm font-medium">
                            Any issues or defects? <span className="text-red-500">*</span>
                          </Label>
                          <div className="text-xs text-muted-foreground">{itemIssues.length} characters</div>
                        </div>
                        <Textarea
                          id="item-issues"
                          name="issues"
                          value={itemIssues}
                          onChange={(e) => setItemIssues(e.target.value)}
                          placeholder="Please describe any scratches, dents, missing parts, or functional issues. If none, please write 'None'."
                          rows={3}
                          className={`w-full border ${
                            formErrors.itemIssues ? "border-red-300" : "border-[#e2e8f0] dark:border-gray-700"
                          } rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-900 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50 relative z-10`}
                          required
                        />
                        {formErrors.itemIssues && <ErrorMessage message={formErrors.itemIssues} />}
                      </div>

                      <div className="transition-all duration-300">
                        <Label className="text-sm font-medium mb-2 block">
                          Item Photos <span className="text-red-500">*</span>{" "}
                          <span className="text-sm font-normal text-muted-foreground">(at least 3)</span>
                        </Label>

                        {/* Simple file upload component */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 border-[#6366f1]/40 hover:border-[#6366f1] bg-[#f8fafc] dark:bg-gray-900 hover:bg-[#6366f1]/5 shadow-sm"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <ImageIcon className="w-6 h-6 text-[#6366f1]/70" />
                            <p className="font-medium text-sm text-[#6366f1]">Click to Upload Images</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {itemPhotos.length} of 3 required (max 10)
                            </p>
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                          />
                        </div>

                        {formErrors.itemPhotos && <ErrorMessage message={formErrors.itemPhotos} />}

                        {/* Photo previews */}
                        {itemPhotos.length > 0 && (
                          <div className="mt-4">
                            <div className="flex flex-wrap gap-3">
                              {itemPhotos.map((file, index) => (
                                <div key={file.id} className="relative group">
                                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-md border border-[#e2e8f0] dark:border-gray-700 shadow-sm overflow-hidden">
                                    {file.previewUrl ? (
                                      <img
                                        src={file.previewUrl || "/placeholder.svg"}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          console.error(`Error loading image ${index}:`, e)
                                          e.currentTarget.style.display = "none"
                                          e.currentTarget.parentElement.innerHTML = `
                         <div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-8 w-8 text-gray-400">
                             <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                             <circle cx="9" cy="9" r="2"></circle>
                             <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                           </svg>
                         </div>
                       `
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                        <ImageIcon className="h-8 w-8 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-0.5 w-5 h-5 flex items-center justify-center shadow-md border border-gray-200"
                                    aria-label="Remove photo"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Upload progress indicator */}
                        <div className="flex items-center gap-1 mt-3 w-full">
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                itemPhotos.length >= 3
                                  ? "bg-green-500"
                                  : "bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6]"
                              }`}
                              style={{ width: `${Math.min(100, (itemPhotos.length / 3) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-6">
                        <button
                          type="button"
                          onClick={handleContinueStep1}
                          disabled={!step1Valid}
                          className="bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] hover:from-[#0ea5e9]/90 hover:via-[#6366f1]/90 hover:to-[#8b5cf6]/90 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
                        >
                          <span>Continue</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {formStep === 2 && (
                    <div className="space-y-6" id="section3" ref={section3Ref}>
                      <div className="transition-all duration-300">
                        <Label htmlFor="full-name" className="text-sm font-medium mb-2 flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>
                            Full Name <span className="text-red-500">*</span>
                          </span>
                        </Label>
                        <Input
                          id="full-name"
                          name="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className={`w-full border ${
                            formErrors.fullName ? "border-red-300" : "border-[#e2e8f0] dark:border-gray-700"
                          } rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-900 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50 relative z-10`}
                          required
                        />
                        {formErrors.fullName && <ErrorMessage message={formErrors.fullName} />}
                      </div>

                      <div className="transition-all duration-300">
                        <Label htmlFor="email" className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>
                            Email Address <span className="text-red-500">*</span>
                          </span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className={`w-full border ${
                            formErrors.email ? "border-red-300" : "border-[#e2e8f0] dark:border-gray-700"
                          } rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-900 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50 relative z-10`}
                          required
                        />
                        {formErrors.email && <ErrorMessage message={formErrors.email} />}
                      </div>

                      <div className="transition-all duration-300">
                        <Label htmlFor="phone" className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>
                            Phone Number <span className="text-red-500">*</span>
                          </span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(123) 456-7890"
                            className={`w-full border ${
                              formErrors.phone ? "border-red-300" : "border-[#e2e8f0] dark:border-gray-700"
                            } rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-900 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50 relative z-10`}
                            required
                          />
                        </div>
                        {formErrors.phone && <ErrorMessage message={formErrors.phone} />}
                      </div>

                      <div className="transition-all duration-300">
                        <Label htmlFor="pickup_date" className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>
                            Preferred Pickup Date <span className="text-red-500">*</span>
                          </span>
                        </Label>
                        <Input
                          id="pickup_date"
                          name="pickup_date"
                          type="date"
                          value={pickupDate}
                          onChange={(e) => {
                            setPickupDate(e.target.value)
                            // Attempt to blur the input to close any popup
                            setTimeout(() => {
                              try {
                                e.target.blur()
                              } catch (err) {
                                console.log("Could not blur date input")
                              }
                            }, 100)
                          }}
                          className={`w-full border ${
                            formErrors.pickupDate ? "border-red-300" : "border-[#e2e8f0] dark:border-gray-700"
                          } rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-900 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50 relative z-10`}
                          required
                        />
                        {formErrors.pickupDate && <ErrorMessage message={formErrors.pickupDate} />}
                      </div>

                      {/* Address Autocomplete */}
                      <div className="transition-all duration-300">
                        <AddressAutocomplete
                          value={address}
                          onChange={setAddress}
                          error={formErrors.address}
                          required={true}
                          label="Pickup Address"
                          placeholder="Start typing your address..."
                        />
                      </div>

                      {/* Show item summary in step 3 */}
                      <div className="transition-all duration-300">
                        <div className="bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-4 shadow-sm">
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#6366f1]" />
                            <span>Item Summary</span>
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Name:</span> {itemName}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium text-foreground">Condition:</span>{" "}
                                {itemCondition
                                  .split("-")
                                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(" ")}
                              </p>
                            </div>
                            <div>
                              {itemPhotos.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-foreground mb-2">Photos:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {itemPhotos.slice(0, 4).map((photo, index) => (
                                      <div key={photo.id} className="relative">
                                        <div className="w-12 h-12 rounded-md border border-[#e2e8f0] dark:border-gray-700 shadow-sm overflow-hidden">
                                          {photo.previewUrl && (
                                            <img
                                              src={photo.previewUrl || "/placeholder.svg"}
                                              alt={`Preview ${index + 1}`}
                                              className="w-full h-full object-cover"
                                              style={{ display: "block" }}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                    {itemPhotos.length > 4 && (
                                      <div className="w-12 h-12 bg-muted flex items-center justify-center rounded-md border border-[#e2e8f0] dark:border-gray-700">
                                        <span className="text-xs font-medium">+{itemPhotos.length - 4}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 transition-all duration-300">
                        <div className="p-6 rounded-lg bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="consent"
                              name="consent"
                              checked={termsAccepted}
                              onCheckedChange={setTermsAccepted}
                              className={`mt-1 border-[#6366f1] text-[#6366f1] focus-visible:ring-[#6366f1] ${formErrors.terms ? "border-red-300" : ""}`}
                              required
                            />
                            <div>
                              <Label htmlFor="consent" className="font-medium">
                                I consent to being contacted by BluBerry <span className="text-red-500">*</span>
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                By submitting this form, you agree to our{" "}
                                <Link
                                  href="/privacy-policy"
                                  className="text-[#6366f1] underline hover:text-[#4f46e5] transition-colors"
                                >
                                  Privacy Policy
                                </Link>
                                . We'll use your information to process your request and contact you about your item.
                              </p>
                              {formErrors.terms && <ErrorMessage message={formErrors.terms} />}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between mt-8">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            scrollToTop()
                            // Change form step after scroll animation starts
                            setTimeout(() => {
                              setFormStep(1)
                            }, 100)
                          }}
                          className="px-6 py-3 rounded-lg border border-[#e2e8f0] dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground shadow-sm hover:bg-muted/50 transition-all duration-300 flex items-center gap-2 font-medium"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>

                        <Button
                          type="submit"
                          disabled={!step2Valid || isSubmitting}
                          className="bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] hover:from-[#0ea5e9]/90 hover:via-[#6366f1]/90 hover:to-[#8b5cf6]/90 text-white px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                        >
                          <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:opacity-0 transition-opacity duration-300"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <span>Submit</span>
                              </>
                            )}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </ContentAnimation>
          </>
        ) : (
          <ContentAnimation>
            <ConfettiEffect trigger={formSubmitted} />
            <div className="bg-gradient-to-r from-[#00b4ff]/40 via-[#4338ca]/40 to-[#c026d3]/40 rounded-xl shadow-lg border border-[#e2e8f0] dark:border-gray-700 overflow-hidden transition-all duration-500">
              <div className="bg-gradient-to-r from-[#00b4ff]/50 via-[#4338ca]/50 to-[#c026d3]/50 p-6 border-b border-[#e2e8f0] dark:border-gray-700 shadow-sm">
                <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">Submission Received</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Thank you for your submission. We'll be in touch soon.
                </p>
              </div>

              <div className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-[2px]">
                <div className="w-20 h-20 bg-gradient-to-r from-[#0ea5e9]/10 via-[#6366f1]/10 to-[#8b5cf6]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-[#6366f1]" />
                </div>

                <h2 className="text-3xl font-light mb-4 bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                  Thank You!
                </h2>

                <div className="w-24 h-1 mx-auto mb-6 bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] rounded-full"></div>

                <p className="text-lg mb-8 text-muted-foreground max-w-xl mx-auto">
                  We've received your submission and will review your item details. You can expect to hear from us
                  within 24 hours with a price offer.
                </p>

                {/* Show submitted photos in confirmation */}
                {itemPhotos.length > 0 && (
                  <div className="bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-6 max-w-3xl mx-auto mb-8">
                    <h3 className="text-lg font-medium mb-4 text-[#6366f1]">Your Submitted Photos</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {itemPhotos.map((photo, index) => (
                        <div key={photo.id} className="relative">
                          <div className="w-full h-32 rounded-md border border-[#e2e8f0] dark:border-gray-700 shadow-sm overflow-hidden">
                            {photo.previewUrl && (
                              <img
                                src={photo.previewUrl || "/placeholder.svg"}
                                alt={`Submitted image ${index + 1}`}
                                className="w-full h-full object-cover"
                                style={{ display: "block" }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-[#f8fafc] dark:bg-gray-900 p-6 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation email to <span className="font-medium text-foreground">{email}</span> with
                    the details of your submission.
                  </p>
                </div>
              </div>
            </div>
          </ContentAnimation>
        )}
      </div>
    </div>
  )
}
