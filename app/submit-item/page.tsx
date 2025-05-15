import ItemSubmissionFormWithAction from "@/components/item-submission-form-with-action"

export default function SubmitItemPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Submit Your Item</h1>
      <ItemSubmissionFormWithAction />
    </div>
  )
}
