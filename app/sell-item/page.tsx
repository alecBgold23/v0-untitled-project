"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  Wand2,
} from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import { sendConfirmationEmail } from "../actions/send-confirmation-email"
import { useToast } from "@/hooks/use-toast"
import ConfettiEffect from "@/components/confetti-effect"
import AddressAutocomplete from "@/components/address-autocomplete"
import { AIDescriptionButton } from "@/components/ai-description-button"

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

  // Smart description states
  const [nameSuggestion, setNameSuggestion] = useState("")
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  // Animation states
  const [animatingFiles, setAnimatingFiles] = useState([])
  const photosContainerRef = useRef(null)

  // Refs
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const formContainerRef = useRef(null)
  const formTopRef = useRef(null)
  const section1Ref = useRef(null)
  const section2Ref = useRef(null)
  const section3Ref = useRef(null)

  // Validate step 1
  useEffect(() => {
    setStep1Valid(itemName.trim() !== "" && itemDescription.trim() !== "" && itemPhotos.length >= 3)
  }, [itemName, itemDescription, itemPhotos])

  // Validate step 2
  useEffect(() => {
    setStep2Valid(itemCondition !== "" && itemIssues.trim() !== "")
  }, [itemCondition, itemIssues])

  // Validate step 3
  useEffect(() => {
    setStep3Valid(
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

  // Fetch name suggestion when user types
  useEffect(() => {
    if (itemName.trim().length < 3) {
      setNameSuggestion("")
      return
    }

    const timeout = setTimeout(() => {
      fetchNameSuggestion(itemName)
    }, 800) // wait for user to stop typing

    return () => clearTimeout(timeout)
  }, [itemName])

  const fetchNameSuggestion = async (text: string) => {
    setIsLoadingSuggestion(true)
    try {
      const res = await fetch("/api/description-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      })
      const data = await res.json()
      if (res.ok && data.suggestion) {
        setNameSuggestion(data.suggestion)
      } else {
        setNameSuggestion("")
      }
    } catch (err) {
      console.error(err)
      setNameSuggestion("")
    }
    setIsLoadingSuggestion(false)
  }

  const applySuggestion = () => {
    if (nameSuggestion) {
      setItemDescription(nameSuggestion)
      setNameSuggestion("")
      toast({
        title: "Suggestion Applied",
        description: "The enhanced description has been applied.",
        variant: "default",
      })
    }
  }

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
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors = {}
    if (!itemCondition) {
      errors.itemCondition = "Please select the item condition"
    }
    if (!itemIssues.trim()) {
      errors.itemIssues = "Please describe any issues or indicate 'None'"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep3 = () => {
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

  const handleContinueStep2 = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (validateStep2()) {
      setFormStep(3)
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
          // Create a proper object URL for the preview
          const previewUrl = URL.createObjectURL(file)

          return {
            file,
            preview: previewUrl,
            name: file.name,
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  const handleCameraCapture = (e) => {
    try {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        // Reset the input value to prevent duplicate uploads
        e.target.value = null

        const newPhotos = files.map((file) => {
          // Create a proper object URL for the preview
          const previewUrl = URL.createObjectURL(file)

          return {
            file,
            preview: previewUrl,
            name: `Camera_${new Date().toISOString()}.jpg`,
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }
        })

        // Add to itemPhotos
        setItemPhotos((prev) => [...prev, ...newPhotos])

        // Show success toast
        toast({
          title: "Photo Captured",
          description: "Your photo has been added successfully",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error capturing from camera:", error)
      toast({
        title: "Error",
        description: "There was a problem capturing your photo. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removePhoto = (index) => {
    try {
      const newPhotos = [...itemPhotos]
      // Revoke the object URL to avoid memory leaks
      if (newPhotos[index] && newPhotos[index].preview) {
        URL.revokeObjectURL(newPhotos[index].preview)
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

    if (validateStep3()) {
      setIsSubmitting(true)

      try {
        // Log form data for debugging
        console.log("Form submission data:", {
          itemName,
          itemDescription,
          itemCondition,
          itemIssues,
          fullName,
          email,
          phone,
          address,
          pickupDate,
        })

        // Send confirmation email using Resend API
        const emailResult = await sendConfirmationEmail({
          fullName,
          email,
          itemName,
          itemCondition,
          itemDescription,
          itemIssues,
          phone,
          address,
          pickupDate,
        })

        console.log("Email result:", emailResult)

        if (!emailResult.success) {
          toast({
            title: "Email Notification",
            description:
              "Your form was submitted, but there was an issue sending the confirmation email. We'll contact you soon.",
            variant: "default",
          })
        }

        // In a real implementation, you would send this to your backend
        // For now, we'll simulate a successful submission
        setTimeout(() => {
          setFormSubmitted(true)
          // Scroll to top after submission is successful
          setTimeout(scrollToTop, 50)
          setIsSubmitting(false)
        }, 1500)
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

  // Handle AI-generated description
  const handleAIDescription = (generatedDescription) => {
    setItemDescription(generatedDescription)
    toast({
      title: "Description Enhanced",
      description: "Your item description has been enhanced with AI.",
      variant: "default",
    })
  }

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all object URLs to prevent memory leaks
      itemPhotos.forEach((photo) => {
        if (photo.preview && typeof photo.preview === "string") {
          try {
            URL.revokeObjectURL(photo.preview)
          } catch (error) {
            console.error("Error revoking URL:", error)
          }
        }
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95" ref={formContainerRef}>
      {/* Add a ref at the top of the form for scrolling */}
      <div ref={formTopRef} className="scroll-target"></div>

      <div className="container mx-auto py-16 px-4 max-w-5xl">
        <ContentAnimation>
          {/* Update Header Styling to be skinnier and more professional */}
          <div className="text-center mb-12 relative">
            <h1
              className="font-normal text-4xl md:text-5xl tracking-wider mb-8"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", Helvetica, Arial, sans-serif',
                letterSpacing: "0.02em",
                textShadow: "0 0 15px rgba(99, 102, 241, 0.2)",
              }}
            >
              <span className="bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                Sell Your Item
              </span>
            </h1>
            <div className="absolute -z-10 w-full h-full top-0 left-0 bg-gradient-to-r from-[#0ea5e9]/15 via-[#6366f1]/15 to-[#8b5cf6]/15 blur-3xl rounded-full"></div>
          </div>
        </ContentAnimation>

        {!formSubmitted ? (
          <>
            {submitResult && !submitResult.success && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm">
                {submitResult.message}
              </div>
            )}

            {/* Elegant Progress Steps */}
            <ContentAnimation delay={0.2}>
              <div className="mb-12 relative">
                <div className="hidden md:flex justify-between items-center relative z-10 px-8">
                  {/* Progress line */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2"></div>
                  <div
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] -translate-y-1/2 transition-all duration-500"
                    style={{ width: formStep === 1 ? "0%" : formStep === 2 ? "50%" : "100%" }}
                  ></div>

                  {/* Step 1 */}
                  <div className="flex flex-col items-center relative bg-background px-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                        getStepStatus(1) === "complete"
                          ? "bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] text-white"
                          : getStepStatus(1) === "current"
                            ? "bg-white border-2 border-[#3b82f6] text-[#3b82f6]"
                            : "bg-white border border-muted text-muted-foreground"
                      }`}
                    >
                      {getStepStatus(1) === "complete" ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Package className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium mt-2 ${
                        getStepStatus(1) === "current"
                          ? "text-[#3b82f6]"
                          : getStepStatus(1) === "complete"
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      Item Details
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center relative bg-background px-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                        getStepStatus(2) === "complete"
                          ? "bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] text-white"
                          : getStepStatus(2) === "current"
                            ? "bg-white border-2 border-[#3b82f6] text-[#3b82f6]"
                            : "bg-white border border-muted text-muted-foreground"
                      }`}
                    >
                      {getStepStatus(2) === "complete" ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Sparkles className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium mt-2 ${
                        getStepStatus(2) === "current"
                          ? "text-[#3b82f6]"
                          : getStepStatus(2) === "complete"
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      Condition
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center relative bg-background px-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                        getStepStatus(3) === "complete"
                          ? "bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] text-white"
                          : getStepStatus(3) === "current"
                            ? "bg-white border-2 border-[#3b82f6] text-[#3b82f6]"
                            : "bg-white border border-muted text-muted-foreground"
                      }`}
                    >
                      <User className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-sm font-medium mt-2 ${
                        getStepStatus(3) === "current"
                          ? "text-[#3b82f6]"
                          : getStepStatus(3) === "complete"
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      Contact Info
                    </span>
                  </div>
                </div>

                {/* Mobile progress indicator */}
                <div className="flex md:hidden justify-between items-center mb-6">
                  <div className="text-lg font-medium">
                    Step {formStep} of 3:{" "}
                    {formStep === 1 ? "Item Details" : formStep === 2 ? "Condition" : "Contact Info"}
                  </div>
                  <div className="text-sm text-muted-foreground">{Math.round((formStep / 3) * 100)}% Complete</div>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden mb-8 md:hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] transition-all duration-500"
                    style={{ width: `${(formStep / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-border/40 overflow-hidden transition-all duration-300"
              >
                {/* Form header */}
                <div className="bg-gradient-to-r from-[#3b82f6]/10 via-[#6366f1]/10 to-[#4f46e5]/10 p-6 border-b border-border/40">
                  <h2 className="text-xl font-medium">
                    {formStep === 1
                      ? "Tell us about your item"
                      : formStep === 2
                        ? "Describe the condition"
                        : "Your contact information"}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {formStep === 1
                      ? "Provide basic details about what you're selling"
                      : formStep === 2
                        ? "Help us understand the current state of your item"
                        : "Let us know how to reach you and arrange pickup"}
                  </p>
                </div>

                <div className="p-8">
                  {formStep === 1 && (
                    <div className="space-y-8" id="section1" ref={section1Ref}>
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
                            formErrors.itemName ? "border-red-300" : "border-input"
                          } rounded-lg focus-visible:ring-[#3b82f6] bg-background shadow-sm transition-all duration-200`}
                          required
                        />
                        {formErrors.itemName && <ErrorMessage message={formErrors.itemName} />}

                        {/* Smart name suggestion */}
                        {isLoadingSuggestion && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Generating suggestion...</span>
                          </div>
                        )}

                        {nameSuggestion && (
                          <div
                            onClick={applySuggestion}
                            className="mt-3 p-3 bg-[#3b82f6]/5 border border-[#3b82f6]/20 rounded-lg cursor-pointer hover:bg-[#3b82f6]/10 transition-colors duration-200"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Wand2 className="h-4 w-4 text-[#3b82f6]" />
                              <span className="text-sm font-medium text-[#3b82f6]">Suggested Description</span>
                              <span className="text-xs bg-[#3b82f6]/10 text-[#3b82f6] px-2 py-0.5 rounded-full">
                                Click to Apply
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{nameSuggestion}</p>
                          </div>
                        )}
                      </div>

                      <div className="transition-all duration-300">
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="item-description" className="text-sm font-medium">
                            Brief Description <span className="text-red-500">*</span>
                          </Label>
                          <div className="text-xs text-muted-foreground">{itemDescription.length} characters</div>
                        </div>
                        <Textarea
                          id="item-description"
                          name="description"
                          value={itemDescription}
                          onChange={(e) => setItemDescription(e.target.value)}
                          placeholder="Describe your item with specific details similar to the suggested description (brand, model, size, color, features, etc.)"
                          rows={4}
                          className={`w-full border ${
                            formErrors.itemDescription ? "border-red-300" : "border-input"
                          } rounded-lg focus-visible:ring-[#3b82f6] bg-background shadow-sm transition-all duration-200`}
                          required
                        />
                        {formErrors.itemDescription && <ErrorMessage message={formErrors.itemDescription} />}

                        <div className="mt-2 flex justify-end">
                          <AIDescriptionButton
                            inputText={itemDescription || itemName}
                            onDescriptionGenerated={handleAIDescription}
                            className="bg-gradient-to-r from-[#3b82f6]/10 to-[#4f46e5]/10 hover:from-[#3b82f6]/20 hover:to-[#4f46e5]/20 text-[#3b82f6] border-[#3b82f6]/30"
                          />
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            <span>
                              Start typing your item name for suggestions or click "Enhance with AI" for a complete
                              description.
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="transition-all duration-300">
                        <Label className="text-sm font-medium mb-2 block">
                          Item Photos <span className="text-red-500">*</span>{" "}
                          <span className="text-sm font-normal text-muted-foreground">(at least 3)</span>
                        </Label>

                        {/* Simple file upload component */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 border-[#3b82f6]/40 hover:border-[#3b82f6] bg-muted/30 hover:bg-[#3b82f6]/5"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <ImageIcon className="w-8 h-8 text-[#3b82f6]/70" />
                            <p className="font-medium text-sm text-[#3b82f6]">Click to Upload Images</p>
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
                                  <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-md border border-border shadow-sm overflow-hidden">
                                    <img
                                      src={typeof file.preview === "string" ? file.preview : "/placeholder.svg"}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // Fallback if the preview URL is invalid
                                        e.currentTarget.src = "/placeholder.svg"
                                      }}
                                    />
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
                              className={`h-full ${itemPhotos.length >= 3 ? "bg-green-500" : "bg-[#3b82f6]"}`}
                              style={{ width: `${Math.min(100, (itemPhotos.length / 3) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-8">
                        <button
                          type="button"
                          onClick={handleContinueStep1}
                          disabled={!step1Valid}
                          className="bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] hover:from-[#2563eb] hover:to-[#4338ca] text-white px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                          <span>Continue</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {formStep === 2 && (
                    <div className="space-y-8" id="section2" ref={section2Ref}>
                      <div className="transition-all duration-300">
                        <Label className="text-sm font-medium mb-4 block">
                          Item Condition <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid md:grid-cols-5 gap-4">
                          {/* Clickable condition options */}
                          <div
                            className={`flex flex-col items-center p-4 rounded-lg border ${
                              itemCondition === "like-new" ? "border-[#3b82f6] bg-[#3b82f6]/5" : "border-input"
                            } cursor-pointer hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5 transition-all duration-200`}
                            onClick={() => setItemCondition("like-new")}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                itemCondition === "like-new"
                                  ? "bg-[#3b82f6] text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <Label htmlFor="like-new" className="font-medium cursor-pointer text-center">
                              Like New
                            </Label>
                            <p className="text-xs text-muted-foreground text-center mt-1">Appears new</p>
                          </div>

                          <div
                            className={`flex flex-col items-center p-4 rounded-lg border ${
                              itemCondition === "excellent" ? "border-[#3b82f6] bg-[#3b82f6]/5" : "border-input"
                            } cursor-pointer hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5 transition-all duration-200`}
                            onClick={() => setItemCondition("excellent")}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                itemCondition === "excellent"
                                  ? "bg-[#3b82f6] text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <Label htmlFor="excellent" className="font-medium cursor-pointer text-center">
                              Excellent
                            </Label>
                            <p className="text-xs text-muted-foreground text-center mt-1">Minimal wear</p>
                          </div>

                          <div
                            className={`flex flex-col items-center p-4 rounded-lg border ${
                              itemCondition === "good" ? "border-[#3b82f6] bg-[#3b82f6]/5" : "border-input"
                            } cursor-pointer hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5 transition-all duration-200`}
                            onClick={() => setItemCondition("good")}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                itemCondition === "good" ? "bg-[#3b82f6] text-white" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Check className="w-5 h-5" />
                            </div>
                            <Label htmlFor="good" className="font-medium cursor-pointer text-center">
                              Good
                            </Label>
                            <p className="text-xs text-muted-foreground text-center mt-1">Some wear</p>
                          </div>

                          <div
                            className={`flex flex-col items-center p-4 rounded-lg border ${
                              itemCondition === "fair" ? "border-[#3b82f6] bg-[#3b82f6]/5" : "border-input"
                            } cursor-pointer hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5 transition-all duration-200`}
                            onClick={() => setItemCondition("fair")}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                itemCondition === "fair" ? "bg-[#3b82f6] text-white" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Info className="w-5 h-5" />
                            </div>
                            <Label htmlFor="fair" className="font-medium cursor-pointer text-center">
                              Fair
                            </Label>
                            <p className="text-xs text-muted-foreground text-center mt-1">Visible wear</p>
                          </div>

                          <div
                            className={`flex flex-col items-center p-4 rounded-lg border ${
                              itemCondition === "poor" ? "border-[#3b82f6] bg-[#3b82f6]/5" : "border-input"
                            } cursor-pointer hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5 transition-all duration-200`}
                            onClick={() => setItemCondition("poor")}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                itemCondition === "poor" ? "bg-[#3b82f6] text-white" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <Label htmlFor="poor" className="font-medium cursor-pointer text-center">
                              Poor
                            </Label>
                            <p className="text-xs text-muted-foreground text-center mt-1">Needs repair</p>
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
                          rows={4}
                          className={`w-full border ${
                            formErrors.itemIssues ? "border-red-300" : "border-input"
                          } rounded-lg focus-visible:ring-[#3b82f6] bg-background shadow-sm transition-all duration-200`}
                          required
                        />
                        {formErrors.itemIssues && <ErrorMessage message={formErrors.itemIssues} />}

                        <div className="mt-2 flex justify-end">
                          <AIDescriptionButton
                            inputText={`${itemName} in ${itemCondition} condition with the following issues: ${itemIssues}`}
                            onDescriptionGenerated={(description) => setItemIssues(description)}
                            className="bg-gradient-to-r from-[#3b82f6]/10 to-[#4f46e5]/10 hover:from-[#3b82f6]/20 hover:to-[#4f46e5]/20 text-[#3b82f6] border-[#3b82f6]/30"
                          />
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
                          className="px-6 py-3 rounded-lg border border-input bg-background text-foreground shadow-sm hover:bg-muted/50 transition-all duration-300 flex items-center gap-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleContinueStep2}
                          disabled={!step2Valid}
                          className="bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] hover:from-[#2563eb] hover:to-[#4338ca] text-white px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                          <span>Continue</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {formStep === 3 && (
                    <div className="space-y-8" id="section3" ref={section3Ref}>
                      <div className="grid md:grid-cols-2 gap-8">
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
                              formErrors.fullName ? "border-red-300" : "border-input"
                            } rounded-lg focus-visible:ring-[#3b82f6] bg-background shadow-sm transition-all duration-200`}
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
                              formErrors.email ? "border-red-300" : "border-input"
                            } rounded-lg focus-visible:ring-[#3b82f6] bg-background shadow-sm transition-all duration-200`}
                            required
                          />
                          {formErrors.email && <ErrorMessage message={formErrors.email} />}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="transition-all duration-300">
                          <Label htmlFor="phone" className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>
                              Phone Number <span className="text-red-500">*</span>
                            </span>
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(123) 456-7890"
                            className={`w-full border ${
                              formErrors.phone ? "border-red-300" : "border-input"
                            } rounded-lg focus-visible:ring-[#3b82f6] bg-background shadow-sm transition-all duration-200`}
                            required
                          />
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
                            onChange={(e) => setPickupDate(e.target.value)}
                            className={`w-full border ${
                              formErrors.pickupDate ? "border-red-300" : "border-input"
                            } rounded-lg focus-visible:ring-[#3b82f6] bg-background shadow-sm transition-all duration-200`}
                            required
                          />
                          {formErrors.pickupDate && <ErrorMessage message={formErrors.pickupDate} />}
                        </div>
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
                        <div className="bg-muted/20 border border-border rounded-lg p-4">
                          <h4 className="text-sm font-medium mb-3">Item Summary</h4>
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
                                        <img
                                          src={typeof photo.preview === "string" ? photo.preview : "/placeholder.svg"}
                                          alt={`Preview ${index + 1}`}
                                          className="w-full h-24 object-cover rounded-md border border-border shadow-sm"
                                          onError={(e) => {
                                            e.currentTarget.src = "/placeholder.svg"
                                          }}
                                        />
                                      </div>
                                    ))}
                                    {itemPhotos.length > 4 && (
                                      <div className="w-12 h-12 bg-muted flex items-center justify-center rounded-md border border-border">
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
                        <div className="p-6 rounded-lg bg-muted/30 border border-border">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="consent"
                              name="consent"
                              checked={termsAccepted}
                              onCheckedChange={setTermsAccepted}
                              className={`mt-1 border-[#3b82f6] text-[#3b82f6] focus-visible:ring-[#3b82f6] ${formErrors.terms ? "border-red-300" : ""}`}
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
                                  className="text-[#3b82f6] underline hover:text-[#2563eb] transition-colors"
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
                              setFormStep(2)
                            }, 100)
                          }}
                          className="px-6 py-3 rounded-lg border border-input bg-background text-foreground shadow-sm hover:bg-muted/50 transition-all duration-300 flex items-center gap-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>

                        <button
                          type="submit"
                          disabled={!step3Valid || isSubmitting}
                          className="bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] hover:from-[#2563eb] hover:to-[#4338ca] text-white px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#3b82f6]/10 via-[#6366f1]/10 to-[#4f46e5]/10 group-hover:opacity-0 transition-opacity duration-300"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <span>Submit</span>
                                <Check className="w-4 h-4" />
                              </>
                            )}
                          </span>
                        </button>
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-border/40 overflow-hidden transition-all duration-500">
              <div className="bg-gradient-to-r from-[#3b82f6]/10 via-[#6366f1]/10 to-[#4f46e5]/10 p-6 border-b border-border/40">
                <h2 className="text-xl font-medium">Submission Received</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Thank you for your submission. We'll be in touch soon.
                </p>
              </div>

              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#3b82f6]/10 to-[#4f46e5]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-[#3b82f6]" />
                </div>

                <h2 className="text-3xl font-light mb-4 bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] bg-clip-text text-transparent">
                  Thank You!
                </h2>

                <div className="w-24 h-1 mx-auto mb-6 bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] rounded-full"></div>

                <p className="text-lg mb-8 text-muted-foreground max-w-xl mx-auto">
                  We've received your submission and will review your item details. You can expect to hear from us
                  within 24 hours with a price offer.
                </p>

                {/* Show submitted photos in confirmation */}
                {itemPhotos.length > 0 && (
                  <div className="bg-muted/20 border border-border rounded-lg p-6 max-w-3xl mx-auto mb-8">
                    <h3 className="text-lg font-medium mb-4 text-[#3b82f6]">Your Submitted Photos</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {itemPhotos.map((photo, index) => (
                        <div key={photo.id} className="relative">
                          <img
                            src={typeof photo.preview === "string" ? photo.preview : "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border border-border shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-muted/30 p-6 rounded-lg max-w-md mx-auto text-left border border-border">
                  <h3 className="font-medium text-lg mb-3 text-[#3b82f6]">Next Steps</h3>
                  <ol className="space-y-3">
                    {[
                      "Our team will evaluate your item details",
                      "We'll email you a price offer within 24 hours",
                      "If you accept, we'll schedule a convenient pickup time",
                      "We'll arrive at the scheduled time and provide payment on the spot",
                    ].map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#3b82f6]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-[#3b82f6]">{index + 1}</span>
                        </div>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-12">
                  <Link
                    href="/"
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            </div>
          </ContentAnimation>
        )}
      </div>
    </div>
  )
}
