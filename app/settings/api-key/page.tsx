import ApiKeyForm from "@/components/api-key-form"

export const metadata = {
  title: "API Key Settings | BluBerry",
  description: "Configure your OpenAI API key for AI features",
}

export default function ApiKeyPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">API Key Settings</h1>
        <p className="text-muted-foreground mb-8 text-center">
          Configure your OpenAI API key to enable AI-powered features in BluBerry
        </p>

        <ApiKeyForm />

        <div className="mt-8 p-4 bg-secondary rounded-lg">
          <h2 className="text-lg font-medium mb-2">Why do we need your API key?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            BluBerry uses OpenAI's powerful AI models to enhance your experience. By providing your own API key:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>You maintain control over your API usage and costs</li>
            <li>Your data remains private and secure</li>
            <li>You can access the latest AI models from OpenAI</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
