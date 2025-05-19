export const dynamic = "force-dynamic"
export const runtime = "edge"

import ClientWrapper from "./client-wrapper"
import { PricingStatus } from "@/components/pricing-status"

export default function SellMultipleItemsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Sell Multiple Items</h1>
      <PricingStatus />
      <ClientWrapper />
    </div>
  )
}
