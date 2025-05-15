import ItemFormWithImage from "@/components/item-form-with-image"

export default function SubmitItemWithImagePage() {
  return (
    <div className="container max-w-2xl py-12">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Submit Your Item</h1>
          <p className="text-muted-foreground">Fill out the form below to submit your item with an image.</p>
        </div>
        <ItemFormWithImage />
      </div>
    </div>
  )
}
