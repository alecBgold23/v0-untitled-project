import { PriceEstimator } from "@/components/price-estimator"

export const metadata = {
  title: "Price Estimator | BluBerry",
  description: "Get an estimated price range for your items",
}

export default function PriceEstimatorPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-[#0066ff] to-transparent"></div>
            <span className="mx-3 text-xs font-semibold uppercase tracking-wider text-[#6a5acd]">Pricing Tool</span>
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#8c52ff]"></div>
          </div>

          <h1 className="font-bold text-3xl md:text-4xl tracking-tight mb-3 bg-gradient-to-r from-[#0066ff] via-[#6a5acd] to-[#8c52ff] bg-clip-text text-transparent">
            Item Price Estimator
          </h1>

          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">
            Get an AI-powered estimate of your item's value based on its description.
          </p>
        </div>

        <PriceEstimator />

        <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0066ff]/10 flex items-center justify-center text-[#0066ff] font-semibold">
                1
              </div>
              <div>
                <h3 className="font-medium">Describe Your Item</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Provide as many details as possible about your item, including brand, condition, age, and any special
                  features.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#6a5acd]/10 flex items-center justify-center text-[#6a5acd] font-semibold">
                2
              </div>
              <div>
                <h3 className="font-medium">Get an Estimate</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our AI analyzes your description and compares it with market data to generate a price range estimate.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8c52ff]/10 flex items-center justify-center text-[#8c52ff] font-semibold">
                3
              </div>
              <div>
                <h3 className="font-medium">Make Informed Decisions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use the estimate to help set your selling price or determine if an item is worth selling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
