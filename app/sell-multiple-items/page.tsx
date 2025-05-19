import ClientFormWrapper from "./client-wrapper"

export default function SellMultipleItemsPage() {
  return <ClientFormWrapper />
}

// Force dynamic rendering to avoid static prerendering issues
export const dynamic = "force-dynamic"
