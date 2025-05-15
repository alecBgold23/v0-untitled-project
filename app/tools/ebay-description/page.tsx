import { EbayDescriptionGenerator } from "@/components/ebay-description-generator"

export const metadata = {
  title: "eBay Description Generator",
  description: "Generate professional eBay listings with detailed titles and descriptions",
}

export default function EbayDescriptionPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">eBay Description Generator</h1>
          <p className="mt-2 text-muted-foreground">Create professional eBay listings with just a few clicks</p>
        </div>

        <EbayDescriptionGenerator />

        <div className="mt-10 space-y-4 text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">Tips for Great eBay Listings</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Be specific with your item name (e.g., "iPhone 13 Pro" instead of just "iPhone")</li>
            <li>Select the accurate condition to get the most relevant description</li>
            <li>Edit the generated description to add any specific details about your item</li>
            <li>Add high-quality photos to your eBay listing</li>
            <li>Double-check all specifications to ensure accuracy</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
