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
  const { theme } = useTheme()

  // Apply custom styles to Google Places Autocomplete dropdown
  useEffect(() => {
    // Add custom styles for the Google Places Autocomplete dropdown
    const style = document.createElement("style")
    style.textContent = `
      /* Light mode styles */
      .pac-container {
        border-radius: 0.5rem;
        border: 1px solid hsl(var(--border));
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        font-family: var(--font-poppins), -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        margin-top: 4px;
        z-index: 9999 !important;
      }
      
      .pac-item {
        padding: 8px 12px;
        cursor: pointer;
        font-size: 0.875rem;
        border-top: 1px solid hsl(var(--border));
      }
      
      .pac-item:first-child {
        border-top: none;
      }
      
      .pac-item:hover {
        background-color: rgba(59, 130, 246, 0.05);
      }
      
      .pac-item-query {
        font-size: 0.875rem;
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

  // Update styles when theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          const pacContainers = document.querySelectorAll(".pac-container")
          pacContainers.forEach((container) => {
            if (theme === "dark") {
              container.classList.add("dark")
            } else {
              container.classList.remove("dark")
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
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
    <div className="relative">
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
