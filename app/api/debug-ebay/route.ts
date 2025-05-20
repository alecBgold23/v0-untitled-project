import { NextResponse } from "next/server"
import { getEbayOAuthToken } from "@/lib/ebay-auth"

export async function GET() {
  try {
    const result = {
      timestamp: new Date().toISOString(),
      environmentVariables: {
        clientId: process.env.EBAY_CLIENT_ID ? "✓ Set" : "✗ Missing",
        clientSecret: process.env.EBAY_CLIENT_SECRET ? "✓ Set" : "✗ Missing",
        oauthToken: process.env.EBAY_OAUTH_TOKEN ? "✓ Set" : "✗ Missing",
        browseApiEndpoint: process.env.EBAY_BROWSE_API_ENDPOINT ? "✓ Set" : "✗ Missing",
      },
      tokenTest: { status: "Pending" },
    }

    // Test getting an OAuth token
    try {
      const token = await getEbayOAuthToken()
      if (token) {
        result.tokenTest = {
          status: "Success",
          tokenStart: token.substring(0, 10) + "...",
          tokenLength: token.length,
        }
      } else {
        result.tokenTest = {
          status: "Failed",
          error: "Token is empty",
        }
      }
    } catch (tokenError: any) {
      result.tokenTest = {
        status: "Failed",
        error: tokenError.message,
      }
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 })
  }
}
