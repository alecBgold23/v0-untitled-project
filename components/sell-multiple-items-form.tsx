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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { submitMultipleItemsToSupabase } from "../app/actions/submit-multiple-items"
import { Checkbox } from "@/components/ui/checkbox"
import { uploadImagePrivate } from "@/app/actions/upload-image-private"
import { uploadImageFallback } from "@/app/actions/upload-image-fallback"
import { PriceEstimatorDialog } from "@/components/price-estimator-dialog"

export default function SellMultipleItemsForm() {
  const { toast } = useToast()
  const [formStep, setFormStep] = useState(1)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)

  // Store estimated prices for each item
  const [estimatedPrices, setEstimatedPrices] = useState<{ [key: string]: string }>({})

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
  const fullNameInputRef = useRef(null)
  const formBoxRef = useRef(null)

  // Create a fallback API endpoint in case the real one doesn't exist
  useEffect(() => {
    // Check if the API endpoint exists
    fetch("/api/description-suggest", { method: "HEAD" }).catch(() => {
      // If it doesn't exist, create a mock endpoint
      console.log("Description suggest API not found, using fallback behavior")

      // Override the global fetch for this specific endpoint
      const originalFetch = window.fetch
      window.fetch = (url, options) => {
        if (url === "/api/description-suggest") {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    suggestion: "This is an automatically generated description based on your item name.",
                  }),
              })
            }, 500)
          })
        }
        return originalFetch(url, options)
      }
    })
  }, [])

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

  // Handle when a price is estimated for an item
  const handlePriceEstimated = useCallback(
    (itemId: string, price: string) => {
      setEstimatedPrices((prev) => ({
        ...prev,
        [itemId]: price,
      }))

      // Also update the item with the estimated price
      const updatedItems = [...getItems()]
      const itemIndex = updatedItems.findIndex((item) => item.id === itemId)

      if (itemIndex !== -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          estimatedPrice: price, // Store the price in the item object
        }
        setItems(updatedItems)
      }

      toast({
        title: "Price Estimated",
        description: `The estimated value is ${price}`,
        variant: "default",
      })
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

  // Scroll to the top of the form
  const scrollToFormTop = useCallback(() => {
    if (formTopRef.current) {
      // Use scrollIntoView with specific options to position at the top of the viewport
      formTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" })

      // Focus on the first input field in step 2
      if (formStep === 1) {
        // Small delay to ensure DOM is updated and scrolling is complete
        setTimeout(() => {
          if (fullNameInputRef.current) {
            fullNameInputRef.current.focus()
          }
        }, 300)
      }
    }
  }, [formStep])

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

        // Scroll to the top of the form
        scrollToFormTop()
      }
    },
    [validateStep1, scrollToFormTop],
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

        // Create arrays to store image paths and URLs
        const imagePaths = []
        const imageUrls = []

        // Upload all photos for this item
        for (let j = 0; j < item.photos.length; j++) {
          const photo = item.photos[j]
          if (!photo || !photo.file) {
            console.warn(`Photo ${j + 1} for item ${i + 1} is missing a file property`)
            continue
          }

          try {
            // Validate file before upload
            if (!isValidFile(photo.file)) {
              console.error(`Photo ${j + 1} for item ${i + 1} is invalid or corrupted`)
              continue
            }

            // Log upload attempt
            console.log(`Attempting to upload image ${j + 1} for item ${i + 1}: ${photo.file.name}`)

            // Try primary upload method first
            let uploadResult = await uploadImagePrivate(photo.file, email || "anonymous")

            // If primary method fails, try fallback method
            if (!uploadResult.success) {
              console.log(`Primary upload method failed, trying fallback for image ${j + 1} for item ${i + 1}`)
              uploadResult = await uploadImageFallback(photo.file, email || "anonymous")
            }

            if (uploadResult.success) {
              // Add path and URL to arrays
              imagePaths.push(uploadResult.path || "")
              imageUrls.push(uploadResult.url || uploadResult.signedUrl || "")
              console.log(`Successfully uploaded image ${j + 1} for item ${i + 1}`)
            } else {
              console.error(`Failed to upload image ${j + 1} for item ${i + 1}:`, uploadResult.error)
              // Continue with other images even if one fails
            }
          } catch (error) {
            console.error(`Error uploading image ${j + 1} for item ${i + 1}:`, error)
            // Continue with other images even if one fails
          }
        }

        // Update the item with all image paths and URLs
        updatedItems[i] = {
          ...updatedItems[i],
          imagePaths: imagePaths,
          imageUrls: imageUrls,
          // Keep the first image as the main image for backward compatibility
          imagePath: imagePaths.length > 0 ? imagePaths[0] : "",
          imageUrl: imageUrls.length > 0 ? imageUrls[0] : "",
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

  // Add this helper function to validate files before upload
  const isValidFile = (file) => {
    // Check if file exists
    if (!file) return false

    // Check if file size is reasonable (less than 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error(`File ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      return false
    }

    // Check if file type is an image
    if (!file.type.startsWith("image/")) {
      console.error(`File ${file.name} is not an image (${file.type})`)
      return false
    }

    return true
  }

  // Also update the completeFormSubmission function to handle upload failures gracefully
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

      // Check if any items have images
      const hasAnyImages = itemsWithImages.some(
        (item) => (item.imagePaths && item.imagePaths.length > 0) || item.imagePath,
      )

      if (!hasAnyImages) {
        console.warn("No images were successfully uploaded. Proceeding with submission anyway.")
      }

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
        imagePaths: item.imagePaths || [],
        imageUrls: item.imageUrls || [],
        estimatedPrice: item.estimatedPrice || estimatedPrices[item.id] || null, // Add this line
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
  }, [address, email, fullName, getItems, phone, pickupDate, scrollToTop, toast, uploadItemImages, estimatedPrices])

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      e.stopPropagation()

      if (validateStep2()) {
        // Proceed directly to form submission without phone verification
        await completeFormSubmission()
      }
    },
    [completeFormSubmission, validateStep2],
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
          // Properly encode the text for the API request
          const encodedText = encodeURIComponent(text.trim())

          // Check if text is valid before making the request
          if (!encodedText || encodedText.length < 2) {
            throw new Error("Input text too short")
          }

          const res = await fetch("/api/description-suggest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: text }),
          })

          // Check if response is ok before trying to parse JSON
          if (!res.ok) {
            throw new Error(`API responded with status: ${res.status}`)
          }

          // Safely parse JSON
          const data = await res.json()

          // Get fresh copy of items (they might have changed during the fetch)
          const updatedItems = [...getItems()]

          // Make sure the item still exists
          if (updatedItems[index]) {
            if (data && data.suggestion) {
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
          console.error("Error fetching suggestion:", err)
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
        console.error("Error in fetchNameSuggestion:", error)
        // Ensure we reset the loading state even if there's an outer error
        try {
          const updatedItems = [...getItems()]
          if (updatedItems[index]) {
            updatedItems[index] = {
              ...updatedItems[index],
              isLoadingSuggestion: false,
            }
            setItems(updatedItems)
          }
        } catch (e) {
          console.error("Error resetting loading state:", e)
        }
      }
    },
    [getItems, setItems],
  )

  // Handle name input change
  const handleNameChange = useCallback(
    (e, index) => {
      const value = e.target.value
      updateItemField(index, "name", value)

      // Schedule suggestion generation with debounce
      if (value && value.trim().length >= 3) {
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
            currentItems[index].name !== currentItems[index].lastProcessedName &&
            value.trim().length >= 3
          ) {
            fetchNameSuggestion(value, index)
          }
        }, 800)
      }
    },
    [getItems, updateItemField, fetchNameSuggestion],
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
  const [isEstimating, setEstimating] = useState(false)

  useEffect(() => {
    // Create smooth entrance animation
    const mainContent = document.querySelector(".page-transition-wrapper")
    if (mainContent) {
      mainContent.classList.add("opacity-0")
      setTimeout(() => {
        mainContent.classList.remove("opacity-0")
        mainContent.classList.add("opacity-100", "transition-opacity", "duration-500")
      }, 100)
    }

    return () => {
      // Clean up
      if (mainContent) {
        mainContent.classList.add("opacity-0")
      }
    }
  }, [])

  // Add error handling for price estimation
  const estimatePrice = async (item: any) => {
    try {
      setEstimating(true)
      const response = await fetch("/api/price-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: item.description,
          name: item.name,
          condition: item.condition,
          issues: item.issues,
          itemId: item.id,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Price estimation error (${response.status}):`, errorText)

        // For rate limit errors, use a fallback price
        if (response.status === 429) {
          return { price: generateFallbackPrice(item) }
        }

        throw new Error(`Price estimation failed: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error estimating price:", error)
      // Return a fallback price on error
      return { price: generateFallbackPrice(item), source: "fallback" }
    } finally {
      setEstimating(false)
    }
  }

  // Simple fallback price generator
  const generateFallbackPrice = (item: any) => {
    const basePrice = 25
    const condition = item.condition?.toLowerCase() || ""

    let multiplier = 1
    if (condition.includes("new")) multiplier = 2
    else if (condition.includes("excellent")) multiplier = 1.5
    else if (condition.includes("good")) multiplier = 1.2
    else if (condition.includes("fair")) multiplier = 0.8
    else if (condition.includes("poor")) multiplier = 0.5

    const randomFactor = 0.8 + Math.random() * 0.4
    const price = Math.round(basePrice * multiplier * randomFactor)

    return `$${price}`
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f0f5ff] dark:from-gray-950 dark:to-[#0c1445]"
      ref={formContainerRef}
    >
      {/* Add a ref at the top of the form for scrolling */}
      <div ref={formTopRef} className="scroll-target"></div>

      <div className="container mx-auto px-4 py-8 md:py-12 page-transition-wrapper">
        <ContentAnimation>
          {/* Professional Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-3">
              <div className="h-px w-8 bg-gradient-to-r from-[#0066ff] to-transparent"></div>
              <span className="mx-3 text-xs font-semibold uppercase tracking-wider text-[#6a5acd]">
                Item Submission
              </span>
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#8c52ff]"></div>
            </div>

            <h1 className="font-bold text-3xl md:text-4xl tracking-tight mb-3 bg-gradient-to-r from-[#0066ff] via-[#6a5acd] to-[#8c52ff] bg-clip-text text-transparent">
              Sell Your Item
            </h1>

            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">
              Complete the form below to get an offer for your items within 24 hours.
            </p>
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
              <div className="mb-8">
                <div className="hidden md:flex justify-between items-center relative z-10 px-8 max-w-2xl mx-auto">
                  {/* Progress line */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
                  <div
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[#0066ff] via-[#6a5acd] to-[#8c52ff] -translate-y-1/2 transition-all duration-500"
                    style={{ width: formStep === 1 ? "0%" : "100%" }}
                  ></div>

                  {/* Step 1 */}
                  <div className="flex flex-col items-center relative bg-[#f8fafc] dark:bg-gray-950 px-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
                        getStepStatus(1) === "complete"
                          ? "bg-gradient-to-r from-[#0066ff] to-[#6a5acd] text-white"
                          : getStepStatus(1) === "current"
                            ? "bg-white dark:bg-gray-800 border-2 border-[#0066ff] text-[#0066ff]"
                            : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-400"
                      }`}
                    >
                      {getStepStatus(1) === "complete" ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Package className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium mt-2 ${
                        getStepStatus(1) === "current"
                          ? "text-[#0066ff]"
                          : getStepStatus(1) === "complete"
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      Item Details
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center relative bg-[#f8fafc] dark:bg-gray-950 px-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
                        getStepStatus(2) === "complete"
                          ? "bg-gradient-to-r from-[#6a5acd] to-[#8c52ff] text-white"
                          : getStepStatus(2) === "current"
                            ? "bg-white dark:bg-gray-800 border-2 border-[#6a5acd] text-[#6a5acd]"
                            : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-400"
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-medium mt-2 ${
                        getStepStatus(2) === "current"
                          ? "text-[#6a5acd]"
                          : getStepStatus(2) === "complete"
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      Contact Info
                    </span>
                  </div>
                </div>

                {/* Mobile progress indicator */}
                <div className="flex md:hidden justify-between items-center mb-4">
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    Step {formStep} of 2: {formStep === 1 ? "Item Details" : "Contact Info"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round((formStep / 2) * 100)}% Complete
                  </div>
                </div>
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6 md:hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0066ff] via-[#6a5acd] to-[#8c52ff] transition-all duration-500"
                    style={{ width: `${(formStep / 2) * 100}%` }}
                  ></div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <form
                ref={formBoxRef}
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                {/* Form header */}
                <div className="bg-gradient-to-r from-[#0066ff]/10 via-[#6a5acd]/10 to-[#8c52ff]/10 p-6 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formStep === 1 ? "Add your items" : "Your contact information"}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {formStep === 1
                      ? `You're currently adding ${getItems().length} item${getItems().length > 1 ? "s" : ""}`
                      : "Let us know how to reach you and arrange pickup"}
                  </p>
                </div>

                <div className="p-6 md:p-8">
                  {formStep === 1 && (
                    <div className="space-y-6">
                      {/* Items list */}
                      <div className="space-y-6">
                        {getItems().map((item, index) => (
                          <Card
                            key={item.id}
                            id={item.id}
                            className={`border ${
                              item.isValid ? "border-gray-200 dark:border-gray-700" : "border-[#0066ff]/30"
                            } transition-all duration-300 hover:shadow-md bg-white dark:bg-gray-800 rounded-lg overflow-hidden`}
                          >
                            <CardHeader className="bg-gradient-to-r from-[#0066ff]/10 via-[#6a5acd]/10 to-[#8c52ff]/10 py-3 px-4 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between items-center">
                                <div>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-4 w-4 text-[#6a5acd]" />
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
                                  <Label
                                    htmlFor={`item-name-${index}`}
                                    className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100"
                                  >
                                    Item Name <span className="text-red-500">*</span>
                                  </Label>
                                  <input
                                    id={`item-name-${index}`}
                                    value={item.name || ""}
                                    onChange={(e) => handleNameChange(e, index)}
                                    placeholder="e.g., Leather Sofa, Samsung TV"
                                    className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#0066ff]/30 focus:border-[#0066ff]/70 relative z-30"
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
                                      className="mt-3 p-3 bg-[#6a5acd]/5 border border-[#6a5acd]/20 rounded-lg cursor-pointer hover:bg-[#6a5acd]/10 transition-colors duration-200"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <Wand2 className="h-4 w-4 text-[#6a5acd]" />
                                        <span className="text-sm font-medium text-[#6a5acd]">
                                          Suggested Description
                                        </span>
                                        <span className="text-xs bg-[#6a5acd]/10 text-[#6a5acd] px-2 py-0.5 rounded-full">
                                          Click to Apply
                                        </span>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{item.nameSuggestion}</p>
                                    </div>
                                  )}
                                </div>

                                <div className="transition-all duration-300">
                                  <div className="flex justify-between items-center mb-2">
                                    <Label
                                      htmlFor={`item-description-${index}`}
                                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                                    >
                                      Brief Description <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {(item.description || "").length} characters
                                    </div>
                                  </div>
                                  <textarea
                                    id={`item-description-${index}`}
                                    value={item.description || ""}
                                    onChange={(e) => handleDescriptionChange(e, index)}
                                    placeholder="Describe your item in detail including brand, model, size, color, etc."
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#0066ff]/30 focus:border-[#0066ff]/70 relative z-30"
                                    required
                                  />
                                </div>

                                <div className="transition-all duration-300">
                                  <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
                                    Item Condition <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="grid grid-cols-5 gap-2">
                                    {/* Clickable condition options */}
                                    <div
                                      className={`flex flex-col items-center p-3 rounded-md border ${
                                        item.condition === "like-new"
                                          ? "border-[#0066ff] bg-[#0066ff]/5 dark:bg-[#0066ff]/20"
                                          : "border-gray-200 dark:border-gray-700"
                                      } cursor-pointer hover:border-[#0066ff] hover:bg-[#0066ff]/5 dark:hover:bg-[#0066ff]/10 transition-all shadow-sm`}
                                      onClick={() => handleConditionSelect(index, "like-new")}
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "like-new"
                                            ? "bg-gradient-to-r from-[#0066ff] to-[#6a5acd] text-white"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                        }`}
                                      >
                                        <Sparkles className="w-4 h-4" />
                                      </div>
                                      <Label
                                        htmlFor={`condition-like-new-${index}`}
                                        className="text-xs font-medium cursor-pointer text-center"
                                      >
                                        Like New
                                      </Label>
                                    </div>

                                    <div
                                      className={`flex flex-col items-center p-3 rounded-md border ${
                                        item.condition === "excellent"
                                          ? "border-[#3a7bff] bg-[#3a7bff]/5 dark:bg-[#3a7bff]/20"
                                          : "border-gray-200 dark:border-gray-700"
                                      } cursor-pointer hover:border-[#3a7bff] hover:bg-[#3a7bff]/5 dark:hover:bg-[#3a7bff]/10 transition-all shadow-sm`}
                                      onClick={() => handleConditionSelect(index, "excellent")}
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "excellent"
                                            ? "bg-gradient-to-r from-[#3a7bff] to-[#6a5acd] text-white"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                        }`}
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </div>
                                      <Label
                                        htmlFor={`condition-excellent-${index}`}
                                        className="text-xs font-medium cursor-pointer text-center"
                                      >
                                        Excellent
                                      </Label>
                                    </div>

                                    <div
                                      className={`flex flex-col items-center p-3 rounded-md border ${
                                        item.condition === "good"
                                          ? "border-[#6a5acd] bg-[#6a5acd]/5 dark:bg-[#6a5acd]/20"
                                          : "border-gray-200 dark:border-gray-700"
                                      } cursor-pointer hover:border-[#6a5acd] hover:bg-[#6a5acd]/5 dark:hover:bg-[#6a5acd]/10 transition-all shadow-sm`}
                                      onClick={() => handleConditionSelect(index, "good")}
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "good"
                                            ? "bg-gradient-to-r from-[#6a5acd] to-[#7a6ad8] text-white"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                        }`}
                                      >
                                        <Check className="w-4 h-4" />
                                      </div>
                                      <Label
                                        htmlFor={`condition-good-${index}`}
                                        className="text-xs font-medium cursor-pointer text-center"
                                      >
                                        Good
                                      </Label>
                                    </div>

                                    <div
                                      className={`flex flex-col items-center p-3 rounded-md border ${
                                        item.condition === "fair"
                                          ? "border-[#7a6ad8] bg-[#7a6ad8]/5 dark:bg-[#7a6ad8]/20"
                                          : "border-gray-200 dark:border-gray-700"
                                      } cursor-pointer hover:border-[#7a6ad8] hover:bg-[#7a6ad8]/5 dark:hover:bg-[#7a6ad8]/10 transition-all shadow-sm`}
                                      onClick={() => handleConditionSelect(index, "fair")}
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "fair"
                                            ? "bg-gradient-to-r from-[#7a6ad8] to-[#8c52ff] text-white"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                        }`}
                                      >
                                        <Info className="w-4 h-4" />
                                      </div>
                                      <Label
                                        htmlFor={`condition-fair-${index}`}
                                        className="text-xs font-medium cursor-pointer text-center"
                                      >
                                        Fair
                                      </Label>
                                    </div>

                                    <div
                                      className={`flex flex-col items-center p-3 rounded-md border ${
                                        item.condition === "poor"
                                          ? "border-[#8c52ff] bg-[#8c52ff]/5 dark:bg-[#8c52ff]/20"
                                          : "border-gray-200 dark:border-gray-700"
                                      } cursor-pointer hover:border-[#8c52ff] hover:bg-[#8c52ff]/5 dark:hover:bg-[#8c52ff]/10 transition-all shadow-sm`}
                                      onClick={() => handleConditionSelect(index, "poor")}
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "poor"
                                            ? "bg-gradient-to-r from-[#8c52ff] to-[#9d47ff] text-white"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                        }`}
                                      >
                                        <AlertCircle className="w-4 h-4" />
                                      </div>
                                      <Label
                                        htmlFor={`condition-poor-${index}`}
                                        className="text-xs font-medium cursor-pointer text-center"
                                      >
                                        Poor
                                      </Label>
                                    </div>
                                  </div>
                                </div>

                                <div className="transition-all duration-300">
                                  <div className="flex justify-between items-center mb-2">
                                    <Label
                                      htmlFor={`item-issues-${index}`}
                                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                                    >
                                      Any issues or defects? <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {(item.issues || "").length} characters
                                    </div>
                                  </div>
                                  <textarea
                                    id={`item-issues-${index}`}
                                    value={item.issues || ""}
                                    onChange={(e) => handleIssuesChange(e, index)}
                                    placeholder="Please describe any scratches, dents, missing parts, or functional issues. If none, please write 'None'."
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#0066ff]/30 focus:border-[#0066ff]/70 relative z-30"
                                    required
                                  />
                                </div>

                                <div className="transition-all duration-300">
                                  <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">
                                    Item Photos <span className="text-red-500">*</span>{" "}
                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                      (at least 3)
                                    </span>
                                  </Label>

                                  {/* File upload */}
                                  <div
                                    onClick={() => fileInputRefs.current[`item-${index}`]?.click()}
                                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 border-gray-300 dark:border-gray-700 hover:border-[#6a5acd] bg-[#f8fafc] dark:bg-gray-900 hover:bg-[#6a5acd]/5 dark:hover:bg-[#6a5acd]/10"
                                  >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                      <ImageIcon className="w-6 h-6 text-[#6a5acd]/70" />
                                      <p className="font-medium text-sm text-[#6a5acd]">Click to Upload Images</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                                            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"  width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-8 w-8 text-gray-400">
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
                                              className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-red-500 rounded-full p-0.5 w-5 h-5 flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700"
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
                                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${
                                          (item.photos || []).length >= 3
                                            ? "bg-green-500"
                                            : "bg-gradient-to-r from-[#0066ff] via-[#6a5acd] to-[#8c52ff]"
                                        }`}
                                        style={{ width: `${Math.min(100, ((item.photos || []).length / 3) * 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>

                                {/* Price Estimator */}
                                <div className="transition-all duration-300 mt-4">
                                  <div className="flex justify-between items-center">
                                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      Estimated Value
                                    </Label>
                                    <PriceEstimatorDialog
                                      description={`${item.name || ""} ${item.description || ""} Condition: ${item.condition || "unknown"} Issues: ${item.issues || "none"}`}
                                      onPriceEstimated={(price) => handlePriceEstimated(item.id, price)}
                                      buttonClassName="text-[#6a5acd] border-[#6a5acd]/30 hover:bg-[#6a5acd]/10"
                                      itemId={item.id}
                                    />
                                  </div>

                                  {estimatedPrices[item.id] ? (
                                    <div className="mt-2 p-3 bg-[#6a5acd]/5 border border-[#6a5acd]/20 rounded-lg">
                                      <div className="flex items-center gap-2 mb-1">
                                        <DollarSign className="h-4 w-4 text-[#6a5acd]" />
                                        <span className="text-sm font-medium text-[#6a5acd]">Estimated Value</span>
                                      </div>
                                      <p className="text-lg font-semibold">{estimatedPrices[item.id]}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        This is an AI-generated estimate based on your item description.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Click "Estimate Price" to get an AI-powered value estimate for this item.
                                      </p>
                                    </div>
                                  )}
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
                                  {estimatedPrices[item.id] && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Estimated Value:</span>
                                      <span className="text-muted-foreground">{estimatedPrices[item.id]}</span>
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
                          className="bg-[#6a5acd]/10 text-[#6a5acd] hover:bg-[#6a5acd]/20 border border-[#6a5acd]/20 transition-all duration-300"
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
                          className="bg-gradient-to-r from-[#0066ff] to-[#6a5acd] hover:from-[#0066ff]/90 hover:to-[#6a5acd]/90 text-white px-6 py-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow flex items-center gap-2 font-medium text-sm"
                        >
                          <span>Continue</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {formStep === 2 && (
                    <div className="space-y-6">
                      <div className="transition-all">
                        <Label
                          htmlFor="full-name"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100"
                        >
                          <User className="w-4 h-4 text-[#6a5acd]" />
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
                          className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a5acd] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#6a5acd]/30 focus:border-[#6a5acd]/70 relative z-30"
                          required
                          ref={fullNameInputRef}
                        />
                        {formErrors.fullName && <ErrorMessage message={formErrors.fullName} />}
                      </div>

                      <div className="transition-all">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100"
                        >
                          <Mail className="w-4 h-4 text-[#6a5acd]" />
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
                          className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a5acd] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#6a5acd]/30 focus:border-[#6a5acd]/70 relative z-30"
                          required
                        />
                        {formErrors.email && <ErrorMessage message={formErrors.email} />}
                      </div>

                      <div className="transition-all">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100"
                        >
                          <Phone className="w-4 h-4 text-[#6a5acd]" />
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
                          className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a5acd] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#6a5acd]/30 focus:border-[#6a5acd]/70 relative z-30"
                          required
                        />
                        {formErrors.phone && <ErrorMessage message={formErrors.phone} />}
                      </div>

                      <div className="transition-all">
                        <Label
                          htmlFor="pickup_date"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100"
                        >
                          <Calendar className="w-4 h-4 text-[#6a5acd]" />
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
                          className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a5acd] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 hover:border-[#6a5acd]/30 focus:border-[#6a5acd]/70 relative z-30"
                          required
                        />
                        {formErrors.pickupDate && <ErrorMessage message={formErrors.pickupDate} />}
                      </div>

                      {/* Address Autocomplete */}
                      <div className="transition-all">
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
                      <div className="transition-all">
                        <div className="bg-[#f8fafc] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                            <DollarSign className="w-4 h-4 text-[#6a5acd]" />
                            <span>Items Summary ({getItems().length})</span>
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-white">Items:</span>{" "}
                                {getItems().length} items
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span className="font-medium text-gray-900 dark:text-white">Names:</span>{" "}
                                {getItems()
                                  .map((item) => item.name || "Unnamed Item")
                                  .join(", ")}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Item Details:</p>
                              <Accordion type="single" collapsible className="w-full">
                                {getItems().map((item, index) => (
                                  <AccordionItem key={item.id} value={`item-${index}`}>
                                    <AccordionTrigger className="text-sm hover:no-underline py-2">
                                      <span className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-[#6a5acd]" />
                                        {item.name || `Item ${index + 1}`}
                                      </span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="pt-2">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          <span className="font-medium text-gray-900 dark:text-white">Condition:</span>{" "}
                                          {item.condition
                                            ? item.condition
                                                .split("-")
                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(" ")
                                            : "Not specified"}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          <span className="font-medium text-gray-900 dark:text-white">
                                            Description:
                                          </span>{" "}
                                          {item.description || "No description provided"}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          <span className="font-medium text-gray-900 dark:text-white">Issues:</span>{" "}
                                          {item.issues || "None specified"}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          <span className="font-medium text-gray-900 dark:text-white">Photos:</span>{" "}
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

                      <div className="mt-6 transition-all">
                        <div className="p-4 rounded-md bg-[#f8fafc] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="consent"
                              name="consent"
                              checked={termsAccepted}
                              onCheckedChange={setTermsAccepted}
                              className={`mt-1 border-[#6a5acd] text-[#6a5acd] focus-visible:ring-[#6a5acd] ${formErrors.terms ? "border-red-300" : ""}`}
                              required
                            />
                            <div>
                              <Label htmlFor="consent" className="font-medium text-gray-900 dark:text-white">
                                I consent to being contacted by BluBerry <span className="text-red-500">*</span>
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                By submitting this form, you agree to our{" "}
                                <Link
                                  href="/privacy-policy"
                                  className="text-[#0066ff] underline hover:text-[#6a5acd] transition-colors"
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
                            setFormStep(1)
                            scrollToFormTop()
                          }}
                          className="px-6 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-medium text-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>

                        <Button
                          type="submit"
                          disabled={!step2Valid || isSubmitting}
                          className="bg-gradient-to-r from-[#6a5acd] to-[#8c52ff] hover:from-[#6a5acd]/90 hover:to-[#8c52ff]/90 text-white px-8 py-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow relative overflow-hidden"
                        >
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
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0066ff]/10 via-[#6a5acd]/10 to-[#8c52ff]/10 p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Submission Received</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Thank you for your submission. We'll be in touch soon.
                </p>
              </div>

              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#0066ff]/10 via-[#6a5acd]/10 to-[#8c52ff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-[#6a5acd]" />
                </div>

                <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#0066ff] via-[#6a5acd] to-[#8c52ff] bg-clip-text text-transparent">
                  Thank You!
                </h2>

                <div className="w-16 h-0.5 mx-auto mb-6 bg-gradient-to-r from-[#0066ff] via-[#6a5acd] to-[#8c52ff] rounded-full"></div>

                <p className="text-base mb-8 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                  We've received your submission and will review your item details. You can expect to hear from us
                  within 24 hours with a price offer.
                </p>

                <div className="bg-[#f8fafc] dark:bg-gray-800 p-6 rounded-md max-w-md mx-auto flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#6a5acd] flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                    We've sent a confirmation email to{" "}
                    <span className="font-medium text-gray-900 dark:text-white">{email}</span> with the details of your
                    submission.
                  </p>
                </div>

                <Button
                  asChild
                  className="mt-8 bg-gradient-to-r from-[#0066ff] to-[#6a5acd] hover:from-[#0066ff]/90 hover:to-[#6a5acd]/90"
                >
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </ContentAnimation>
        )}
      </div>
    </div>
  )
}
