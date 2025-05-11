"use client"

import { useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"
import Script from "next/script"

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
