import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PricingErrorProps {
  error: string
  className?: string
}

export function PricingError({ error, className = "" }: PricingErrorProps) {
  return (
    <Alert variant="destructive" className={`mt-2 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Pricing Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}
