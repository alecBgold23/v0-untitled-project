import { EbayDescriptionGenerator } from "@/components/ebay-description-generator"

export const metadata = {
  title: "eBay Description Generator | Blueberry",
  description: "Generate professional eBay-style descriptions for your items",
}

export default function EbayDescriptionPage() {
  return (
    <div className="container max-w-4xl py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">eBay Description Generator</h1>
        <p className="text-muted-foreground">
          Create professional, detailed descriptions for your eBay listings with AI assistance.
        </p>
      </div>

      <EbayDescriptionGenerator />

      <div className="mt-8 text-sm text-muted-foreground">
        <p>
          This tool uses AI to generate professional eBay-style descriptions based on your item details. You can edit
          the generated description before using it in your listing.
        </p>
      </div>
    </div>
  )
}
