import { PriceEstimationStatus } from "@/components/price-estimation-status"

export default function OpenAIStatusPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">OpenAI API Status</h1>
      <div className="max-w-2xl">
        <PriceEstimationStatus />
      </div>
    </div>
  )
}
