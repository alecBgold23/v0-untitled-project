import { Suspense } from "react"
import SellMultipleItemsForm from "@/components/sell-multiple-items-form"

export const metadata = {
  title: "Sell Your Items - Blueberry",
  description: "Sell multiple items quickly and easily",
}

// Remove any blocking data fetching and make the page render immediately
export default function SellMultipleItemsPage() {
  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="animate-pulse max-w-2xl mx-auto">
            <div className="h-32 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        }
      >
        <SellMultipleItemsForm />
      </Suspense>
    </div>
  )
}
