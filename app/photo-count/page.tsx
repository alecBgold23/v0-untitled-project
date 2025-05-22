import type { Metadata } from "next"
import PhotoCountManager from "@/components/photo-count-manager"
import EnvBucketUploader from "@/components/env-bucket-uploader"

export const metadata: Metadata = {
  title: "Photo Count Manager",
  description: "Manage and verify photo counts for items",
}

export default function PhotoCountPage() {
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Photo Count Manager</h1>
        <p className="text-gray-500">Verify and update photo counts for items</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Check Photo Count</h2>
          <PhotoCountManager />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Upload Photos</h2>
          <EnvBucketUploader />
        </div>
      </div>
    </div>
  )
}
