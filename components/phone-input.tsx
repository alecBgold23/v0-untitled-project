"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  required?: boolean
  error?: string
  className?: string
  showCountryCode?: boolean
}

export function PhoneInput({
  value,
  onChange,
  label = "Phone Number",
  placeholder = "123456789",
  required = false,
  error,
  className = "",
  showCountryCode = true,
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState("")

  // Format the phone number for display
  useEffect(() => {
    if (!value) {
      setDisplayValue("")
      return
    }

    // If it's already formatted, keep it
    if (value.includes("(") || value.includes("-")) {
      setDisplayValue(value)
      return
    }

    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Format US number
    if (digits.length <= 10) {
      let formatted = ""

      if (digits.length > 0) {
        formatted = digits.length > 3 ? `(${digits.substring(0, 3)})` : `(${digits}`

        if (digits.length > 3) {
          formatted += ` ${digits.substring(3, 6)}`

          if (digits.length > 6) {
            formatted += `-${digits.substring(6, 10)}`
          }
        }
      }

      setDisplayValue(formatted)
    } else {
      // For international numbers, just use as is
      setDisplayValue(value)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Store raw value (strip formatting)
    const rawValue = input.replace(/\D/g, "")

    // Ensure US numbers are properly formatted
    if (rawValue.length > 0) {
      // If the user is entering a US number and it doesn't start with 1,
      // we'll assume it's a US number and add the country code
      if (rawValue.length <= 10 && !rawValue.startsWith("1")) {
        // This is a US number without country code
        onChange(rawValue)
      } else {
        // This might be an international number or US with country code
        onChange(rawValue)
      }
    } else {
      onChange("")
    }
  }

  // Format phone number to E.164 format for API
  const formatToE164 = (phone: string) => {
    if (!phone) return ""

    // Remove all non-digit characters except the leading +
    const cleaned = phone.replace(/[^\d+]/g, "")

    // If it doesn't start with +, assume it's a US number
    if (!cleaned.startsWith("+")) {
      // If it's a 10-digit US number
      if (cleaned.length === 10) {
        return `+1${cleaned}`
      }
      // If it's an 11-digit number starting with 1 (US with country code)
      else if (cleaned.length === 11 && cleaned.startsWith("1")) {
        return `+${cleaned}`
      }
      // For any other case, add + prefix
      else {
        return `+${cleaned}`
      }
    }

    return cleaned
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="phone-input" className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        {showCountryCode && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="text-sm text-muted-foreground">+1</span>
          </div>
        )}

        <Input
          id="phone-input"
          type="tel"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${showCountryCode ? "pl-10" : ""} ${error ? "border-red-300" : ""}`}
          required={required}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!error && (
        <p className="text-xs text-muted-foreground">
          {showCountryCode ? "US numbers only (+1)" : "Include country code for international numbers"}
        </p>
      )}
    </div>
  )
}

export default PhoneInput
