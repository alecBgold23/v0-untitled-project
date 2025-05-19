"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PricingKeyStatusProps {
  className?: string
}

export function PricingKeyStatus({ className = "" }: PricingKeyStatusProps) {
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading")
  const [message, setMessage] = useState<string>("Checking pricing API key...")

  useEffect(() => {
    const checkPricingKey = async () => {
      try {
        const response = await fetch("/api/check-openai-key?type=pricing", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (response.ok && data.valid) {
          setStatus("valid")
          setMessage("Pricing API key is valid")
        } else {
          setStatus("invalid")
          setMessage(data.message || "Pricing API key is invalid or missing")
        }
      } catch (error) {
        setStatus("invalid")
        setMessage("Failed to check pricing API key")
        console.error("Error checking pricing API key:", error)
      }
    }

    checkPricingKey()
  }, [])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center ${className}`}>
            <Badge
              variant={status === "valid" ? "success" : status === "invalid" ? "destructive" : "outline"}
              className="flex items-center gap-1"
            >
              {status === "loading" && <Loader2 className="h-3 w-3 animate-spin" />}
              {status === "valid" && <CheckCircle className="h-3 w-3" />}
              {status === "invalid" && <AlertCircle className="h-3 w-3" />}
              <span>Pricing API</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
