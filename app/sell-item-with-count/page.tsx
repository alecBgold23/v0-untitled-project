import SellItemForm from "@/components/sell-item-form"

export const metadata = {
  title: "Sell an Item",
  description: "Submit your item with photos",
}

export default function SellItemPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Sell Your Item</h1>
        <p className="text-gray-500">Fill out the form below to list your item for sale</p>
      </div>

      <SellItemForm />
    </div>
  )
}
