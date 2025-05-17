"use client"

import Link from "next/link"
import { useState, useEffect, useRef, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
  Wand2,
} from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import { useToast } from "@/hooks/use-toast"
import AddressAutocomplete from "@/components/address-autocomplete"
import PhoneVerification from "@/components/phone-verification"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { submitMultipleItemsToSupabase } from "../actions/submit-multiple-items"
import { Checkbox } from "@/components/ui/checkbox"
import { uploadImagePrivate } from "@/app/actions/upload-image-private"

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

  // Validation states
  const [step1Valid, setStep1Valid] = useState(false)
  const [step2Valid, setStep2Valid] = useState(false)

  // Multiple items state - using a stable reference with useRef
  const itemsRef = useRef([
    {
      id: "item-" + Date.now(),
      name: "",
      description: "",
      photos: [],
      condition: "",
      issues: "",
      isExpanded: true,
      isValid: false,
      nameSuggestion: "",
      isLoadingSuggestion: false,
      lastProcessedName: "",
      imagePath: "",
      imageUrl: "",
    },
  ])

  // State to trigger re-renders when items change
  const [itemsVersion, setItemsVersion] = useState(0)

  // Refs
  const formContainerRef = useRef(null)
  const formTopRef = useRef(null)
  const fileInputRefs = useRef({})
  const suggestionTimeoutsRef = useRef({})

  // Getter for items that uses the ref
  const getItems = useCallback(() => {
    return itemsRef.current || []
  }, [])

  // Setter for items that updates the ref and triggers a re-render
  const setItems = useCallback((newItems) => {
    itemsRef.current = newItems
    setItemsVersion((prev) => prev + 1) // Increment version to trigger re-render
  }, [])

  // Format phone number to E.164 format for API
  const formatPhoneForApi = useCallback((phone) => {
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
  }, [])

  // Validate individual item
  const validateItem = useCallback(
    (item, index) => {
      if (!item) return false

      const isValid =
        item.name?.trim() !== "" &&
        item.description?.trim() !== "" &&
        item.photos?.length >= 3 &&
        item.condition !== "" &&
        item.issues?.trim() !== ""

      // Update the item's validity
      const updatedItems = [...getItems()]
      if (updatedItems[index]) {
        updatedItems[index] = {
          ...updatedItems[index],
          isValid,
        }
        setItems(updatedItems)
      }

      return isValid
    },
    [getItems, setItems],
  )

  // Validate step 1 (all items)
  useEffect(() => {
    try {
      const items = getItems()
      const allItemsValid = items.length > 0 && items.every((item) => item.isValid)
      setStep1Valid(allItemsValid)
    } catch (error) {
      console.error("Error validating step 1:", error)
      setStep1Valid(false)
    }
  }, [itemsVersion, getItems])

  // Validate step 2 (contact info)
  useEffect(() => {
    try {
      setStep2Valid(
        fullName?.trim() !== "" &&
          email?.trim() !== "" &&
          email?.includes("@") &&
          phone?.trim() !== "" &&
          address?.trim() !== "" &&
          pickupDate !== "" &&
          termsAccepted,
      )
    } catch (error) {
      console.error("Error validating step 2:", error)
      setStep2Valid(false)
    }
  }, [fullName, email, phone, address, pickupDate, termsAccepted])

  // Add a new item
  const addItem = useCallback(() => {
    try {
      const newItem = {
        id: "item-" + Date.now(),
        name: "",
        description: "",
        photos: [],
        condition: "",
        issues: "",
        isExpanded: true,
        isValid: false,
        nameSuggestion: "",
        isLoadingSuggestion: false,
        lastProcessedName: "",
        imagePath: "",
        imageUrl: "",
      }

      setItems([...getItems(), newItem])

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
    } catch (error) {
      console.error("Error adding item:", error)
      toast({
        title: "Error",
        description: "There was a problem adding a new item. Please try again.",
        variant: "destructive",
      })
    }
  }, [getItems, setItems, toast])

  // Remove an item
  const removeItem = useCallback(
    (index) => {
      try {
        const items = getItems()
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
      } catch (error) {
        console.error("Error removing item:", error)
        toast({
          title: "Error",
          description: "There was a problem removing the item. Please try again.",
          variant: "destructive",
        })
      }
    },
    [getItems, setItems, toast],
  )

  // Duplicate an item
  const duplicateItem = useCallback(
    (index) => {
      try {
        const items = getItems()
        const itemToDuplicate = items[index]
        if (!itemToDuplicate) return

        const newItem = {
          ...itemToDuplicate,
          id: "item-" + Date.now(),
          isExpanded: true,
          photos: [...(itemToDuplicate.photos || [])],
          nameSuggestion: "",
          isLoadingSuggestion: false,
          lastProcessedName: "",
          imagePath: "",
          imageUrl: "",
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
      } catch (error) {
        console.error("Error duplicating item:", error)
        toast({
          title: "Error",
          description: "There was a problem duplicating the item. Please try again.",
          variant: "destructive",
        })
      }
    },
    [getItems, setItems, toast],
  )

  // Update item field - memoized to prevent recreation on renders
  const updateItemField = useCallback(
    (index, field, value) => {
      try {
        const updatedItems = [...getItems()]
        if (!updatedItems[index]) return

        updatedItems[index] = {
          ...updatedItems[index],
          [field]: value,
        }

        setItems(updatedItems)

        // Validate the item after update
        setTimeout(() => validateItem(updatedItems[index], index), 100)
      } catch (error) {
        console.error(`Error updating item field ${field}:`, error)
      }
    },
    [getItems, setItems, validateItem],
  )

  // Toggle item accordion
  const toggleItemAccordion = useCallback(
    (index) => {
      try {
        const updatedItems = [...getItems()]
        if (!updatedItems[index]) return

        updatedItems[index] = {
          ...updatedItems[index],
          isExpanded: !updatedItems[index].isExpanded,
        }
        setItems(updatedItems)
      } catch (error) {
        console.error("Error toggling item accordion:", error)
      }
    },
    [getItems, setItems],
  )

  // Handle file upload for a specific item
  const handleFileUpload = useCallback(
    (e, index) => {
      try {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
          const items = getItems()
          if (!items[index]) return

          // Check if adding these files would exceed the maximum
          const currentCount = items[index].photos?.length || 0
          const newCount = currentCount + files.length

          if (newCount > 10) {
            toast({
              title: "Too Many Files",
              description: `You can only upload a maximum of 10 photos per item. You already have ${currentCount} photos.`,
              variant: "destructive",
            })
            return
          }

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
            photos: [...(updatedItems[index].photos || []), ...newPhotos],
          }
          setItems(updatedItems)

          // Reset the input value to prevent duplicate uploads
          if (e.target) {
            e.target.value = null
          }

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
    },
    [getItems, setItems, toast, validateItem],
  )

  // Remove photo from an item
  const removePhoto = useCallback(
    (itemIndex, photoIndex) => {
      try {
        const updatedItems = [...getItems()]
        if (!updatedItems[itemIndex]) return

        const item = updatedItems[itemIndex]
        if (!item.photos || !item.photos[photoIndex]) return

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
    },
    [getItems, setItems, validateItem],
  )

  // Scroll to the top of the page with smooth animation
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [])

  // Validate all items in step 1
  const validateStep1 = useCallback(() => {
    try {
      let allValid = true
      const updatedItems = [...getItems()]

      updatedItems.forEach((item, index) => {
        const isValid = validateItem(item, index)
        if (!isValid) {
          allValid = false
          // Expand invalid items
          if (updatedItems[index]) {
            updatedItems[index] = {
              ...updatedItems[index],
              isExpanded: true,
            }
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
    } catch (error) {
      console.error("Error validating step 1:", error)
      return false
    }
  }, [getItems, setItems, toast, validateItem])

  // Validate step 2 (contact info)
  const validateStep2 = useCallback(() => {
    try {
      const errors = {}
      if (!fullName?.trim()) {
        errors.fullName = "Full name is required"
      }
      if (!email?.trim()) {
        errors.email = "Email is required"
      } else if (!email.includes("@")) {
        errors.email = "Please enter a valid email address"
      }
      if (!phone?.trim()) {
        errors.phone = "Phone number is required"
      }
      if (!address?.trim()) {
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
    } catch (error) {
      console.error("Error validating step 2:", error)
      return false
    }
  }, [fullName, email, phone, address, pickupDate, termsAccepted])

  // Handle continue to step 2
  const handleContinueToStep2 = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()

      if (validateStep1()) {
        setFormStep(2)
        setFormErrors({})
        // Scroll to the top of the page after changing step
        setTimeout(scrollToTop, 50)
      }
    },
    [scrollToTop, validateStep1],
  )

  // Upload images for all items
  const uploadItemImages = useCallback(async () => {
    try {
      const items = getItems()
      const updatedItems = [...items]

      // Process each item
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!item) continue

        // Skip if no photos
        if (!item.photos || item.photos.length === 0) continue

        // Use the first photo as the main image
        const mainPhoto = item.photos[0]
        if (!mainPhoto || !mainPhoto.file) continue

        try {
          // Upload the image to Supabase
          const uploadResult = await uploadImagePrivate(mainPhoto.file, email)

          if (uploadResult.success) {
            // Update the item with image path and URL
            updatedItems[i] = {
              ...updatedItems[i],
              imagePath: uploadResult.path || "",
              imageUrl: uploadResult.signedUrl || "",
            }
          } else {
            console.error(`Failed to upload image for item ${i + 1}:`, uploadResult.error)
          }
        } catch (error) {
          console.error(`Error uploading image for item ${i + 1}:`, error)
        }
      }

      // Update items with image paths and URLs
      setItems(updatedItems)
      return updatedItems
    } catch (error) {
      console.error("Error uploading item images:", error)
      return getItems()
    }
  }, [email, getItems, setItems])

  // Complete form submission after verification
  const completeFormSubmission = useCallback(async () => {
    setIsSubmitting(true)

    try {
      // Log form data for debugging
      console.log("Form submission data:", {
        items: getItems(),
        fullName,
        email,
        phone,
        address,
        pickupDate,
      })

      // First, upload images for all items
      const itemsWithImages = await uploadItemImages()

      // Format items for submission
      const formattedItems = itemsWithImages.map((item) => ({
        name: item.name || "",
        description: item.description || "",
        condition: item.condition || "",
        issues: item.issues || "",
        photos: (item.photos || []).map((photo) => ({
          name: photo.name || "",
          type: photo.type || "",
          size: photo.size || 0,
        })),
        imagePath: item.imagePath || "",
        imageUrl: item.imageUrl || "",
      }))

      // Submit to Supabase
      const result = await submitMultipleItemsToSupabase(formattedItems, {
        fullName,
        email,
        phone,
        address,
        pickupDate,
      })

      console.log("Submission result:", result)

      if (!result.success) {
        setSubmitResult({
          success: false,
          message: result.message || "Failed to submit items. Please try again.",
        })
        setIsSubmitting(false)

        toast({
          title: "Error",
          description: result.message || "There was a problem submitting your form. Please try again.",
          variant: "destructive",
        })

        return
      }

      // Set form as submitted
      setFormSubmitted(true)
      // Scroll to top after submission is successful
      setTimeout(scrollToTop, 50)
      setIsSubmitting(false)

      toast({
        title: "Success!",
        description: "Your items have been submitted successfully. We'll contact you soon.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitResult({
        success: false,
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      })
      setIsSubmitting(false)

      toast({
        title: "Error",
        description: `There was a problem submitting your form: ${error instanceof Error ? error.message : "Please try again."}`,
        variant: "destructive",
      })
    }
  }, [address, email, fullName, getItems, phone, pickupDate, scrollToTop, toast, uploadItemImages])

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      e.stopPropagation()

      if (validateStep2()) {
        setIsSubmitting(true)

        try {
          // Format the phone number for verification
          const formattedPhone = formatPhoneForApi(phone)
          console.log("Phone number for verification:", formattedPhone)

          // Check if we're in demo mode or should skip verification
          if (
            process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
            process.env.NEXT_PUBLIC_SKIP_SMS_VERIFICATION === "true"
          ) {
            console.log("Demo mode or skip verification enabled - proceeding directly to submission")
            // Skip verification in demo mode
            await completeFormSubmission()
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
    },
    [completeFormSubmission, formatPhoneForApi, phone, toast, validateStep2],
  )

  // Handle name input change
  const handleNameChange = useCallback(
    (e, index) => {
      const value = e.target.value
      updateItemField(index, "name", value)

      // Schedule suggestion generation with debounce
      if (value.trim().length >= 3) {
        // Clear any existing timeout for this item
        if (suggestionTimeoutsRef.current[index]) {
          clearTimeout(suggestionTimeoutsRef.current[index])
        }

        // Set a new timeout
        suggestionTimeoutsRef.current[index] = setTimeout(() => {
          const currentItems = getItems()
          // Only fetch if the name is still the same and different from last processed
          if (
            currentItems[index] &&
            currentItems[index].name === value &&
            currentItems[index].name !== currentItems[index].lastProcessedName
          ) {
            fetchNameSuggestion(value, index)
          }
        }, 800)
      }
    },
    [getItems, updateItemField],
  )

  // Handle description input change
  const handleDescriptionChange = useCallback(
    (e, index) => {
      const value = e.target.value
      updateItemField(index, "description", value)
    },
    [updateItemField],
  )

  // Handle issues input change
  const handleIssuesChange = useCallback(
    (e, index) => {
      const value = e.target.value
      updateItemField(index, "issues", value)
    },
    [updateItemField],
  )

  // Handle condition selection
  const handleConditionSelect = useCallback(
    (index, conditionValue) => {
      updateItemField(index, "condition", conditionValue)
    },
    [updateItemField],
  )

  // Fetch suggestion for a specific item
  const fetchNameSuggestion = useCallback(
    async (text, index) => {
      try {
        // Get current items
        const currentItems = [...getItems()]

        // Skip if this item no longer exists or already has a suggestion loading
        if (!currentItems[index] || currentItems[index].isLoadingSuggestion) {
          return
        }

        // Update loading state and mark this name as processed
        currentItems[index] = {
          ...currentItems[index],
          isLoadingSuggestion: true,
          lastProcessedName: text,
        }
        setItems(currentItems)

        try {
          const res = await fetch("/api/description-suggest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: text }),
          })
          const data = await res.json()

          // Get fresh copy of items (they might have changed during the fetch)
          const updatedItems = [...getItems()]

          // Make sure the item still exists
          if (updatedItems[index]) {
            if (res.ok && data.suggestion) {
              updatedItems[index] = {
                ...updatedItems[index],
                nameSuggestion: data.suggestion,
                isLoadingSuggestion: false,
              }
            } else {
              updatedItems[index] = {
                ...updatedItems[index],
                nameSuggestion: "",
                isLoadingSuggestion: false,
              }
            }
            setItems(updatedItems)
          }
        } catch (err) {
          console.error(err)
          // Update the items array to clear loading state on error
          const updatedItems = [...getItems()]
          if (updatedItems[index]) {
            updatedItems[index] = {
              ...updatedItems[index],
              nameSuggestion: "",
              isLoadingSuggestion: false,
            }
            setItems(updatedItems)
          }
        }
      } catch (error) {
        console.error("Error fetching name suggestion:", error)
      }
    },
    [getItems, setItems],
  )

  // Apply suggestion for a specific item
  const applySuggestion = useCallback(
    (index) => {
      try {
        const items = getItems()
        const item = items[index]
        if (!item || !item.nameSuggestion) return

        const updatedItems = [...items]
        updatedItems[index] = {
          ...updatedItems[index],
          description: item.nameSuggestion,
          nameSuggestion: "", // Clear the suggestion after applying
        }
        setItems(updatedItems)

        toast({
          title: "Suggestion Applied",
          description: "The enhanced description has been applied.",
          variant: "default",
        })
      } catch (error) {
        console.error("Error applying suggestion:", error)
      }
    },
    [getItems, setItems, toast],
  )

  // Get step completion status
  const getStepStatus = useCallback(
    (step) => {
      if (formStep > step) return "complete"
      if (formStep === step) return "current"
      return "incomplete"
    },
    [formStep],
  )

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      try {
        // Revoke all created object URLs to prevent memory leaks
        const items = getItems()
        items.forEach((item) => {
          if (item && item.photos) {
            item.photos.forEach((photo) => {
              if (photo && photo.previewUrl) {
                URL.revokeObjectURL(photo.previewUrl)
              }
            })
          }
        })

        // Clear any pending suggestion timeouts
        Object.values(suggestionTimeoutsRef.current).forEach((timeout) => {
          if (timeout) clearTimeout(timeout)
        })
      } catch (error) {
        console.error("Error in cleanup function:", error)
      }
    }
  }, [getItems])

  // Error message component
  const ErrorMessage = ({ message }) => (
    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )

  const [step, setStep] = useState(1)

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
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-[#6366f1]/10 dark:border-[#6366f1]/20 overflow-hidden transition-all duration-300 relative z-20"
              >
                {/* Form header - Updated with more vibrant gradient */}
                <div className="bg-gradient-to-r from-[#00b4ff]/50 via-[#4338ca]/50 to-[#c026d3]/50 p-6 border-b border-[#e2e8f0] dark:border-gray-700 text-center shadow-sm">
                  <div className="mb-2">
                    <Link href="/sell-item" className="text-white hover:underline text-sm">
                      Only selling one item? Click here
                    </Link>
                  </div>
                  <h2 className="text-xl font-medium tracking-tight text-white">
                    {formStep === 1 ? "Add your items" : "Your contact information"}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {formStep === 1
                      ? `You're currently adding ${getItems().length} item${getItems().length > 1 ? "s" : ""}`
                      : "Let us know how to reach you and arrange pickup"}
                  </p>
                </div>

                <div className="p-6">
                  {formStep === 1 && (
                    <div className="space-y-6">
                      {/* Items list */}
                      <div className="space-y-6">
                        {getItems().map((item, index) => (
                          <Card
                            key={item.id}
                            id={item.id}
                            className={`border ${
                              item.isValid ? "border-[#e2e8f0] dark:border-gray-700" : "border-[#6366f1]/30"
                            } transition-all duration-300 hover:shadow-md bg-white dark:bg-gray-800`}
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
                                  <input
                                    id={`item-name-${index}`}
                                    value={item.name || ""}
                                    onChange={(e) => handleNameChange(e, index)}
                                    placeholder="e.g., Leather Sofa, Samsung TV"
                                    className="flex h-10 w-full rounded-md border border-input/50 bg-white dark:bg-gray-900/50 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#3b82f6]/30 focus:border-[#3b82f6]/70 relative z-30"
                                    required
                                  />

                                  {/* Smart name suggestion - moved here from description section */}
                                  {item.isLoadingSuggestion && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      <span>Generating suggestion...</span>
                                    </div>
                                  )}

                                  {item.nameSuggestion && (
                                    <div
                                      onClick={() => applySuggestion(index)}
                                      className="mt-3 p-3 bg-[#6366f1]/5 border border-[#6366f1]/20 rounded-lg cursor-pointer hover:bg-[#6366f1]/10 transition-colors duration-200"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <Wand2 className="h-4 w-4 text-[#6366f1]" />
                                        <span className="text-sm font-medium text-[#6366f1]">
                                          Suggested Description
                                        </span>
                                        <span className="text-xs bg-[#6366f1]/10 text-[#6366f1] px-2 py-0.5 rounded-full">
                                          Click to Apply
                                        </span>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{item.nameSuggestion}</p>
                                    </div>
                                  )}
                                </div>

                                <div className="transition-all duration-300">
                                  <div className="flex justify-between items-center mb-2">
                                    <Label htmlFor={`item-description-${index}`} className="text-sm font-medium">
                                      Brief Description <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="text-xs text-muted-foreground">
                                      {(item.description || "").length} characters
                                    </div>
                                  </div>
                                  <textarea
                                    id={`item-description-${index}`}
                                    value={item.description || ""}
                                    onChange={(e) => handleDescriptionChange(e, index)}
                                    placeholder="Describe your item in detail including brand, model, size, color, etc."
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-input/50 bg-white dark:bg-gray-900/50 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#3b82f6]/30 focus:border-[#3b82f6]/70 relative z-30"
                                    required
                                  />
                                </div>

                                <div className="transition-all duration-300">
                                  <Label className="text-sm font-medium mb-2 block">
                                    Item Condition <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="grid grid-cols-5 gap-1">
                                    {/* Clickable condition options */}
                                    {["like-new", "excellent", "good", "fair", "poor"].map((conditionOption) => (
                                      <div
                                        key={conditionOption}
                                        className={`flex flex-col items-center p-2 rounded-lg border ${
                                          item.condition === conditionOption
                                            ? "border-[#6366f1] bg-[#6366f1]/5"
                                            : "border-[#e2e8f0] dark:border-gray-700"
                                        } cursor-pointer hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-all duration-200 shadow-sm hover:shadow-md`}
                                        onClick={() => handleConditionSelect(index, conditionOption)}
                                      >
                                        <div
                                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                            item.condition === conditionOption
                                              ? "bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] text-white"
                                              : "bg-muted text-muted-foreground"
                                          }`}
                                        >
                                          {conditionOption === "like-new" && <Sparkles className="w-4 h-4" />}
                                          {conditionOption === "excellent" && <CheckCircle2 className="w-4 h-4" />}
                                          {conditionOption === "good" && <Check className="w-4 h-4" />}
                                          {conditionOption === "fair" && <Info className="w-4 h-4" />}
                                          {conditionOption === "poor" && <AlertCircle className="w-4 h-4" />}
                                        </div>
                                        <Label
                                          htmlFor={`condition-${conditionOption}-${index}`}
                                          className="text-xs font-medium cursor-pointer text-center"
                                        >
                                          {conditionOption
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
                                    <div className="text-xs text-muted-foreground">
                                      {(item.issues || "").length} characters
                                    </div>
                                  </div>
                                  <textarea
                                    id={`item-issues-${index}`}
                                    value={item.issues || ""}
                                    onChange={(e) => handleIssuesChange(e, index)}
                                    placeholder="Please describe any scratches, dents, missing parts, or functional issues. If none, please write 'None'."
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-input/50 bg-white dark:bg-gray-900/50 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#3b82f6]/30 focus:border-[#3b82f6]/70 relative z-30"
                                    required
                                  />
                                </div>

                                <div className="transition-all duration-300">
                                  <Label className="text-sm font-medium mb-2 block">
                                    Item Photos <span className="text-red-500">*</span>{" "}
                                    <span className="text-sm font-normal text-muted-foreground">(at least 3)</span>
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
                                        {(item.photos || []).length} of 3 required (max 10)
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
                                  {item.photos && item.photos.length > 0 && (
                                    <div className="mt-4">
                                      <div className="flex flex-wrap gap-3">
                                        {item.photos.map((photo, photoIndex) => (
                                          <div key={photo.id || photoIndex} className="relative group">
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
                                          (item.photos || []).length >= 3
                                            ? "bg-green-500"
                                            : "bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6]"
                                        }`}
                                        style={{ width: `${Math.min(100, ((item.photos || []).length / 3) * 100)}%` }}
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

                                  {item.photos && item.photos.length > 0 && (
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
                          className="bg-gradient-to-r from-[#0284c7] via-[#4f46e5] to-[#7c3aed] hover:from-[#0284c7]/90 hover:via-[#4f46e5]/90 hover:to-[#7c3aed]/90 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
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
                        <input
                          id="full-name"
                          name="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className="flex h-10 w-full rounded-md border border-input/50 bg-white dark:bg-gray-900/50 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#3b82f6]/30 focus:border-[#3b82f6]/70 relative z-30"
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
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="flex h-10 w-full rounded-md border border-input/50 bg-white dark:bg-gray-900/50 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#3b82f6]/30 focus:border-[#3b82f6]/70 relative z-30"
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
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(123) 456-7890"
                          className={`flex h-10 w-full rounded-md border ${
                            formErrors.phone ? "border-[#6366f1]/50" : "border-input/50"
                          } bg-white dark:bg-gray-900/50 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#3b82f6]/30 focus:border-[#3b82f6]/70 relative z-30`}
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
                        <input
                          id="pickup_date"
                          name="pickup_date"
                          type="date"
                          value={pickupDate}
                          onChange={(e) => {
                            setPickupDate(e.target.value)
                            // Blur the input to make the calendar disappear
                            e.target.blur()
                          }}
                          className="flex h-10 w-full rounded-md border border-input/50 bg-white dark:bg-gray-900/50 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#3b82f6]/30 focus:border-[#3b82f6]/70 relative z-30"
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

                      {/* Terms and conditions checkbox */}
                      <div className="flex items-start space-x-2 mt-4">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Accept terms and conditions <span className="text-red-500">*</span>
                          </label>
                          <p className="text-xs text-muted-foreground">
                            By checking this box, you agree to our{" "}
                            <Link href="/terms" className="text-[#6366f1] hover:underline">
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy-policy" className="text-[#6366f1] hover:underline">
                              Privacy Policy
                            </Link>
                            .
                          </p>
                        </div>
                      </div>
                      {formErrors.terms && <ErrorMessage message={formErrors.terms} />}

                      {/* Show items summary in step 2 */}
                      <div className="transition-all duration-300">
                        <div className="bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-4 shadow-sm">
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#6366f1]" />
                            <span>Items Summary ({getItems().length})</span>
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Items:</span> {getItems().length} items
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium text-foreground">Names:</span>{" "}
                                {getItems()
                                  .map((item) => item.name || "Unnamed Item")
                                  .join(", ")}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">Item Details:</p>
                              <Accordion type="single" collapsible className="w-full">
                                {getItems().map((item, index) => (
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
                                          {item.description || "No description provided"}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          <span className="font-medium text-foreground">Issues:</span>{" "}
                                          {item.issues || "None specified"}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          <span className="font-medium text-foreground">Photos:</span>{" "}
                                          {(item.photos || []).length}
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

                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormStep(1)}
                          className="hover:bg-muted/50 transition-all duration-200"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Back to Items
                        </Button>

                        <Button
                          type="submit"
                          disabled={isSubmitting || !step2Valid}
                          className="bg-gradient-to-r from-[#0284c7] via-[#4f46e5] to-[#7c3aed] hover:from-[#0284c7]/90 hover:via-[#4f46e5]/90 hover:to-[#7c3aed]/90 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit</span>
                              <Check className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </ContentAnimation>
          </>
        ) : (
          <ContentAnimation delay={0.3}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-[#6366f1]/10 dark:border-[#6366f1]/20 overflow-hidden transition-all duration-300 relative z-20 p-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-medium tracking-tight text-gray-800 dark:text-gray-100 mb-2">
                Thank you for your submission!
              </h2>
              <p className="text-muted-foreground text-sm">
                We've received your request and will get back to you within 24 hours.
              </p>
              <Link href="/" className="text-[#6366f1] hover:underline text-sm mt-4 inline-block">
                Back to Home
              </Link>
            </div>
          </ContentAnimation>
        )}
      </div>
    </div>
  )
}
