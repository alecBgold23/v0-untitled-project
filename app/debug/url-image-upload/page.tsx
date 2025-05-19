"use client"

import { UrlImageUploader } from "@/components/url-image-uploader"

export default function UrlImageUploadPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Upload Image from URL</h1>
      <p className="mb-6 text-muted-foreground">
        This tool allows you to upload images to Supabase storage directly from a URL.
      </p>

      <div className="flex justify-center">
        <UrlImageUploader
          userId="demo-user"
          onUploadComplete={(result) => {
            console.log("Upload completed:", result)
          }}
        />
      </div>
    </div>
  )
}
