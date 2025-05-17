"use client"

import { ReliableImageUpload } from "@/components/reliable-image-upload"

export default function DebugImageUploadPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Debug Image Upload</h1>
      <p className="mb-6">
        This page helps diagnose issues with Supabase image uploads. It provides both client-side and server-side upload
        options and detailed error reporting.
      </p>

      <div className="flex justify-center">
        <ReliableImageUpload
          userId="debug-user"
          onUploadComplete={(result) => {
            console.log("Upload completed:", result)
          }}
        />
      </div>
    </div>
  )
}
