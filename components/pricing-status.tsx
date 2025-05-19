"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function PricingStatus() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const checkPricingStatus = async () => {
      try {
        const res = await fetch("/api/debug-pricing")

        if (res.ok) {
          const data = await res.json()
          if (data.status === "ok" && data.test?.price) {
            setStatus("online")
            setMessage(`Pricing API is online. Test price: ${data.test.price}`)
          } else {
            setStatus("offline")
            setMessage("Pricing API returned an invalid response")
          }
        } else {
          setStatus("offline")
          setMessage(`Pricing API returned status ${res.status}`)
        }
      } catch (error) {
        setStatus("offline")
        setMessage("Could not connect to pricing API")
        console.error("Error checking pricing status:", error)
      }
    }

    checkPricingStatus()
  }, [])

  if (status === "loading") {
    return null
  }

  return (
    <Alert variant={status === "online" ? "default" : "destructive"} className="mb-4">
      {status === "online" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <AlertTitle>{status === "online" ? "Pricing API Online" : "Pricing API Offline"}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
