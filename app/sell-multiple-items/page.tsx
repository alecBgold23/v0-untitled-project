import ClientWrapper from "./client-wrapper"
import { Suspense } from "react"

export default function SellMultipleItemsPage() {
  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading form...</p>
            </div>
          </div>
        }
      >
        <ClientWrapper />
      </Suspense>
    </div>
  )
}
