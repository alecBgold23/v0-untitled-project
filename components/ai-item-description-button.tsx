"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wand2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIItemDescriptionButtonProps {
  itemName: string
  itemCondition: string
  onDescriptionCreated: (description: string) => void
  disabled?: boolean
}

export function AIItemDescriptionButton({
  itemName,
  itemCondition,
  onDescriptionCreated,
  disabled = false,
}: AIItemDescriptionButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const createDescription = async () => {
    if (!itemName) {
      toast({
        title: "Missing information",
        description: "Please provide an item name first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Get a description from the description-suggest API
      const descResponse = await fetch("/api/description-suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: itemName,
        }),
        cache: "no-store",
      })

      if (!descResponse.ok) {
        throw new Error(`Description API returned status: ${descResponse.status}`)
      }

      const descData = await descResponse.json()

      if (descData && descData.suggestion) {
        // Add a title to the description
        const title = `# ${itemName} - ${itemCondition.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`
        const fullDescription = `${title}\n\n${descData.suggestion}`
        onDescriptionCreated(fullDescription)

        toast({
          title: "eBay listing created",
          description: "Title and description have been generated using templates.",
        })
      } else {
        throw new Error("No description returned from API")
      }
    } catch (error) {
      console.error("Error generating eBay listing:", error)

      // Generate a fallback description locally
      const fallbackTitle = `# ${itemName} - ${itemCondition.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`
      const fallbackDesc = generateLocalDescription(itemName, itemCondition)
      const fullFallback = `${fallbackTitle}\n\n${fallbackDesc}`

      onDescriptionCreated(fullFallback)

      toast({
        title: "Using local generation",
        description: "Created a listing using local templates. API connection failed.",
        variant: "default",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate a description locally
  const generateLocalDescription = (itemName: string, itemCondition?: string): string => {
    const itemNameLower = itemName.toLowerCase().trim()
    const condition = itemCondition
      ? itemCondition.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : "Excellent"

    // Check for common electronics
    if (itemNameLower.includes("iphone") || itemNameLower.includes("phone")) {
      return `## Premium Smartphone - ${condition} Condition

🔹 OVERVIEW:
This listing is for a premium smartphone in ${condition.toLowerCase()} condition. This device has been well-maintained and functions perfectly.

🔹 FEATURES & SPECIFICATIONS:
• High-quality display with vibrant colors and excellent touch response
• Powerful processor for smooth performance in all applications
• Advanced camera system for stunning photos and videos
• Long-lasting battery life for all-day usage
• Ample storage space for all your apps, photos, and videos

🔹 CONDITION DETAILS:
• ${condition} condition with minimal signs of use
• Screen is free from cracks or scratches
• All buttons and features work perfectly
• Battery health is good, holding a charge throughout the day
• Comes from a smoke-free, pet-free environment

🔹 WHAT'S INCLUDED:
• Smartphone main unit
• Charging cable and adapter
• Original packaging (where available)
• User manual (digital copy available on request)

🔹 SHIPPING & HANDLING:
• Item will be carefully packaged to ensure safe delivery
• Ships within 1-2 business days after payment
• Tracking information provided after shipping
• Insurance included for your peace of mind

Please review all photos and details before purchasing. Feel free to message with any questions!

RETURNS ACCEPTED WITHIN 30 DAYS IF ITEM IS NOT AS DESCRIBED.`
    }

    // Generic description for other items
    return `## ${itemName.charAt(0).toUpperCase() + itemName.slice(1)} - ${condition} Condition

🔹 OVERVIEW:
This listing is for a ${itemName} in ${condition.toLowerCase()} condition. This premium item has been well-maintained and functions perfectly.

🔹 FEATURES & SPECIFICATIONS:
• High-quality construction and premium materials
• Designed for reliability and exceptional performance
• Includes all standard features and functionality
• Compatible with standard accessories and add-ons
• Perfect for both casual and professional use

🔹 CONDITION DETAILS:
• ${condition} condition with minimal signs of use
• Fully functional with all features working perfectly
• No major cosmetic issues or defects
• Has been thoroughly tested and inspected
• Comes from a smoke-free, pet-free environment

🔹 WHAT'S INCLUDED:
• ${itemName} main unit
• All standard accessories and components
• Original packaging (where available)
• User manual (digital copy available on request)

🔹 SHIPPING & HANDLING:
• Item will be carefully packaged to ensure safe delivery
• Ships within 1-2 business days after payment
• Tracking information provided after shipping
• Insurance included for your peace of mind

Please review all photos and details before purchasing. Feel free to message with any questions!

RETURNS ACCEPTED WITHIN 30 DAYS IF ITEM IS NOT AS DESCRIBED.`
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={createDescription}
      disabled={disabled || isGenerating}
      className="flex items-center gap-1 text-xs"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Creating eBay Listing...</span>
        </>
      ) : (
        <>
          <Wand2 className="h-3 w-3" />
          <span>Create eBay Listing</span>
        </>
      )}
    </Button>
  )
}
