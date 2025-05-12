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
  const { theme } = useTheme()

  // Apply custom styles to Google Places Autocomplete dropdown
  useEffect(() => {
    // Add custom styles for the Google Places Autocomplete dropdown
    const style = document.createElement("style")
    style.textContent = `
      /* Base styles for the dropdown */
      .pac-container {
        border-radius: 0.375rem;
        border: 1px solid hsl(var(--border));
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        font-family: var(--font-poppins), -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        z-index: 9999 !important;
        width: 240px !important;
        max-height: 300px;
        overflow-y: auto;
        /* Remove default positioning - will be set by JavaScript */
        position: absolute !important;
        margin-top: 2px !important;
      }
      
      .pac-item {
        padding: 4px 8px;
        cursor: pointer;
        font-size: 0.75rem;
        border-top: 1px solid hsl(var(--border));
        line-height: 1.2;
      }
      
      .pac-item:first-child {
        border-top: none;
      }
      
      .pac-item:hover {
        background-color: rgba(59, 130, 246, 0.05);
      }
      
      .pac-item-query {
        font-size: 0.75rem;
        padding-right: 3px;
      }
      
      .pac-icon {
        display: none;
      }
      
      .pac-item-selected, .pac-item-selected:hover {
        background-color: rgba(59, 130, 246, 0.1);
      }
      
      .pac-matched {
        font-weight: 600;
      }
      
      .pac-logo:after {
        margin-right: 5px;
        margin-bottom: 3px;
        height: 14px;
        padding-right: 3px;
        background-size: 50px 14px;
      }
      
      /* Dark mode styles */
      .dark .pac-container {
        background-color: hsl(var(--background));
        border-color: hsl(var(--border));
      }
      
      .dark .pac-item {
        border-color: hsl(var(--border));
        color: hsl(var(--foreground));
      }
      
      .dark .pac-item:hover {
        background-color: hsl(var(--accent));
      }
      
      .dark .pac-item-query {
        color: hsl(var(--foreground));
      }
      
      .dark .pac-matched {
        color: hsl(var(--primary));
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Function to position the dropdown
  const positionDropdown = () => {
    const pacContainers = document.querySelectorAll(".pac-container")
    if (!inputRef.current || pacContainers.length === 0) return

    const inputRect = inputRef.current.getBoundingClientRect()

    pacContainers.forEach((container) => {
      // Apply theme
      if (theme === "dark") {
        container.classList.add("dark")
      } else {
        container.classList.remove("dark")
      }

      // Position the dropdown
      const containerEl = container as HTMLElement

      // Calculate the right-aligned position
      // This positions the dropdown so its right edge aligns with the input's right edge
      const rightAlignedLeft = inputRect.right - 240 // 240px is the dropdown width

      // Make sure it doesn't go off-screen to the left
      const safeLeft = Math.max(10, rightAlignedLeft)

      // Position below the input but aligned to the right
      containerEl.style.left = `${safeLeft}px`
      containerEl.style.top = `${inputRect.bottom + window.scrollY}px`
    })
  }

  // Reposition dropdown when it appears
  useEffect(() => {
    // Create a mutation observer to watch for the dropdown being added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check if any of the added nodes is a .pac-container
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === "DIV" && (node as HTMLElement).classList.contains("pac-container")) {
              positionDropdown()
            }
          })
        }
      })
    })

    // Start observing the document body for added nodes
    observer.observe(document.body, {
      childList: true,
      subtree: false,
    })

    // Also reposition on window resize
    window.addEventListener("resize", positionDropdown)

    // And on scroll
    window.addEventListener("scroll", positionDropdown)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", positionDropdown)
      window.removeEventListener("scroll", positionDropdown)
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

      // When the dropdown opens, position it correctly
      inputRef.current.addEventListener("focus", () => {
        // Small delay to ensure the dropdown has been created
        setTimeout(positionDropdown, 300)
      })

      // Also position on input
      inputRef.current.addEventListener("input", () => {
        setTimeout(positionDropdown, 300)
      })
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
