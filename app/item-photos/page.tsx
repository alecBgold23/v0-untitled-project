import type { Metadata } from "next"
import ItemPhotoUploader from "@/components/item-photo-uploader"
import PhotoCountManager from "@/components/photo-count-manager"

export const metadata: Metadata = {
  title: "Item Photos Manager",
  description: "Upload and manage photos for items",
}

export default function ItemPhotosPage() {
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Item Photos Manager</h1>
        <p className="text-gray-500">Upload and manage photos for your items</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upload Photos</h2>
          <ItemPhotoUploader />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Check Photo Count</h2>
          <PhotoCountManager />
        </div>
      </div>
    </div>
  )
}
