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
  buttonClassName?: string
  itemId?: string
}

export function PriceEstimatorDialog({
  description,
  onPriceEstimated,
  buttonClassName = "",
  itemId,
}: PriceEstimatorDialogProps) {
  const [open, setOpen] = useState(false)

  const handlePriceEstimated = (price: string) => {
    if (onPriceEstimated) {
      onPriceEstimated(price)
    }
    // Don't close the dialog automatically so user can see the result
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={buttonClassName}>
          <DollarSign className="h-3.5 w-3.5 mr-1" />
          Estimate Price
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Price Estimator</DialogTitle>
          <DialogDescription>
            Get an AI-powered estimate of your item's value based on its description.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <PriceEstimator initialDescription={description} onPriceEstimated={handlePriceEstimated} itemId={itemId} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
