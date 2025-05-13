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
  Plus,
  Trash2,
  Copy,
} from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import { sendConfirmationEmail } from "../actions/send-confirmation-email"
import { useToast } from "@/hooks/use-toast"
import ConfettiEffect from "@/components/confetti-effect"
import AddressAutocomplete from "@/components/address-autocomplete"
import PhoneVerification from "@/components/phone-verification"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SellMultipleItemsPage() {
  const { toast } = useToast()
  const [formStep, setFormStep] = useState(1)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)

  // Phone verification states
  const [showVerification, setShowVerification] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  // Contact information
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Multiple items state
  const [items, setItems] = useState([
    {
      id: "item-" + Date.now(),
      name: "",
      description: "",
      photos: [],
      condition: "",
      issues: "",
      isExpanded: true,
      isValid: false,
    },
  ])

  // Refs
  const formContainerRef = useRef(null)
  const formTopRef = useRef(null)
  const fileInputRefs = useRef({})

  // Format phone number to E.164 format for API
  const formatPhoneForApi = (phone: string) => {
    if (!phone) return ""

    // Remove all spaces, parentheses, and dashes
    let cleaned = phone.replace(/\s+/g, "").replace(/[()-]/g, "").trim()

    // Make sure it starts with a plus sign
    if (!cleaned.startsWith("+")) {
      // If it's a 10-digit US number
      if (/^\d{10}$/.test(cleaned)) {
        cleaned = `+1${cleaned}`
      }
      // If it's an 11-digit number starting with 1 (US with country code)
      else if (/^1\d{10}$/.test(cleaned)) {
        cleaned = `+${cleaned}`
      }
      // For any other case, just add + prefix
      else {
        cleaned = `+${cleaned}`
      }
    }

    return cleaned
  }

  // Validate step 1 (all items)
  useEffect(() => {
    const allItemsValid = items.every((item) => item.isValid)
    setStep1Valid(allItemsValid && items.length > 0)
  }, [items])

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

  // Validate individual item
  const validateItem = (item, index) => {
    const isValid =
      item.name.trim() !== "" &&
      item.description.trim() !== "" &&
      item.photos.length >= 1 &&
      item.condition !== "" &&
      item.issues.trim() !== ""

    // Update the item's validity
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      isValid,
    }
    setItems(updatedItems)

    return isValid
  }

  // Add a new item
  const addItem = () => {
    const newItem = {
      id: "item-" + Date.now(),
      name: "",
      description: "",
      photos: [],
      condition: "",
      issues: "",
      isExpanded: true,
      isValid: false,
    }

    setItems([...items, newItem])

    // Scroll to the new item after it's added
    setTimeout(() => {
      const element = document.getElementById(newItem.id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)

    toast({
      title: "Item Added",
      description: "A new item has been added to your submission.",
      variant: "default",
    })
  }

  // Remove an item
  const removeItem = (index) => {
    if (items.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "You must have at least one item in your submission.",
        variant: "destructive",
      })
      return
    }

    const updatedItems = [...items]
    updatedItems.splice(index, 1)
    setItems(updatedItems)

    toast({
      title: "Item Removed",
      description: "The item has been removed from your submission.",
      variant: "default",
    })
  }

  // Duplicate an item
  const duplicateItem = (index) => {
    const itemToDuplicate = items[index]
    const newItem = {
      ...itemToDuplicate,
      id: "item-" + Date.now(),
      isExpanded: true,
      photos: [...itemToDuplicate.photos], // Create a new array with the same photos
    }

    const updatedItems = [...items]
    updatedItems.splice(index + 1, 0, newItem)
    setItems(updatedItems)

    // Scroll to the new item after it's added
    setTimeout(() => {
      const element = document.getElementById(newItem.id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)

    toast({
      title: "Item Duplicated",
      description: "The item has been duplicated.",
      variant: "default",
    })
  }

  // Update item field
  const updateItemField = (index, field, value) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    }
    setItems(updatedItems)

    // Validate the item after update
    setTimeout(() => validateItem(updatedItems[index], index), 100)
  }

  // Toggle item accordion
  const toggleItemAccordion = (index) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      isExpanded: !updatedItems[index].isExpanded,
    }
    setItems(updatedItems)
  }

  // Handle file upload for a specific item
  const handleFileUpload = (e, index) => {
    try {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        // Create file objects with preview URLs
        const newPhotos = files.map((file) => {
          // Create a safe URL for preview
          const previewUrl = URL.createObjectURL(file)

          return {
            file,
            name: file.name,
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            size: file.size,
            type: file.type,
            previewUrl,
          }
        })

        // Add to item photos
        const updatedItems = [...items]
        updatedItems[index] = {
          ...updatedItems[index],
          photos: [...updatedItems[index].photos, ...newPhotos],
        }
        setItems(updatedItems)

        // Reset the input value to prevent duplicate uploads
        e.target.value = null

        // Validate the item after adding photos
        setTimeout(() => validateItem(updatedItems[index], index), 100)

        // Show success toast
        toast({
          title: "Files Added",
          description: `Successfully added ${newPhotos.length} file${newPhotos.length > 1 ? "s" : ""} to item ${index + 1}`,
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

  // Remove photo from an item
  const removePhoto = (itemIndex, photoIndex) => {
    try {
      const updatedItems = [...items]
      const item = updatedItems[itemIndex]
      const newPhotos = [...item.photos]

      // Revoke the URL before removing the photo
      if (newPhotos[photoIndex].previewUrl) {
        URL.revokeObjectURL(newPhotos[photoIndex].previewUrl)
      }

      newPhotos.splice(photoIndex, 1)

      updatedItems[itemIndex] = {
        ...item,
        photos: newPhotos,
      }

      setItems(updatedItems)

      // Validate the item after removing photo
      setTimeout(() => validateItem(updatedItems[itemIndex], itemIndex), 100)
    } catch (error) {
      console.error("Error removing photo:", error)
    }
  }

  // Scroll to the top of the page with smooth animation
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Validate all items in step 1
  const validateStep1 = () => {
    let allValid = true
    const updatedItems = [...items]

    updatedItems.forEach((item, index) => {
      const isValid = validateItem(item, index)
      if (!isValid) {
        allValid = false
        // Expand invalid items
        updatedItems[index] = {
          ...updatedItems[index],
          isExpanded: true,
        }
      }
    })

    setItems(updatedItems)

    if (!allValid) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields for each item.",
        variant: "destructive",
      })
    }

    return allValid
  }

  // Validate step 2 (contact info)
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

  // Handle continue to step 2
  const handleContinueToStep2 = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (validateStep1()) {
      setFormStep(2)
      setFormErrors({})
      // Scroll to the top of the page after changing step
      setTimeout(scrollToTop, 50)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (validateStep2()) {
      setIsSubmitting(true)

      try {
        // Format the phone number for verification
        const formattedPhone = formatPhoneForApi(phone)
        console.log("Phone number for verification:", formattedPhone)

        // Check if we're in demo mode
        if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
          console.log("Demo mode enabled - skipping real verification")
          // Skip verification in demo mode
          completeFormSubmission()
        } else {
          // Start phone verification process
          setShowVerification(true)
        }
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

  // Complete form submission after verification
  const completeFormSubmission = async () => {
    setIsSubmitting(true)

    try {
      // Log form data for debugging
      console.log("Form submission data:", {
        items,
        fullName,
        email,
        phone,
        address,
        pickupDate,
      })

      // Send confirmation email with multiple items
      const emailResult = await sendConfirmationEmail({
        fullName,
        email,
        itemName: `Multiple Items (${items.length})`,
        itemCondition: "Multiple",
        itemDescription: items.map((item) => `${item.name}: ${item.description}`).join(" | "),
        itemIssues: items.map((item) => `${item.name}: ${item.issues}`).join(" | "),
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

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all created object URLs to prevent memory leaks
      items.forEach((item) => {
        item.photos.forEach((photo) => {
          if (photo.previewUrl) {
            URL.revokeObjectURL(photo.previewUrl)
          }
        })
      })
    }
  }, [])

  // Error message component
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

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] dark:from-gray-900 dark:to-gray-950"
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
                Sell Multiple Items
              </span>
            </h1>

            <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base mb-2">
              Complete the form below to get an offer for your items within 24 hours.
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

            {/* Phone Verification Modal */}
            {showVerification && !isVerified && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-[#e2e8f0] dark:border-gray-700">
                  <PhoneVerification
                    phoneNumber={formatPhoneForApi(phone)}
                    onVerified={() => {
                      setIsVerified(true)
                      setShowVerification(false)
                      completeFormSubmission()
                    }}
                    onCancel={() => {
                      setShowVerification(false)
                      setIsSubmitting(false)
                    }}
                  />
                </div>
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
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-[#6366f1]/10 dark:border-[#6366f1]/20 overflow-hidden transition-all duration-300"
              >
                {/* Form header */}
                <div className="bg-gradient-to-r from-[#0ea5e9]/30 via-[#6366f1]/30 to-[#8b5cf6]/30 p-6 border-b border-[#e2e8f0] dark:border-gray-700 text-center">
                  <div className="mb-2">
                    <Link href="/sell-item" className="text-[#6366f1] hover:underline text-sm">
                      Only selling one item? Click here
                    </Link>
                  </div>
                  <h2 className="text-xl font-medium tracking-tight text-gray-800 dark:text-gray-100">
                    {formStep === 1 ? "Add your items" : "Your contact information"}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {formStep === 1
                      ? `You're currently adding ${items.length} item${items.length > 1 ? "s" : ""}`
                      : "Let us know how to reach you and arrange pickup"}
                  </p>
                </div>

                <div className="p-6">
                  {formStep === 1 && (
                    <div className="space-y-6">
                      {/* Items list */}
                      <div className="space-y-6">
                        {items.map((item, index) => (
                          <Card
                            key={item.id}
                            id={item.id}
                            className={`border ${item.isValid ? "border-[#e2e8f0] dark:border-gray-700" : "border-[#6366f1]/30"} transition-all duration-300 hover:shadow-md bg-white dark:bg-gray-800`}
                          >
                            <CardHeader className="bg-gradient-to-r from-[#0ea5e9]/20 via-[#6366f1]/20 to-[#8b5cf6]/20 py-3 px-4 border-b border-[#e2e8f0] dark:border-gray-700">
                              <div className="flex justify-between items-center">
                                <div>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-4 w-4 text-[#6366f1]" />
                                    Item {index + 1}
                                    {item.isValid && (
                                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Complete
                                      </span>
                                    )}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    {item.name ? item.name : "Add item details below"}
                                  </CardDescription>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => duplicateItem(index)}
                                    className="h-7 w-7"
                                    title="Duplicate item"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    title="Remove item"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleItemAccordion(index)}
                                    className="h-7 w-7"
                                    title={item.isExpanded ? "Collapse" : "Expand"}
                                  >
                                    {item.isExpanded ? (
                                      <ChevronLeft className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>

                            {item.isExpanded && (
                              <CardContent className="pt-4 px-4 space-y-4">
                                <div className="transition-all duration-300">
                                  <Label htmlFor={`item-name-${index}`} className="text-sm font-medium mb-2 block">
                                    Item Name <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id={`item-name-${index}`}
                                    value={item.name}
                                    onChange={(e) => updateItemField(index, "name", e.target.value)}
                                    placeholder="e.g., Leather Sofa, Samsung TV"
                                    className="w-full border border-[#e2e8f0] dark:border-gray-700 rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50"
                                    required
                                  />
                                </div>

                                <div className="transition-all duration-300">
                                  <div className="flex justify-between items-center mb-2">
                                    <Label htmlFor={`item-description-${index}`} className="text-sm font-medium">
                                      Brief Description <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="text-xs text-muted-foreground">
                                      {item.description.length} characters
                                    </div>
                                  </div>
                                  <Textarea
                                    id={`item-description-${index}`}
                                    value={item.description}
                                    onChange={(e) => updateItemField(index, "description", e.target.value)}
                                    placeholder="Describe your item in detail including brand, model, size, color, etc."
                                    rows={3}
                                    className="w-full border border-[#e2e8f0] dark:border-gray-700 rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50"
                                    required
                                  />
                                </div>

                                <div className="transition-all duration-300">
                                  <Label className="text-sm font-medium mb-2 block">
                                    Item Condition <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="grid grid-cols-5 gap-1">
                                    {/* Clickable condition options */}
                                    {["like-new", "excellent", "good", "fair", "poor"].map((condition) => (
                                      <div
                                        key={condition}
                                        className={`flex flex-col items-center p-2 rounded-lg border ${
                                          item.condition === condition
                                            ? "border-[#6366f1] bg-[#6366f1]/5"
                                            : "border-[#e2e8f0] dark:border-gray-700"
                                        } cursor-pointer hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all duration-200 shadow-sm hover:shadow-md`}
                                        onClick={() => updateItemField(index, "condition", condition)}
                                      >
                                        <div
                                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                            item.condition === condition
                                              ? "bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] text-white"
                                              : "bg-muted text-muted-foreground"
                                          }`}
                                        >
                                          {condition === "like-new" && <Sparkles className="w-4 h-4" />}
                                          {condition === "excellent" && <CheckCircle2 className="w-4 h-4" />}
                                          {condition === "good" && <Check className="w-4 h-4" />}
                                          {condition === "fair" && <Info className="w-4 h-4" />}
                                          {condition === "poor" && <AlertCircle className="w-4 h-4" />}
                                        </div>
                                        <Label
                                          htmlFor={`condition-${condition}-${index}`}
                                          className="text-xs font-medium cursor-pointer text-center"
                                        >
                                          {condition
                                            .split("-")
                                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(" ")}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="transition-all duration-300">
                                  <div className="flex justify-between items-center mb-2">
                                    <Label htmlFor={`item-issues-${index}`} className="text-sm font-medium">
                                      Any issues or defects? <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="text-xs text-muted-foreground">{item.issues.length} characters</div>
                                  </div>
                                  <Textarea
                                    id={`item-issues-${index}`}
                                    value={item.issues}
                                    onChange={(e) => updateItemField(index, "issues", e.target.value)}
                                    placeholder="Please describe any scratches, dents, missing parts, or functional issues. If none, please write 'None'."
                                    rows={3}
                                    className="w-full border border-[#e2e8f0] dark:border-gray-700 rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50"
                                    required
                                  />
                                </div>

                                <div className="transition-all duration-300">
                                  <Label className="text-sm font-medium mb-2 block">
                                    Item Photos <span className="text-red-500">*</span>{" "}
                                    <span className="text-sm font-normal text-muted-foreground">(at least 1)</span>
                                  </Label>

                                  {/* File upload */}
                                  <div
                                    onClick={() => fileInputRefs.current[`item-${index}`]?.click()}
                                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 border-[#6366f1]/40 hover:border-[#6366f1] bg-white dark:bg-gray-800 hover:bg-[#6366f1]/5 shadow-sm"
                                  >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                      <ImageIcon className="w-6 h-6 text-[#6366f1]/70" />
                                      <p className="font-medium text-sm text-[#6366f1]">Click to Upload Images</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {item.photos.length} of 1 required (max 5)
                                      </p>
                                    </div>
                                    <input
                                      type="file"
                                      ref={(el) => (fileInputRefs.current[`item-${index}`] = el)}
                                      className="hidden"
                                      multiple
                                      accept="image/*"
                                      onChange={(e) => handleFileUpload(e, index)}
                                    />
                                  </div>

                                  {/* Photo previews */}
                                  {item.photos.length > 0 && (
                                    <div className="mt-4">
                                      <div className="flex flex-wrap gap-3">
                                        {item.photos.map((photo, photoIndex) => (
                                          <div key={photo.id} className="relative group">
                                            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-md border border-[#e2e8f0] dark:border-gray-700 shadow-sm overflow-hidden">
                                              {photo.previewUrl ? (
                                                <img
                                                  src={photo.previewUrl || "/placeholder.svg"}
                                                  alt={`Preview ${photoIndex + 1}`}
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => {
                                                    console.error(`Error loading image ${photoIndex}:`, e)
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
                                              onClick={() => removePhoto(index, photoIndex)}
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
                                          item.photos.length >= 1
                                            ? "bg-green-500"
                                            : "bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6]"
                                        }`}
                                        style={{ width: `${Math.min(100, (item.photos.length / 1) * 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            )}

                            {!item.isExpanded && (
                              <CardContent className="pt-4">
                                <div className="flex flex-wrap gap-4 items-center">
                                  {item.name && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Name:</span>
                                      <span className="text-muted-foreground">{item.name}</span>
                                    </div>
                                  )}

                                  {item.condition && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Condition:</span>
                                      <span className="text-muted-foreground">
                                        {item.condition
                                          .split("-")
                                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                          .join(" ")}
                                      </span>
                                    </div>
                                  )}

                                  {item.photos.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Photos:</span>
                                      <span className="text-muted-foreground">{item.photos.length}</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>

                      {/* Add item button */}
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          onClick={addItem}
                          className="bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 border border-[#6366f1]/20 transition-all duration-300"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Another Item
                        </Button>
                      </div>

                      <div className="flex justify-end mt-6">
                        <button
                          type="button"
                          onClick={handleContinueToStep2}
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
                    <div className="space-y-6">
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
                          className="w-full border border-[#e2e8f0] dark:border-gray-700 rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50"
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
                          className="w-full border border-[#e2e8f0] dark:border-gray-700 rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50"
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
                              formErrors.phone ? "border-[#6366f1]/50" : "border-[#e2e8f0] dark:border-gray-700"
                            } rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50 pl-10`}
                            required
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                          </div>
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
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full border border-[#e2e8f0] dark:border-gray-700 rounded-lg focus-visible:ring-[#6366f1] bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 focus-within:border-[#6366f1] hover:border-[#6366f1]/50"
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

                      {/* Show items summary in step 2 */}
                      <div className="transition-all duration-300">
                        <div className="bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-4 shadow-sm">
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#6366f1]" />
                            <span>Items Summary ({items.length})</span>
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Items:</span> {items.length} items
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium text-foreground">Names:</span>{" "}
                                {items.map((item) => item.name).join(", ")}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">Item Details:</p>
                              <Accordion type="single" collapsible className="w-full">
                                {items.map((item, index) => (
                                  <AccordionItem key={item.id} value={`item-${index}`}>
                                    <AccordionTrigger className="text-sm hover:no-underline py-2">
                                      <span className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-[#6366f1]" />
                                        {item.name || `Item ${index + 1}`}
                                      </span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="pt-2">
                                        <p className="text-sm text-muted-foreground">
                                          <span className="font-medium text-foreground">Condition:</span>{" "}
                                          {item.condition
                                            ? item.condition
                                                .split("-")
                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(" ")
                                            : "Not specified"}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          <span className="font-medium text-foreground">Description:</span>{" "}
                                          {item.description}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          <span className="font-medium text-foreground">Issues:</span> {item.issues}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          <span className="font-medium text-foreground">Photos:</span>{" "}
                                          {item.photos.length}
                                        </p>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
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
                                . We'll use your information to process your request and contact you about your items.
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
                          className="px-6 py-2 rounded-lg border border-[#e2e8f0] dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground shadow-sm hover:bg-muted/50 transition-all duration-300 flex items-center gap-2 font-medium"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>

                        <Button
                          type="submit"
                          disabled={!step2Valid || isSubmitting}
                          className="bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] hover:from-[#0ea5e9]/90 hover:via-[#6366f1]/90 hover:to-[#8b5cf6]/90 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-[#e2e8f0] dark:border-gray-700 overflow-hidden transition-all duration-500">
              <div className="bg-gradient-to-r from-[#0ea5e9]/30 via-[#6366f1]/30 to-[#8b5cf6]/30 p-6 border-b border-[#e2e8f0] dark:border-gray-700">
                <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">Submission Received</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Thank you for your submission. We'll be in touch soon.
                </p>
              </div>

              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#0ea5e9]/10 via-[#6366f1]/10 to-[#8b5cf6]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-[#6366f1]" />
                </div>

                <h2 className="text-3xl font-light mb-4 bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                  Thank You!
                </h2>

                <div className="w-24 h-1 mx-auto mb-6 bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] rounded-full"></div>

                <p className="text-lg mb-8 text-muted-foreground max-w-xl mx-auto">
                  We've received your submission for {items.length} item{items.length > 1 ? "s" : ""} and will review
                  the details. You can expect to hear from us within 24 hours with a price offer.
                </p>

                {/* Show submitted photos in confirmation */}
                {items.length > 0 && (
                  <div className="bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-6 max-w-3xl mx-auto mb-8">
                    <h3 className="text-lg font-medium mb-4 text-[#6366f1]">Your Submitted Items</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {items.map((item, index) => (
                        <div
                          key={item.id}
                          className="border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-4 bg-white/50 dark:bg-gray-800/50"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{item.name || `Item ${index + 1}`}</h4>
                            <span className="text-xs bg-[#6366f1]/10 text-[#6366f1] px-2 py-0.5 rounded-full">
                              {item.condition
                                ? item.condition.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                : "No condition"}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium text-foreground">Description:</span> {item.description}
                          </p>

                          {item.photos.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-foreground mb-1">Photos:</p>
                              <div className="flex flex-wrap gap-2">
                                {item.photos.slice(0, 2).map((photo, photoIndex) => (
                                  <div key={photo.id} className="w-16 h-16 relative">
                                    <div className="w-full h-full rounded-md border border-[#e2e8f0] dark:border-gray-700 shadow-sm overflow-hidden">
                                      {photo.previewUrl && (
                                        <img
                                          src={photo.previewUrl || "/placeholder.svg"}
                                          alt={`Submitted image ${photoIndex + 1}`}
                                          className="w-full h-full object-cover"
                                          style={{ display: "block" }}
                                        />
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {item.photos.length > 2 && (
                                  <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-md border border-[#e2e8f0] dark:border-gray-700">
                                    <span className="text-xs font-medium">+{item.photos.length - 2}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
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
