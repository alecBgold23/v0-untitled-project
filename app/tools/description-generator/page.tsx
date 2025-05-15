import DescriptionGenerator from "@/components/description-generator"

export default function DescriptionGeneratorPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">eBay Description Generator</h1>
        <p className="text-gray-600 mb-8">
          Create professional, detailed eBay descriptions for your listings with AI assistance. Simply enter your item
          details and condition, and our tool will generate a comprehensive description that helps your listings stand
          out.
        </p>

        <DescriptionGenerator />
      </div>
    </div>
  )
}
