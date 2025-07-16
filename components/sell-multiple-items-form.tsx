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
  Plus,
  Trash2,
  Copy,
  Wand2,
  DollarSign,
  Camera,
  Upload,
  LinkIcon,
  ExternalLink,
  ShoppingCart,
} from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import { useToast } from "@/hooks/use-toast"
import AddressAutocomplete from "@/components/address-autocomplete"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sellMultipleItems } from "../app/actions/sell-multiple-items"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getEbayPriceEstimate } from "@/lib/ebay-price-estimator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

// Function to create correct image URL with bucket name
function createCorrectImageUrl(filePath: string): string {
  if (!filePath) return ""

  // Extract project ID from Supabase URL
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  if (!projectId) return ""

  // Remove any leading slashes from filePath
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath

  // Return the correct URL format with item_images bucket
  return `https://${projectId}.supabase.supabase.co/storage/v1/object/public/item_images/${cleanPath}`
}

// Function to upload image to Supabase via server action
async function uploadImageToSupabase(file: File, userId = "anonymous") {
  try {
    // Validate file
    if (!file) {
      throw new Error("No file provided")
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB")
    }

    console.log("Uploading to item_images bucket via server action:", file.name)

    // Convert file to FormData for server upload
    const formData = new FormData()
    formData.append("file", file)
    formData.append("userId", userId)

    // Upload via server action
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed: ${errorText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Upload failed")
    }

    console.log("Upload successful!")
    console.log("File path:", result.path)
    console.log("Public URL:", result.url)

    return {
      success: true,
      path: result.path,
      url: result.url,
      publicUrl: result.url,
      bucket: "item_images",
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    }
  }
}

export default function SellMultipleItemsForm() {
  const { toast } = useToast()
  const [formStep, setFormStep] = useState(1)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)
  const [activeTab, setActiveTab] = useState("upload")
  // Add this to the state declarations at the top of the component
  const [emailStatus, setEmailStatus] = useState({
    userEmailSent: false,
    adminEmailSent: false,
  })

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

  // Price estimate state
  const [priceEstimates, setPriceEstimates] = useState([])
  const [totalEstimate, setTotalEstimate] = useState({ price: "$0", minPrice: 0, maxPrice: 0 })
  const [isCalculatingPrices, setIsCalculatingPrices] = useState(false)

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
      imageUrlInput: "",
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

  // State for duplication dialog
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
  const [itemIndexToDuplicate, setItemIndexToDuplicate] = useState<number | null>(null)
  const [duplicateCount, setDuplicateCount] = useState(1)

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

      // Check if there are at least 3 photos/images
      const totalImages = (item.photos?.length || 0) + (item.imageUrl ? 1 : 0)
      const hasImages = totalImages >= 3

      const isValid =
        item.name?.trim() !== "" &&
        item.description?.trim() !== "" &&
        hasImages &&
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

  // NEW: Calculate price estimates using PRICING_OPENAI_API_KEY as primary method
  const calculatePriceEstimates = useCallback(async () => {
    try {
      const items = getItems()
      if (items.length === 0) return

      setIsCalculatingPrices(true)
      console.log("Starting PRICING_OPENAI_API_KEY-first price estimation for", items.length, "items")

      const newEstimates = []

      // Process each item with PRICING_OPENAI_API_KEY as primary
      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        try {
          console.log(`Estimating price for item ${i + 1}:`, item.name)

          // Try PRICING_OPENAI_API_KEY first (primary method)
          let estimate
          try {
            const response = await fetch("/api/estimate-price", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                itemName: item.name || "",
                briefDescription: item.description || "",
                condition: item.condition || "good",
                issues: item.issues || "",
                category: "auto-detect",
                usePricingKey: true, // Force use of PRICING_OPENAI_API_KEY
              }),
            })

            if (response.ok) {
              const data = await response.json()
              if (data.price && !data.error) {
                estimate = {
                  price: typeof data.price === "number" ? `$${data.price}` : data.price,
                  minPrice: data.minPrice || Math.round(data.price * 0.8),
                  maxPrice: data.maxPrice || Math.round(data.price * 1.2),
                  confidence: "high",
                  source: "pricing_openai_primary",
                  reasoning: data.reasoning || "AI-powered price estimation",
                  referenceCount: 1,
                }
                console.log(`PRICING_OPENAI estimate for item ${i + 1}:`, estimate)
              }
            }
          } catch (pricingOpenaiError) {
            console.log(`PRICING_OPENAI failed for item ${i + 1}, trying standard OpenAI:`, pricingOpenaiError)
          }

          // If PRICING_OPENAI failed, try standard OpenAI as secondary
          if (!estimate) {
            try {
              const response = await fetch("/api/estimate-price", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  itemName: item.name || "",
                  briefDescription: item.description || "",
                  condition: item.condition || "good",
                  issues: item.issues || "",
                  category: "auto-detect",
                  usePricingKey: false, // Use standard OPENAI_API_KEY
                }),
              })

              if (response.ok) {
                const data = await response.json()
                if (data.price && !data.error) {
                  estimate = {
                    price: typeof data.price === "number" ? `$${data.price}` : data.price,
                    minPrice: data.minPrice || Math.round(data.price * 0.8),
                    maxPrice: data.maxPrice || Math.round(data.price * 1.2),
                    confidence: "medium",
                    source: "openai_secondary",
                    reasoning: data.reasoning || "AI-powered price estimation",
                    referenceCount: 1,
                  }
                  console.log(`Standard OpenAI estimate for item ${i + 1}:`, estimate)
                }
              }
            } catch (openaiError) {
              console.log(`Standard OpenAI failed for item ${i + 1}, trying eBay fallback:`, openaiError)
            }
          }

          // If both OpenAI methods failed, try eBay as final fallback
          if (!estimate) {
            try {
              const ebayEstimate = await getEbayPriceEstimate(
                item.name || "",
                item.description || "",
                item.condition || "good",
                item.issues || "",
              )

              estimate = {
                ...ebayEstimate,
                source: "ebay_fallback",
                confidence: "low",
              }
              console.log(`eBay fallback estimate for item ${i + 1}:`, estimate)
            } catch (ebayError) {
              console.error(`All pricing methods failed for item ${i + 1}:`, ebayError)
            }
          }

          // Final fallback if everything fails
          if (!estimate) {
            estimate = {
              price: "$25",
              minPrice: 20,
              maxPrice: 30,
              confidence: "low",
              source: "system_fallback",
              reasoning: "Default estimate - all pricing services unavailable",
              referenceCount: 0,
            }
          }

          newEstimates.push(estimate)
        } catch (itemError) {
          console.error(`Error estimating price for item ${i + 1}:`, itemError)

          // Fallback estimate for this item
          newEstimates.push({
            price: "$25",
            minPrice: 20,
            maxPrice: 30,
            confidence: "low",
            source: "error_fallback",
            reasoning: "Error occurred during estimation",
            referenceCount: 0,
          })
        }
      }

      setPriceEstimates(newEstimates)

      // Calculate total estimate
      const totalMin = newEstimates.reduce((sum, est) => sum + (est.minPrice || 0), 0)
      const totalMax = newEstimates.reduce((sum, est) => sum + (est.maxPrice || 0), 0)
      const totalPrice = `$${Math.round((totalMin + totalMax) / 2)}`

      // Determine overall confidence based on source quality
      const pricingOpenaiCount = newEstimates.filter((e) => e.source === "pricing_openai_primary").length
      const openaiCount = newEstimates.filter((e) => e.source === "openai_secondary").length
      const totalCount = newEstimates.length

      let overallConfidence = "low"
      if (pricingOpenaiCount / totalCount >= 0.7) {
        overallConfidence = "high"
      } else if ((pricingOpenaiCount + openaiCount) / totalCount >= 0.5) {
        overallConfidence = "medium"
      }

      setTotalEstimate({
        price: totalPrice,
        minPrice: totalMin,
        maxPrice: totalMax,
        confidence: overallConfidence,
      })

      console.log("Price estimation complete. Total:", totalPrice)
    } catch (error) {
      console.error("Error calculating price estimates:", error)
      toast({
        title: "Price Estimation Error",
        description: "Unable to calculate price estimates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCalculatingPrices(false)
    }
  }, [getItems, toast])

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

  // Update price estimates when items change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculatePriceEstimates()
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [itemsVersion, calculatePriceEstimates])

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
        imageUrlInput: "",
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

  // Duplicate an item (now accepts count)
  const duplicateItem = useCallback(
    (index: number, count: number) => {
      try {
        const items = getItems()
        const itemToDuplicate = items[index]
        if (!itemToDuplicate) return

        const newItemsToAdd = []
        for (let i = 0; i < count; i++) {
          const newItem = {
            ...itemToDuplicate,
            id: "item-" + Date.now() + "-" + i, // Ensure unique ID for each duplicated item
            isExpanded: true,
            photos: [...(itemToDuplicate.photos || [])],
            nameSuggestion: "",
            isLoadingSuggestion: false,
            lastProcessedName: "",
            imagePath: "",
            imageUrl: "",
            imageUrlInput: "",
          }
          newItemsToAdd.push(newItem)
        }

        const updatedItems = [...items]
        updatedItems.splice(index + 1, 0, ...newItemsToAdd)
        setItems(updatedItems)

        // Scroll to the first new item after it's added
        if (newItemsToAdd.length > 0) {
          setTimeout(() => {
            const element = document.getElementById(newItemsToAdd[0].id)
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          }, 100)
        }

        toast({
          title: "Item Duplicated",
          description: `${count} item${count > 1 ? "s" : ""} duplicated.`,
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

  // Function to open the duplicate dialog
  const handleDuplicateClick = useCallback((index: number) => {
    setItemIndexToDuplicate(index)
    setDuplicateCount(1) // Reset count to 1 each time dialog opens
    setIsDuplicateDialogOpen(true)
  }, [])

  // Function to confirm duplication from dialog
  const confirmDuplicate = useCallback(() => {
    if (itemIndexToDuplicate !== null && duplicateCount > 0) {
      duplicateItem(itemIndexToDuplicate, duplicateCount)
    }
    setIsDuplicateDialogOpen(false)
    setItemIndexToDuplicate(null)
    setDuplicateCount(1)
  }, [itemIndexToDuplicate, duplicateCount, duplicateItem])

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
    async (e, index) => {
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

          // Upload files to Supabase and create photo objects immediately
          const newPhotos = []

          for (const file of files) {
            try {
              // Create photo object immediately with preview URL
              let previewUrl = ""
              try {
                previewUrl = URL.createObjectURL(file)
              } catch (blobError) {
                console.warn("Could not create blob URL for preview:", blobError)
                previewUrl = "/placeholder.svg?height=96&width=96"
              }

              const photoObject = {
                file,
                name: file.name,
                id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                size: file.size,
                type: file.type,
                previewUrl: previewUrl,
                supabaseUrl: "", // Will be set after upload
                supabasePath: "", // Will be set after upload
                uploaded: false, // Will be set to true after upload
                uploading: true, // Show uploading state
              }
              newPhotos.push(photoObject)

              // Upload to Supabase in background without delay
              uploadImageToSupabase(file, email || "anonymous")
                .then((uploadResult) => {
                  if (uploadResult.success) {
                    // Update the photo object with Supabase URL
                    const currentItems = getItems()
                    const currentItem = currentItems[index]
                    if (currentItem && currentItem.photos) {
                      const updatedPhotos = currentItem.photos.map((photo) => {
                        if (photo.id === photoObject.id) {
                          return {
                            ...photo,
                            supabaseUrl: uploadResult.url,
                            supabasePath: uploadResult.path,
                            uploaded: true,
                            uploading: false,
                          }
                        }
                        return photo
                      })

                      const updatedItems = [...currentItems]
                      updatedItems[index] = {
                        ...updatedItems[index],
                        photos: updatedPhotos,
                      }
                      setItems(updatedItems)
                    }
                    console.log("Successfully uploaded:", uploadResult.url)
                  } else {
                    console.error("Upload failed:", uploadResult.error)
                    // Update photo to show error state
                    const currentItems = getItems()
                    const currentItem = currentItems[index]
                    if (currentItem && currentItem.photos) {
                      const updatedPhotos = currentItem.photos.map((photo) => {
                        if (photo.id === photoObject.id) {
                          return {
                            ...photo,
                            uploaded: false,
                            uploading: false,
                            error: true,
                          }
                        }
                        return photo
                      })

                      const updatedItems = [...currentItems]
                      updatedItems[index] = {
                        ...updatedItems[index],
                        photos: updatedPhotos,
                      }
                      setItems(updatedItems)
                    }
                    toast({
                      title: "Upload Failed",
                      description: `Failed to upload ${file.name}: ${uploadResult.error}`,
                      variant: "destructive",
                    })
                  }
                })
                .catch((uploadError) => {
                  console.error("Error uploading file:", uploadError)
                  // Update photo to show error state
                  const currentItems = getItems()
                  const currentItem = currentItems[index]
                  if (currentItem && currentItem.photos) {
                    const updatedPhotos = currentItem.photos.map((photo) => {
                      if (photo.id === photoObject.id) {
                        return {
                          ...photo,
                          uploaded: false,
                          uploading: false,
                          error: true,
                        }
                      }
                      return photo
                    })

                    const updatedItems = [...currentItems]
                    updatedItems[index] = {
                      ...updatedItems[index],
                      photos: updatedPhotos,
                    }
                    setItems(updatedItems)
                  }
                  toast({
                    title: "Upload Error",
                    description: `Error uploading ${file.name}`,
                    variant: "destructive",
                  })
                })
            } catch (error) {
              console.error("Error processing file:", error)
            }
          }

          if (newPhotos.length > 0) {
            // Add to item photos immediately
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
          }
        }
      } catch (error) {
        console.error("Error adding files:", error)
        toast({
          title: "Error",
          description: "There was a problem uploading your files. Please try again.",
          variant: "destructive",
        })
      }
    },
    [getItems, setItems, toast, validateItem, email],
  )

  // Handle image URL input for a specific item
  const handleImageUrlInput = useCallback(
    (e, index) => {
      const value = e.target.value
      updateItemField(index, "imageUrlInput", value)
    },
    [updateItemField],
  )

  // Add image URL to an item
  const addImageUrl = useCallback(
    (index) => {
      try {
        const items = getItems()
        const item = items[index]
        if (!item) return

        const imageUrl = item.imageUrlInput?.trim()
        if (!imageUrl) {
          toast({
            title: "Empty URL",
            description: "Please enter a valid image URL.",
            variant: "destructive",
          })
          return
        }

        // Basic URL validation
        try {
          new URL(imageUrl)
        } catch (e) {
          toast({
            title: "Invalid URL",
            description: "Please enter a valid URL including http:// or https://",
            variant: "destructive",
          })
          return
        }

        // Update the item with the image URL
        const updatedItems = [...items]
        updatedItems[index] = {
          ...updatedItems[index],
          imageUrl: imageUrl,
          imageUrlInput: "", // Clear the input field
        }
        setItems(updatedItems)

        // Validate the item after adding the image URL
        setTimeout(() => validateItem(updatedItems[index], index), 100)

        toast({
          title: "Image URL Added",
          description: "The image URL has been added to your item.",
          variant: "default",
        })
      } catch (error) {
        console.error("Error adding image URL:", error)
        toast({
          title: "Error",
          description: "There was a problem adding the image URL. Please try again.",
          variant: "destructive",
        })
      }
    },
    [getItems, setItems, toast, validateItem],
  )

  // Remove image URL from an item
  const removeImageUrl = useCallback(
    (index) => {
      try {
        const updatedItems = [...getItems()]
        if (!updatedItems[index]) return

        updatedItems[index] = {
          ...updatedItems[index],
          imageUrl: "",
        }
        setItems(updatedItems)

        // Validate the item after removing the image URL
        setTimeout(() => validateItem(updatedItems[index], index), 100)
      } catch (error) {
        console.error("Error removing image URL:", error)
      }
    },
    [getItems, setItems, validateItem],
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

  // Upload images for all items - now they're already uploaded to Supabase
  const prepareItemsForSubmission = useCallback(async () => {
    try {
      const items = getItems()
      const updatedItems = [...items]

      // Process each item to collect image URLs
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!item) continue

        // Create arrays to store image paths and URLs
        const imagePaths = []
        const imageUrls = []

        // If the item has an image URL, add it directly
        if (item.imageUrl && item.imageUrl.trim() !== "") {
          imagePaths.push(item.imageUrl)
          imageUrls.push(item.imageUrl)
        }

        // Collect URLs from uploaded photos (they're already uploaded to Supabase)
        if (item.photos && item.photos.length > 0) {
          for (const photo of item.photos) {
            if (photo.supabaseUrl) {
              imagePaths.push(photo.supabasePath || "")
              imageUrls.push(photo.supabaseUrl)
            }
          }
        }

        // Update the item with all image paths and URLs
        updatedItems[i] = {
          ...updatedItems[i],
          imagePaths: imagePaths,
          imageUrls: imageUrls,
          // Keep the first image as the main image for backward compatibility
          imagePath: imagePaths.length > 0 ? imagePaths[0] : "",
          // Set imageUrl to the array of URLs (not a comma-separated string)
          imageUrl: imageUrls, // This is now an array
          // Add a flag to indicate images were processed
          imagesProcessed: true,
        }
      }

      // Update items with image paths and URLs
      setItems(updatedItems)
      return updatedItems
    } catch (error) {
      console.error("Error preparing items for submission:", error)
      toast({
        title: "Preparation Error",
        description: "There was a problem preparing your items for submission.",
        variant: "destructive",
      })
      return getItems()
    }
  }, [getItems, setItems, toast])

  // Complete form submission
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

      // Prepare items (images are already uploaded)
      const itemsWithImages = await prepareItemsForSubmission()

      // Check if any items have images
      const hasAnyImages = itemsWithImages.some(
        (item) =>
          (item.imagePaths && item.imagePaths.length > 0) ||
          item.imagePath ||
          (item.imageUrl && item.imageUrl.trim() !== ""),
      )

      if (!hasAnyImages) {
        console.warn("No images found. Proceeding with submission anyway.")
        toast({
          title: "Warning",
          description: "No images were found. Your items will be submitted without images.",
          variant: "warning",
        })
      }

      // Format items for submission
      const formattedItems = itemsWithImages.map((item, index) => ({
        name: item.name || "",
        description: item.description || "",
        condition: item.condition || "",
        issues: item.issues || "", // This will map to item_issues in the database
        photos: (item.photos || []).map((photo) => ({
          name: photo.name || "",
          type: photo.type || "",
          size: photo.size || 0,
          supabaseUrl: photo.supabaseUrl || "",
        })),
        // Single image fields for backward compatibility
        imagePath: item.imagePaths && item.imagePaths.length > 0 ? item.imagePaths[0] : "",
        // This imageUrl is now an array of URLs
        imageUrl: item.imageUrls || [], // Pass as array, not comma-separated string
        // Multiple image fields
        imagePaths: item.imagePaths || [],
        imageUrls: item.imageUrls || [],
        estimatedPrice: priceEstimates[index]?.price || totalEstimate.price || "$0", // Include the price estimate
      }))

      // Submit to Supabase
      const result = await sellMultipleItems(formattedItems, {
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

      // Check if emails were sent successfully
      let emailMessage = ""
      if (result.userEmailSent && result.adminEmailSent) {
        emailMessage = "Confirmation emails have been sent to you and our team."
      } else if (result.userEmailSent) {
        emailMessage = "A confirmation email has been sent to your email address."
      } else if (result.adminEmailSent) {
        emailMessage = "Our team has been notified of your submission."
      } else {
        emailMessage = "Your items were submitted successfully, but confirmation emails could not be sent."
      }

      // Set form as submitted
      setFormSubmitted(true)
      // Scroll to top after submission is successful
      setTimeout(scrollToTop, 50)
      setIsSubmitting(false)

      toast({
        title: "Success!",
        description: `Your items have been submitted successfully. ${emailMessage}`,
        variant: "default",
      })

      // Add this inside the completeFormSubmission function after the successful submission
      setEmailStatus({
        userEmailSent: result.userEmailSent || false,
        adminEmailSent: result.adminEmailSent || false,
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
  }, [
    address,
    email,
    fullName,
    getItems,
    phone,
    pickupDate,
    priceEstimates,
    scrollToTop,
    toast,
    totalEstimate.price,
    prepareItemsForSubmission,
  ])

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      e.stopPropagation()

      if (validateStep2()) {
        // Ensure phone is not empty before submission
        if (!phone || phone.trim() === "") {
          setFormErrors((prev) => ({ ...prev, phone: "Phone number is required" }))
          toast({
            title: "Validation Error",
            description: "Please enter a valid phone number.",
            variant: "destructive",
          })
          return
        }

        // Proceed directly to form submission without phone verification
        await completeFormSubmission()
      }
    },
    [completeFormSubmission, validateStep2, phone, toast, setFormErrors],
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
        // Revoke all created object URLs safely
        const items = getItems()
        items.forEach((item) => {
          if (item && item.photos) {
            item.photos.forEach((photo) => {
              if (photo && photo.previewUrl && photo.previewUrl.startsWith("blob:")) {
                try {
                  URL.revokeObjectURL(photo.previewUrl)
                } catch (err) {
                  console.warn("Could not revoke blob URL:", err)
                }
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

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950"
      ref={formContainerRef}
    >
      {/* Add a ref at the top of the form for scrolling */}
      <div ref={formTopRef} className="scroll-target"></div>

      <div className="container mx-auto px-4 py-8 md:py-12 page-transition-wrapper">
        <ContentAnimation>
          {/* Professional Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-3">
              <div className="h-px w-8 bg-gradient-to-r from-blue-500 to-transparent"></div>
              <span className="mx-3 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Sell Your Item
              </span>
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-purple-500"></div>
            </div>

            <h1 className="font-bold text-3xl md:text-4xl tracking-tight mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              Get Cash for Your Items
            </h1>

            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm">
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
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2"></div>
                  <div
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 -translate-y-1/2 transition-all duration-500"
                    style={{ width: formStep === 1 ? "0%" : "100%" }}
                  ></div>

                  {/* Step 1 */}
                  <div className="flex flex-col items-center relative bg-slate-50 dark:bg-slate-950 px-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
                        getStepStatus(1) === "complete"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          : getStepStatus(1) === "current"
                            ? "bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-500"
                            : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-400"
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
                          ? "text-blue-500"
                          : getStepStatus(1) === "complete"
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Item Details
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center relative bg-slate-50 dark:bg-slate-950 px-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
                        getStepStatus(2) === "complete"
                          ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white"
                          : getStepStatus(2) === "current"
                            ? "bg-white dark:bg-slate-800 border-2 border-purple-500 text-purple-500"
                            : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-400"
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-medium mt-2 ${
                        getStepStatus(2) === "current"
                          ? "text-purple-500"
                          : getStepStatus(2) === "complete"
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      Contact Info
                    </span>
                  </div>
                </div>

                {/* Mobile progress indicator */}
                <div className="flex md:hidden justify-between items-center mb-4">
                  <div className="text-base font-medium text-slate-900 dark:text-white">
                    Step {formStep} of 2: {formStep === 1 ? "Item Details" : "Contact Info"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {Math.round((formStep / 2) * 100)}% Complete
                  </div>
                </div>
                <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6 md:hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${(formStep / 2) * 100}%` }}
                  ></div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <form
                ref={formBoxRef}
                onSubmit={handleSubmit}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                {/* Form header */}
                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-violet-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-violet-950/30 p-6 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {formStep === 1 ? "Add your items" : "Your contact information"}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
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
                              item.isValid
                                ? "border-slate-200 dark:border-slate-700"
                                : "border-blue-300 dark:border-blue-700"
                            } transition-all duration-300 hover:shadow-md bg-white dark:bg-slate-900 rounded-lg overflow-hidden`}
                          >
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 py-3 px-4 border-b border-slate-200 dark:border-slate-800">
                              <div className="flex justify-between items-center">
                                <div>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-4 w-4 text-blue-500" />
                                    Item {index + 1}
                                    {item.isValid && (
                                      <Badge variant="success" className="ml-2">
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Complete
                                      </Badge>
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
                                    size="sm" // Changed size to sm for better fit with text
                                    onClick={() => handleDuplicateClick(index)}
                                    className="h-7 w-auto px-2" // Adjust width and padding for text
                                    title="Choose quantity of item" // Updated title
                                    aria-label="Choose quantity of item" // Added aria-label for accessibility
                                  >
                                    <Copy className="h-3 w-3 mr-1" /> {/* Keep icon, add margin */}
                                    <span className="text-xs">Choose Quantity</span> {/* New text */}
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
                                    className="text-sm font-medium mb-2 block text-slate-900 dark:text-slate-100"
                                  >
                                    Item Name <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id={`item-name-${index}`}
                                    value={item.name || ""}
                                    onChange={(e) => handleNameChange(e, index)}
                                    placeholder="e.g., Leather Sofa, Samsung TV"
                                    className="transition-all duration-200"
                                    required
                                  />

                                  {/* Smart name suggestion */}
                                  {item.isLoadingSuggestion && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      <span>Generating suggestion...</span>
                                    </div>
                                  )}

                                  {item.nameSuggestion && (
                                    <div
                                      onClick={() => applySuggestion(index)}
                                      className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <Wand2 className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                          Suggested Description
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                        >
                                          Click to Apply
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {item.nameSuggestion}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="transition-all duration-300">
                                  <div className="flex justify-between items-center mb-2">
                                    <Label
                                      htmlFor={`item-description-${index}`}
                                      className="text-sm font-medium text-slate-900 dark:text-slate-100"
                                    >
                                      Brief Description <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      {(item.description || "").length} characters
                                    </div>
                                  </div>
                                  <Textarea
                                    id={`item-description-${index}`}
                                    value={item.description || ""}
                                    onChange={(e) => handleDescriptionChange(e, index)}
                                    placeholder="Describe your item in detail including brand, model, size, color, etc."
                                    rows={3}
                                    className="transition-all duration-200"
                                    required
                                  />
                                </div>

                                <div className="transition-all duration-300">
                                  <Label className="text-sm font-medium mb-2 block text-slate-900 dark:text-slate-100">
                                    Item Condition <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="grid grid-cols-5 gap-2">
                                    {/* Clickable condition options */}
                                    <div
                                      className={`flex flex-col items-center p-3 rounded-md border ${
                                        item.condition === "like-new"
                                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                          : "border-slate-200 dark:border-slate-700"
                                      } cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all shadow-sm`}
                                      onClick={() => handleConditionSelect(index, "like-new")}
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "like-new"
                                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
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
                                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                          : "border-slate-200 dark:border-slate-700"
                                      } cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all shadow-sm`}
                                      onClick={() => handleConditionSelect(index, "excellent")}
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "excellent"
                                            ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
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
                                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                          : "border-slate-200 dark:border-slate-700"
                                      } cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all shadow-sm`}
                                      onClick={() => handleConditionSelect(index, "good")}
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "good"
                                            ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
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
                                          ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                                          : "border-slate-200 dark:border-slate-700"
                                      } cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all shadow-sm`}
                                      onClick={() => handleConditionSelect(index, "fair")}
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "fair"
                                            ? "bg-gradient-to-r from-purple-400 to-violet-400 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
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
                                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                                          : "border-slate-200 dark:border-slate-700"
                                      } cursor-pointer hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all shadow-sm`}
                                      onClick={() => handleConditionSelect(index, "poor")}
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                          item.condition === "poor"
                                            ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
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
                                      className="text-sm font-medium text-slate-900 dark:text-slate-100"
                                    >
                                      Any issues or defects? <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      {(item.issues || "").length} characters
                                    </div>
                                  </div>
                                  <Textarea
                                    id={`item-issues-${index}`}
                                    value={item.issues || ""}
                                    onChange={(e) => handleIssuesChange(e, index)}
                                    placeholder="Please describe any scratches, dents, missing parts, or functional issues. If none, please write 'None'."
                                    rows={3}
                                    className="transition-all duration-200"
                                    required
                                  />
                                </div>

                                <div className="transition-all duration-300 mt-4">
                                  <Label className="text-sm font-medium mb-2 block text-slate-900 dark:text-slate-100">
                                    Item Photos <span className="text-red-500">*</span>{" "}
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                      (at least 3 required)
                                    </span>
                                  </Label>

                                  <Tabs
                                    defaultValue="upload"
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                    className="w-full"
                                  >
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                      <TabsTrigger value="upload" className="flex items-center gap-2">
                                        <Camera className="h-4 w-4" />
                                        <span>Upload Photos</span>
                                      </TabsTrigger>
                                      <TabsTrigger value="url" className="flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4" />
                                        <span>Image URL</span>
                                      </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="upload" className="mt-0">
                                      {/* File upload */}
                                      <div
                                        onClick={() => fileInputRefs.current[`item-${index}`]?.click()}
                                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                                      >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                            <Upload className="w-6 h-6 text-blue-500" />
                                          </div>
                                          <p className="font-medium text-sm text-blue-600 dark:text-blue-400">
                                            Click to Upload Images
                                          </p>
                                          <p className="font-medium text-xs text-slate-700 dark:text-slate-300">
                                            Upload 3 quality images
                                          </p>
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {(item.photos || []).length} photos uploaded (max 10) - uploads to
                                            item_images bucket
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
                                    </TabsContent>

                                    <TabsContent value="url" className="mt-0">
                                      <div className="space-y-4">
                                        <div className="flex gap-2">
                                          <Input
                                            value={item.imageUrlInput || ""}
                                            onChange={(e) => handleImageUrlInput(e, index)}
                                            placeholder="https://example.com/image.jpg"
                                            className="flex-1"
                                          />
                                          <Button
                                            type="button"
                                            onClick={() => addImageUrl(index)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white"
                                          >
                                            Add URL
                                          </Button>
                                        </div>

                                        {item.imageUrl && (
                                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <div className="flex justify-between items-center mb-2">
                                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                Image URL Added
                                              </span>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeImageUrl(index)}
                                                className="h-7 w-7 p-0 text-red-500"
                                              >
                                                <X className="w-4 h-4" />
                                              </Button>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 break-all">
                                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                              <span>{item.imageUrl}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </TabsContent>
                                  </Tabs>

                                  {/* Photo previews */}
                                  {item.photos && item.photos.length > 0 && (
                                    <div className="mt-4">
                                      <Label className="text-sm font-medium mb-2 block text-slate-900 dark:text-slate-100">
                                        Uploaded Photos ({item.photos.length}) - Stored in item_images bucket
                                      </Label>
                                      <div className="flex flex-wrap gap-3">
                                        {item.photos.map((photo, photoIndex) => (
                                          <div key={photo.id || photoIndex} className="relative group">
                                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                              {photo.previewUrl ? (
                                                <img
                                                  src={photo.previewUrl || "/placeholder.svg"}
                                                  alt={`Preview ${photoIndex + 1}`}
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => {
                                                    const event = e.nativeEvent || e
                                                    const target = e.currentTarget || e.target
                                                    console.error(`Error loading image ${photoIndex}:`, {
                                                      src: target?.src,
                                                      supabaseUrl: photo.supabaseUrl,
                                                      previewUrl: photo.previewUrl,
                                                      errorMessage: event?.message || "Image load failed",
                                                      errorType: event?.type || "unknown",
                                                    })
                                                    // Fallback to placeholder
                                                    if (
                                                      target &&
                                                      target.src !== "/placeholder.svg?height=96&width=96"
                                                    ) {
                                                      target.src = "/placeholder.svg?height=96&width=96"
                                                    }
                                                  }}
                                                />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                                  <ImageIcon className="h-8 w-8 text-slate-400" />
                                                </div>
                                              )}
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => removePhoto(index, photoIndex)}
                                              className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 text-red-500 rounded-full p-0.5 w-5 h-5 flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700"
                                              aria-label="Remove photo"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                            {/* Upload status indicators */}
                                            {photo.uploading && (
                                              <div className="absolute bottom-0 left-0 right-0 bg-blue-600 bg-opacity-75 text-white text-xs p-1 text-center flex items-center justify-center gap-1">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Uploading
                                              </div>
                                            )}
                                            {photo.uploaded && !photo.uploading && (
                                              <div className="absolute bottom-0 left-0 right-0 bg-green-600 bg-opacity-75 text-white text-xs p-1 text-center">
                                                Uploaded
                                              </div>
                                            )}
                                            {photo.error && !photo.uploading && (
                                              <div className="absolute bottom-0 left-0 right-0 bg-red-600 bg-opacity-75 text-white text-xs p-1 text-center">
                                                Error
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Upload progress indicator */}
                                  <div className="flex items-center gap-1 mt-3 w-full">
                                    <div className="w-full">
                                      <Progress
                                        value={Math.min(
                                          100,
                                          (((item.photos?.length || 0) + (item.imageUrl ? 1 : 0)) / 3) * 100,
                                        )}
                                        className="h-1.5"
                                        indicatorClassName={
                                          (item.photos?.length || 0) + (item.imageUrl ? 1 : 0) >= 3
                                            ? "bg-green-500"
                                            : "bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500"
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* NEW: Enhanced price estimate display with eBay data badges */}
                                {priceEstimates[index] && (
                                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                          Estimated Value
                                        </span>
                                        {/* Enhanced source badges */}
                                        {priceEstimates[index].source === "pricing_openai_primary" && (
                                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
                                            <Sparkles className="mr-1 h-3 w-3" />
                                            AI Pro (Pricing Key)
                                          </Badge>
                                        )}
                                        {priceEstimates[index].source === "openai_secondary" && (
                                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                            <Sparkles className="mr-1 h-3 w-3" />
                                            AI Standard
                                          </Badge>
                                        )}
                                        {priceEstimates[index].source === "ebay_fallback" && (
                                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                                            <ShoppingCart className="mr-1 h-3 w-3" />
                                            eBay Data (Fallback)
                                          </Badge>
                                        )}
                                        {(priceEstimates[index].source === "system_fallback" ||
                                          priceEstimates[index].source === "error_fallback") && (
                                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800">
                                            Basic Estimate
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                          {priceEstimates[index].price}
                                        </div>
                                        {priceEstimates[index].source === "content_filter" ? (
                                          <div className="text-xs text-red-600 dark:text-red-400">
                                            Content policy violation detected
                                          </div>
                                        ) : (
                                          <div className="text-xs text-slate-600 dark:text-slate-400">
                                            Range: ${priceEstimates[index].minPrice} - ${priceEstimates[index].maxPrice}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* NEW: eBay reference count */}
                                    {priceEstimates[index].source === "ebay_fallback" &&
                                      priceEstimates[index].referenceCount !== undefined && (
                                        <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                          <Info className="h-3 w-3" />
                                          <span>
                                            Based on {priceEstimates[index].referenceCount} similar eBay listings
                                          </span>
                                        </div>
                                      )}

                                    {/* Confidence indicator */}
                                    <div className="mt-2 flex items-center gap-2">
                                      <span className="text-xs text-slate-600 dark:text-slate-400">Confidence:</span>
                                      <Badge
                                        className={`text-xs ${
                                          priceEstimates[index].confidence === "high"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                            : priceEstimates[index].confidence === "medium"
                                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                              : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                                        }`}
                                      >
                                        {priceEstimates[index].confidence === "high"
                                          ? "High"
                                          : priceEstimates[index].confidence === "medium"
                                            ? "Medium"
                                            : "Low"}
                                      </Badge>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            )}

                            {!item.isExpanded && (
                              <CardContent className="pt-4">
                                <div className="flex flex-wrap gap-4 items-center">
                                  {item.name && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Name:</span>
                                      <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                                    </div>
                                  )}

                                  {item.condition && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Condition:</span>
                                      <span className="text-slate-600 dark:text-slate-300">
                                        {item.condition
                                          .split("-")
                                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                          .join(" ")}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Photos:</span>
                                    <span className="text-slate-600 dark:text-slate-300">
                                      {(item.photos?.length || 0) + (item.imageUrl ? 1 : 0)}
                                    </span>
                                  </div>

                                  {priceEstimates[index] && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Estimate:</span>
                                      <span className="text-green-600 dark:text-green-400 font-medium">
                                        {priceEstimates[index].price}
                                      </span>
                                      {priceEstimates[index].source === "pricing_openai_primary" && (
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                                          AI Pro
                                        </Badge>
                                      )}
                                      {priceEstimates[index].source === "openai_secondary" && (
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                                          AI Std
                                        </Badge>
                                      )}
                                      {priceEstimates[index].source === "ebay_fallback" && (
                                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs">
                                          eBay
                                        </Badge>
                                      )}
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
                          className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-all duration-300"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Another Item
                        </Button>
                      </div>

                      {/* NEW: Enhanced Price Estimate Section with eBay integration status */}
                      <div className="mt-6 p-6 rounded-lg border border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Total Estimated Value</h3>
                          {isCalculatingPrices && (
                            <div className="flex items-center gap-2 ml-auto">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                              <span className="text-sm text-blue-600 dark:text-blue-400">Calculating prices...</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              Based on the information you've provided, we estimate your items are worth approximately:
                            </p>
                            {/* Show pricing sources used */}
                            <div className="flex flex-wrap gap-2">
                              {priceEstimates.some((e) => e.source === "pricing_openai_primary") && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
                                  <Sparkles className="mr-1 h-3 w-3" />
                                  AI Pro (Pricing Key) - Primary
                                </Badge>
                              )}
                              {priceEstimates.some((e) => e.source === "openai_secondary") && (
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                  <Sparkles className="mr-1 h-3 w-3" />
                                  AI Standard - Secondary
                                </Badge>
                              )}
                              {priceEstimates.some((e) => e.source === "ebay_fallback") && (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                                  <ShoppingCart className="mr-1 h-3 w-3" />
                                  eBay Data (Fallback)
                                </Badge>
                              )}
                              {priceEstimates.some(
                                (e) => e.source === "system_fallback" || e.source === "error_fallback",
                              ) && (
                                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800">
                                  Basic Estimates
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                              {totalEstimate.price}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              Range: ${totalEstimate.minPrice} - ${totalEstimate.maxPrice}
                            </div>
                            <Badge
                              className={`mt-1 ${
                                totalEstimate.confidence === "high"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : totalEstimate.confidence === "medium"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                              }`}
                            >
                              <span>
                                {totalEstimate.confidence === "high"
                                  ? "High"
                                  : totalEstimate.confidence === "medium"
                                    ? "Medium"
                                    : "Low"}{" "}
                                confidence
                              </span>
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <p>
                            This estimate uses our premium AI pricing service (PRICING_OPENAI_API_KEY) as the primary
                            method, with standard AI and eBay market data as fallbacks. The final offer may vary based
                            on physical inspection. Adding more details and photos will help us provide a more accurate
                            estimate.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end mt-6">
                        <Button
                          type="button"
                          onClick={handleContinueToStep2}
                          disabled={!step1Valid}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-sm"
                        >
                          <span>Continue</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {formStep === 2 && (
                    <div className="space-y-6">
                      <div className="transition-all">
                        <Label
                          htmlFor="full-name"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-slate-900 dark:text-slate-100"
                        >
                          <User className="w-4 h-4 text-blue-500" />
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
                          className="transition-all duration-200"
                          required
                          ref={fullNameInputRef}
                        />
                        {formErrors.fullName && <ErrorMessage message={formErrors.fullName} />}
                      </div>

                      <div className="transition-all">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-slate-900 dark:text-slate-100"
                        >
                          <Mail className="w-4 h-4 text-blue-500" />
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
                          className="transition-all duration-200"
                          required
                        />
                        {formErrors.email && <ErrorMessage message={formErrors.email} />}
                      </div>

                      <div className="transition-all">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-slate-900 dark:text-slate-100"
                        >
                          <Phone className="w-4 h-4 text-blue-500" />
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
                          className="transition-all duration-200"
                          required
                        />
                        {formErrors.phone && <ErrorMessage message={formErrors.phone} />}
                      </div>

                      <div className="transition-all">
                        <Label
                          htmlFor="pickup_date"
                          className="text-sm font-medium mb-2 flex items-center gap-2 text-slate-900 dark:text-slate-100"
                        >
                          <Calendar className="w-4 h-4 text-blue-500" />
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
                            // Blur the input to make the calendar disappear
                            e.target.blur()
                          }}
                          className="transition-all duration-200"
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
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                            <Package className="w-4 h-4 text-blue-500" />
                            <span>Items Summary ({getItems().length})</span>
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                <span className="font-medium text-slate-900 dark:text-white">Total Items:</span>{" "}
                                {getItems().length}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                <span className="font-medium text-slate-900 dark:text-white">Total Value:</span>{" "}
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  {totalEstimate.price}
                                </span>
                              </p>
                              {/* Show pricing method summary */}
                              <div className="mt-2 flex flex-wrap gap-1">
                                {priceEstimates.some((e) => e.source === "pricing_openai_primary") && (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                                    <Sparkles className="mr-1 h-3 w-3" />
                                    AI Pro
                                  </Badge>
                                )}
                                {priceEstimates.some((e) => e.source === "openai_secondary") && (
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                                    AI Std
                                  </Badge>
                                )}
                                {priceEstimates.some((e) => e.source === "ebay_fallback") && (
                                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs">
                                    eBay Data
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">Item Details:</p>
                              <Accordion type="single" collapsible className="w-full">
                                {getItems().map((item, index) => (
                                  <AccordionItem
                                    key={item.id}
                                    value={`item-${index}`}
                                    className="border-slate-200 dark:border-slate-800"
                                  >
                                    <AccordionTrigger className="text-sm hover:no-underline py-2">
                                      <span className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-blue-500" />
                                        {item.name || `Item ${index + 1}`}
                                      </span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="pt-2">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                          <span className="font-medium text-slate-900 dark:text-white">Condition:</span>{" "}
                                          {item.condition
                                            ? item.condition
                                                .split("-")
                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(" ")
                                            : "Not specified"}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                          <span className="font-medium text-slate-900 dark:text-white">
                                            Description:
                                          </span>{" "}
                                          {item.description || "No description provided"}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                          <span className="font-medium text-slate-900 dark:text-white">Issues:</span>{" "}
                                          {item.issues || "None specified"}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                          <span className="font-medium text-slate-900 dark:text-white">Photos:</span>{" "}
                                          {(item.photos?.length || 0) + (item.imageUrl ? 1 : 0)}
                                        </p>
                                        {priceEstimates[index] && (
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="font-medium text-slate-900 dark:text-white text-sm">
                                              Estimate:
                                            </span>
                                            <span className="text-green-600 dark:text-green-400 text-sm">
                                              {priceEstimates[index].price}
                                            </span>
                                            {priceEstimates[index].source === "pricing_openai_primary" && (
                                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                                                AI Pro
                                              </Badge>
                                            )}
                                            {priceEstimates[index].source === "openai_secondary" && (
                                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                                                AI Std
                                              </Badge>
                                            )}
                                            {priceEstimates[index].source === "ebay_fallback" && (
                                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs">
                                                eBay
                                              </Badge>
                                            )}
                                          </div>
                                        )}
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
                        <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="consent"
                              name="consent"
                              checked={termsAccepted}
                              onCheckedChange={setTermsAccepted}
                              className={`mt-1 border-blue-500 text-blue-500 focus-visible:ring-blue-500 ${formErrors.terms ? "border-red-300" : ""}`}
                              required
                            />
                            <div>
                              <Label htmlFor="consent" className="font-medium text-slate-900 dark:text-white">
                                I consent to being contacted by BluBerry <span className="text-red-500">*</span>
                              </Label>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                By submitting this form, you agree to our{" "}
                                <Link
                                  href="/privacy-policy"
                                  className="text-blue-500 underline hover:text-blue-600 transition-colors"
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
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setFormStep(1)
                            scrollToFormTop()
                          }}
                          className="px-6 py-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 font-medium text-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </Button>

                        <Button
                          type="submit"
                          disabled={!step2Valid || isSubmitting}
                          className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-8 py-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg relative overflow-hidden"
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
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-violet-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-violet-950/30 p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Submission Received</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Thank you for your submission. We'll be in touch soon.
                </p>
              </div>

              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>

                <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                  Thank You!
                </h2>

                <div className="w-16 h-0.5 mx-auto mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 rounded-full"></div>

                <p className="text-base mb-4 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                  We've received your submission and will review your item details. You can expect to hear from us
                  within 24 hours with a price offer.
                </p>

                <p className="text-sm mb-8 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                  Your images have been stored in the{" "}
                  <span className="font-medium text-blue-600 dark:text-blue-400">item_images</span> bucket.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-md max-w-md mx-auto flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-left">
                    {submitResult && submitResult.userEmailSent ? (
                      <>
                        We've sent a confirmation email to{" "}
                        <span className="font-medium text-slate-900 dark:text-white">{email}</span> with the details of
                        your submission.
                      </>
                    ) : (
                      <>
                        Your submission was successful, but we couldn't send a confirmation email. Please keep your
                        submission reference for your records.
                      </>
                    )}
                  </p>
                </div>

                <Button
                  asChild
                  className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </ContentAnimation>
        )}
      </div>

      {/* Duplicate Item Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Duplicate Item</DialogTitle>
            <DialogDescription>How many copies of this item would you like to create?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duplicate-count" className="text-right">
                Copies
              </Label>
              <Input
                id="duplicate-count"
                type="number"
                value={duplicateCount}
                onChange={(e) => setDuplicateCount(Math.max(1, Number.parseInt(e.target.value) || 1))}
                min="1"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmDuplicate}>Duplicate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
