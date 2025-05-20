"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnvVarCheck } from "@/components/env-var-check"

export default function ApiStatusPage() {
  const ebayVariables = ["EBAY_CLIENT_ID", "EBAY_CLIENT_SECRET", "EBAY_OAUTH_TOKEN", "EBAY_BROWSE_API_ENDPOINT"]

  const pricingVariables = ["PRICING_OPENAI_API_KEY", "OPENAI_API_KEY"]

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">API Integrations Status Dashboard</h1>

      <Tabs defaultValue="ebay" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ebay">eBay Integration</TabsTrigger>
          <TabsTrigger value="pricing">Pricing API</TabsTrigger>
          <TabsTrigger value="all">All Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="ebay" className="space-y-6">
          <EnvVarCheck
            title="eBay API Configuration"
            description="Check if eBay Developer API credentials are properly set"
            variables={ebayVariables}
          />

          <div className="text-sm text-gray-500 space-y-2">
            <h3 className="font-medium">Troubleshooting eBay Integration:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Ensure your eBay Developer credentials are correct. Check in the
                <a
                  href="https://developer.ebay.com/my/keys"
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {" "}
                  eBay Developer Portal
                </a>
                .
              </li>
              <li>
                Make sure you've added the right scopes to your OAuth application. For the Browse API, you need
                <code className="bg-gray-100 dark:bg-gray-800 p-1 rounded text-xs">
                  https://api.ebay.com/oauth/api_scope
                </code>
                .
              </li>
              <li>
                The EBAY_BROWSE_API_ENDPOINT should usually be{" "}
                <code className="bg-gray-100 dark:bg-gray-800 p-1 rounded text-xs">
                  https://api.ebay.com/buy/browse/v1
                </code>
                .
              </li>
              <li>
                Visit the{" "}
                <a href="/debug/ebay-integration" className="text-blue-500 hover:underline">
                  eBay Integration Debug
                </a>{" "}
                page for more detailed testing.
              </li>
            </ol>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <EnvVarCheck
            title="Pricing API Configuration"
            description="Check if pricing API keys are properly set"
            variables={pricingVariables}
          />

          <div className="text-sm text-gray-500 space-y-2">
            <h3 className="font-medium">Troubleshooting Pricing API:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>The PRICING_OPENAI_API_KEY is used specifically for price estimation features.</li>
              <li>The OpenAI API key should have access to GPT-4 for best pricing accuracy.</li>
              <li>If you're having issues, try generating a new API key in your OpenAI dashboard.</li>
            </ol>
          </div>
        </TabsContent>

        <TabsContent value="all">
          <EnvVarCheck
            title="All Integration Variables"
            description="Overview of all API integration environment variables"
            variables={[...ebayVariables, ...pricingVariables]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
