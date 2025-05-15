import FormSubmitWithAction from "@/components/form-submit-with-action"

export const metadata = {
  title: "Submit Your Item - Server Action",
  description: "Submit your item using Next.js Server Actions.",
}

export default function SubmitWithActionPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Submit Your Item</h1>
      <FormSubmitWithAction />
    </div>
  )
}
