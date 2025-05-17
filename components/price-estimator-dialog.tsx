"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PriceEstimator } from "@/components/price-estimator"
import { DollarSign } from "lucide-react"

interface PriceEstimatorDialogProps {
  description: string
  onPriceEstimated?: (price: string) => void
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  buttonClassName?: string
}

export function PriceEstimatorDialog({
  description,
  onPriceEstimated,
  buttonVariant = "outline",
  buttonSize = "sm",
  buttonClassName = "",
}: PriceEstimatorDialogProps) {
  const [open, setOpen] = useState(false)

  const handlePriceEstimated = (price: string) => {
    if (onPriceEstimated) {
      onPriceEstimated(price)
    }
    // Keep dialog open to show the result
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={`${buttonClassName}`}>
          <DollarSign className="h-4 w-4 mr-1" />
          Estimate Price
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Estimate Item Price</DialogTitle>
          <DialogDescription>Get an AI-powered estimate of your item's value</DialogDescription>
        </DialogHeader>
        <PriceEstimator initialDescription={description} onPriceEstimated={handlePriceEstimated} />
      </DialogContent>
    </Dialog>
  )
}
