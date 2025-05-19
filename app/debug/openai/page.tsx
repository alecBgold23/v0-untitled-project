import { OpenAIAPIStatus } from "@/components/openai-api-status"
import { PricingKeyStatus } from "@/components/pricing-key-status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function OpenAIDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">OpenAI API Debug</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Main OpenAI API Key Status</CardTitle>
            <CardDescription>Used for general AI features like description generation</CardDescription>
          </CardHeader>
          <CardContent>
            <OpenAIAPIStatus />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing OpenAI API Key Status</CardTitle>
            <CardDescription>Used specifically for the price estimator feature</CardDescription>
          </CardHeader>
          <CardContent>
            <PricingKeyStatus />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>OpenAI API key configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Required Environment Variables:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <code>OPENAI_API_KEY</code> - For general AI features
                  </li>
                  <li>
                    <code>PRICING_OPENAI_API_KEY</code> - For price estimation
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Troubleshooting:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Verify that the environment variables are set correctly</li>
                  <li>Check that the API keys are valid and have not expired</li>
                  <li>Ensure the API keys have the necessary permissions</li>
                  <li>Check for rate limiting issues if the keys were working previously</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
