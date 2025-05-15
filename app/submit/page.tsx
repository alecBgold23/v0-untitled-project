import FormSubmit from "@/components/form-submit"

export const metadata = {
  title: "Submit Your Item",
  description: "Submit your item for review and listing on our platform.",
}

export default function SubmitPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Submit Your Item</h1>
      <FormSubmit />
    </div>
  )
}
