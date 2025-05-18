"use client"

import { useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"
import Script from "next/script"
import { useTheme } from "next-themes"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  label?: string
  placeholder?: string
}

export default function AddressAutocomplete({
  value,
  onChange,
  error,
  required = false,
  label = "Address",
  placeholder = "Start typing your address...",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<MutationObserver | null>(null)
  const { theme } = useTheme()

  // Function to position the dropdown
  const positionDropdown = () => {
    if (!inputRef.current) return

    const pacContainers = document.querySelectorAll(".pac-container")
    if (pacContainers.length === 0) return

    const rect = inputRef.current.getBoundingClientRect()

    pacContainers.forEach((container) => {
      const containerEl = container as HTMLElement

      // Set a fixed width for the dropdown (keeping it small)
      containerEl.style.width = "240px"

      // Calculate center position based on input field and shift left by ~1.5cm (57px)
      const centerPosition = rect.left + rect.width / 2 - 120 - 57 // 120px is half of 240px width

      // Ensure the dropdown doesn't go off-screen
      const safeLeft = Math.max(10, Math.min(centerPosition, window.innerWidth - 240 - 10))

      // Position below the input and centered
      containerEl.style.left = `${safeLeft}px`
      containerEl.style.top = `${rect.bottom + window.scrollY}px`

      // Apply dark mode with black background
      if (theme === "dark") {
        containerEl.style.backgroundColor = "#000000"
        containerEl.style.color = "#ffffff"
        containerEl.style.borderColor = "#333333"
        containerEl.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 1px #333333"
      } else {
        containerEl.style.backgroundColor = "#ffffff"
        containerEl.style.color = "#000000"
        containerEl.style.borderColor = "#e5e7eb"
        containerEl.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)"
      }

      // Professional styling
      containerEl.style.maxHeight = "300px"
      containerEl.style.overflowY = "auto"
      containerEl.style.borderRadius = "0.5rem"
      containerEl.style.zIndex = "9999"
      containerEl.style.padding = "4px 0"
      containerEl.style.backdropFilter = "blur(8px)"
      containerEl.style.transition = "box-shadow 0.2s ease, border-color 0.2s ease"
    })
  }

  // Set up the observer to watch for dropdown changes
  useEffect(() => {
    // Disconnect any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Create a new observer
    observerRef.current = new MutationObserver((mutations) => {
      // Check if any mutations involve the pac-container
      const shouldReposition = mutations.some((mutation) => {
        // Check added nodes
        if (mutation.addedNodes.length > 0) {
          return Array.from(mutation.addedNodes).some(
            (node) => node.nodeName === "DIV" && (node as HTMLElement).classList?.contains("pac-container"),
          )
        }

        // Check if the mutation target is a pac-container or contains one
        if (mutation.target.nodeName === "DIV") {
          return (
            (mutation.target as HTMLElement).classList?.contains("pac-container") ||
            (mutation.target as HTMLElement).querySelector(".pac-container")
          )
        }

        return false
      })

      if (shouldReposition) {
        positionDropdown()
      }
    })

    // Start observing the document body
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    })

    // Clean up on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [theme])

  // Handle window events
  useEffect(() => {
    const handleResize = () => positionDropdown()
    const handleScroll = () => positionDropdown()

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Apply custom styles to Google Places Autocomplete dropdown items
  useEffect(() => {
    const styleId = "address-autocomplete-item-styles"

    // Remove existing style
    const existingStyle = document.getElementById(styleId)
    if (existingStyle) {
      existingStyle.remove()
    }

    // Create new style for dropdown items only (not positioning)
    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      .pac-container {
        border: ${theme === "dark" ? "1px solid #333333" : "1px solid rgba(0, 0, 0, 0.08)"} !important;
      }
      
      .pac-item {
        padding: 10px 12px !important;
        cursor: pointer !important;
        font-size: 0.875rem !important;
        border-top: 1px solid ${theme === "dark" ? "#222222" : "#f0f0f0"} !important;
        line-height: 1.5 !important;
        transition: background-color 0.15s ease !important;
      }
      
      .pac-item:first-child {
        border-top: none !important;
      }
      
      .pac-item:hover {
        background-color: ${theme === "dark" ? "#111111" : "#f8f9fa"} !important;
      }
      
      .pac-item-query {
        font-size: 0.875rem !important;
        padding-right: 3px !important;
        color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
        font-weight: 500 !important;
      }
      
      .pac-icon {
        display: none !important;
      }
      
      .pac-item-selected, .pac-item-selected:hover {
        background-color: ${theme === "dark" ? "#1a1a1a" : "#f0f0f0"} !important;
      }
      
      .pac-matched {
        font-weight: 600 !important;
        color: ${theme === "dark" ? "#60a5fa" : "#2563eb"} !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      if (document.getElementById(styleId)) {
        document.getElementById(styleId)?.remove()
      }
    }
  }, [theme])

  // Function to initialize Google Places Autocomplete
  function initAutocomplete() {
    if (!inputRef.current || !window.google?.maps?.places) return

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "us" },
      })

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (place.formatted_address) {
          onChange(place.formatted_address)
        }
      })

      // Set up input event listeners
      if (inputRef.current) {
        // When the input gets focus
        inputRef.current.addEventListener("focus", positionDropdown)

        // When the user types
        inputRef.current.addEventListener("input", () => {
          // Use setTimeout to ensure the dropdown has updated
          setTimeout(positionDropdown, 10)
          setTimeout(positionDropdown, 100)
          setTimeout(positionDropdown, 300)
        })

        // When the user presses a key
        inputRef.current.addEventListener("keydown", () => {
          setTimeout(positionDropdown, 10)
        })
      }
    } catch (error) {
      console.error("Error initializing Google Maps Places Autocomplete:", error)
    }
  }

  // Handle script load
  const handleScriptLoad = () => {
    if (window.google?.maps?.places) {
      initAutocomplete()
    }
  }

  // Initialize autocomplete when component mounts and Google Maps is loaded
  useEffect(() => {
    if (window.google?.maps?.places) {
      initAutocomplete()
    }
    // Add global event listener for when the script loads
    window.initGoogleMapsCallback = initAutocomplete

    return () => {
      // Clean up
      delete window.initGoogleMapsCallback
    }
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <Script
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCxwq9A8sJNJDat1Jflacrr5gWmJmts03M&libraries=places&callback=initGoogleMapsCallback"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      {label && (
        <Label htmlFor="address-autocomplete" className="text-sm font-medium mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        </Label>
      )}

      <Input
        ref={inputRef}
        id="address-autocomplete"
        name="address"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border ${
          error ? "border-red-300" : "border-input"
        } rounded-lg focus-visible:ring-[#3b82f6] bg-background shadow-sm transition-all duration-200`}
        required={required}
      />

      {error && (
        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// Add the global type declaration
declare global {
  interface Window {
    google: any
    initGoogleMapsCallback: () => void
  }
}
