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
      // Generate a title and description locally without API calls
      const title = generateLocalTitle(itemName, itemCondition)
      const description = generateLocalDescription(itemName, itemCondition)

      // Combine the title and description
      const fullDescription = `${title}\n\n${description}`
      onDescriptionCreated(fullDescription)

      toast({
        title: "eBay listing created",
        description: "Title and description have been generated.",
      })
    } catch (error) {
      console.error("Error generating eBay listing:", error)
      toast({
        title: "Generation failed",
        description: "Unable to generate the eBay listing. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate a title locally without API calls
  const generateLocalTitle = (itemName: string, itemCondition?: string): string => {
    const itemNameLower = itemName.toLowerCase().trim()
    const condition = itemCondition
      ? ` - ${itemCondition.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`
      : ""

    // Titles for common items
    const titleMap: Record<string, string> = {
      oculus: `Meta Quest 3 128GB VR Headset - Complete with Controllers${condition}`,
      quest: `Meta Quest 3 128GB VR Headset - Complete with Controllers${condition}`,
      meta: `Meta Quest 3 128GB VR Headset - Complete with Controllers${condition}`,
      iphone: `Apple iPhone 14 Pro 256GB - Unlocked - Space Black${condition}`,
      playstation: `Sony PlayStation 5 Digital Edition Console - White${condition}`,
      ps5: `Sony PlayStation 5 Digital Edition Console - White${condition}`,
      xbox: `Microsoft Xbox Series X 1TB Console - Black${condition}`,
      switch: `Nintendo Switch OLED Model - White Joy-Con - Complete Set${condition}`,
      nintendo: `Nintendo Switch OLED Model - White Joy-Con - Complete Set${condition}`,
      macbook: `Apple MacBook Pro 14-inch M2 Pro (2023) 512GB 16GB RAM${condition}`,
      laptop: `Apple MacBook Pro 14-inch M2 Pro (2023) 512GB 16GB RAM${condition}`,
      airpods: `Apple AirPods Pro 2nd Generation - MagSafe Case${condition}`,
      watch: `Apple Watch Series 8 GPS 45mm Aluminum Case${condition}`,
      ipad: `Apple iPad Pro 11-inch M2 (2022) 256GB Wi-Fi${condition}`,
      tablet: `Apple iPad Pro 11-inch M2 (2022) 256GB Wi-Fi${condition}`,
      pixel: `Google Pixel 7 Pro 128GB - Hazel - Unlocked${condition}`,
      samsung: `Samsung Galaxy S23 Ultra 256GB - Phantom Black - Unlocked${condition}`,
      galaxy: `Samsung Galaxy S23 Ultra 256GB - Phantom Black - Unlocked${condition}`,
      headphones: `Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black${condition}`,
      camera: `Canon EOS R6 Mark II Mirrorless Camera - Body Only${condition}`,
      drone: `DJI Mini 3 Pro Drone with RC Smart Controller${condition}`,
      speaker: `Sonos Five Wireless Speaker - Black${condition}`,
      monitor: `LG 27GP950-B 27" UltraGear 4K UHD Gaming Monitor${condition}`,
      keyboard: `Logitech MX Mechanical Wireless Keyboard - Tactile Quiet${condition}`,
      mouse: `Logitech MX Master 3S Wireless Mouse - Graphite${condition}`,
      router: `ASUS ROG Rapture GT-AX11000 Tri-Band WiFi 6 Gaming Router${condition}`,
      printer: `Epson EcoTank ET-3850 All-in-One Wireless Printer${condition}`,
      tv: `Samsung 65" QN90B Neo QLED 4K Smart TV (2022)${condition}`,
    }

    // Check for exact matches first
    if (titleMap[itemNameLower]) {
      return titleMap[itemNameLower]
    }

    // Check for partial matches
    for (const key in titleMap) {
      if (itemNameLower.includes(key) || key.includes(itemNameLower)) {
        return titleMap[key]
      }
    }

    // Generic title for unknown items
    return `${itemName.charAt(0).toUpperCase() + itemName.slice(1)} - Premium Quality${condition}`
  }

  // Generate a description locally without API calls
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

    if (itemNameLower.includes("laptop") || itemNameLower.includes("macbook") || itemNameLower.includes("computer")) {
      return `## Premium Laptop - ${condition} Condition

🔹 OVERVIEW:
This listing is for a high-quality laptop in ${condition.toLowerCase()} condition. This device has been well-maintained and functions perfectly for all computing needs.

🔹 FEATURES & SPECIFICATIONS:
• Crisp, clear display with excellent color reproduction
• Fast processor for smooth multitasking and productivity
• Comfortable keyboard with responsive keys
• Long battery life for on-the-go usage
• Multiple ports for all your connectivity needs

🔹 CONDITION DETAILS:
• ${condition} condition with minimal signs of previous use
• Screen displays clear, vibrant images with no dead pixels
• Keyboard and trackpad respond perfectly
• All ports are fully functional
• Battery still holds a good charge

🔹 WHAT'S INCLUDED:
• Laptop main unit
• Power adapter and charging cable
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
