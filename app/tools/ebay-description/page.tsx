import { EbayDescriptionGenerator } from "@/components/ebay-description-generator"

export const metadata = {
  title: "eBay Description Generator | Blueberry",
  description: "Generate professional eBay-style descriptions for your items",
}

export default function EbayDescriptionPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">eBay Description Generator</h1>
      <p className="text-muted-foreground mb-8">
        Enter your item details below to generate a professional eBay listing description.
      </p>
      <EbayDescriptionGenerator />
    </div>
  )
}
