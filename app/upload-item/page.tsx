import { SimpleItemUpload } from "@/components/simple-item-upload"

export const metadata = {
  title: "Upload Item",
  description: "Upload an item with an image",
}

export default function UploadItemPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Upload an Item</h1>
      <SimpleItemUpload />
    </div>
  )
}
