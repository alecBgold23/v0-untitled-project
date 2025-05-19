export const dynamic = "force-dynamic"

import ClientWrapper from "./client-wrapper"

export default function SellMultipleItemsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Sell Your Items</h1>
      <ClientWrapper />
    </div>
  )
}
