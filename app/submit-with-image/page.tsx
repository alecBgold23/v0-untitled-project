import ItemUploadForm from "@/components/item-upload-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Submit Item with Image | BluBerry",
  description: "Submit your item with an image for evaluation",
}

export default function SubmitWithImagePage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Submit Your Item</CardTitle>
            <CardDescription>
              Fill out the form below to submit your item with an image for evaluation. We'll review your submission and
              get back to you with an offer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">How it works</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700 dark:text-blue-400">
                  <li>Submit your item details and upload a clear image</li>
                  <li>Our team will evaluate your item</li>
                  <li>We'll email you a price offer within 24 hours</li>
                  <li>If you accept, we'll schedule a pickup and pay you on the spot</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <ItemUploadForm />
      </div>
    </div>
  )
}
