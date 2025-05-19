"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Import the loading component
import Loading from "./loading"

// Dynamically import the form component with SSR disabled
const SellMultipleItemsForm = dynamic(() => import("@/components/sell-multiple-items-form"), {
  ssr: false, // This is allowed in a client component
  loading: () => <Loading />,
})

export default function ClientFormWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <SellMultipleItemsForm />
    </Suspense>
  )
}
