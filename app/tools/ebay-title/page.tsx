import { EbayDescriptionGenerator } from "@/components/ebay-title-generator"

export default function EbayTitlePage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">eBay Title Generator</h1>
        <p className="text-muted-foreground mb-8">
          Create professional, optimized eBay titles for your listings with AI assistance. Simply enter your item
          details and condition, and our tool will generate a concise, search-friendly title that helps your listings
          stand out.
        </p>

        <EbayDescriptionGenerator />
      </div>
    </div>
  )
}
