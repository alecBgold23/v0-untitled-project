import EbayPriceTester from "@/components/ebay-price-tester"

export const metadata = {
  title: "eBay Price Test",
  description: "Test the eBay integration for price estimation",
}

export default function EbayPriceTestPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">eBay Price Test</h1>
        <p className="text-muted-foreground mb-6">
          Test the eBay integration for price estimation using the Browse API and OpenAI
        </p>

        <EbayPriceTester />

        <div className="mt-8 text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>How it works:</strong> This tool searches eBay for similar items, extracts pricing data, and uses
            OpenAI to generate an accurate price estimate based on the comparables.
          </p>
          <p>
            <strong>Note:</strong> For best results, provide a specific item name and select the appropriate condition.
            Category IDs can be found in the eBay category hierarchy.
          </p>
        </div>
      </div>
    </div>
  )
}
