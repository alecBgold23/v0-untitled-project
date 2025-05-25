import { type NextRequest, NextResponse } from "next/server"
import { getEbayOAuthToken } from "@/lib/ebay-auth"

export async function GET(request: NextRequest) {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    overall: "UNKNOWN" as "PASS" | "FAIL" | "UNKNOWN",
    summary: "",
  }

  // Test 1: Environment Variables
  try {
    const envTest = {
      name: "Environment Variables",
      status: "UNKNOWN" as "PASS" | "FAIL" | "UNKNOWN",
      details: {} as any,
    }

    const requiredEnvVars = ["EBAY_CLIENT_ID", "EBAY_CLIENT_SECRET"]

    const envStatus = {} as any
    let allEnvPresent = true

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar]
      envStatus[envVar] = value ? "✅ Present" : "❌ Missing"
      if (!value) allEnvPresent = false
    }

    envTest.details = envStatus
    envTest.status = allEnvPresent ? "PASS" : "FAIL"
    testResults.tests.push(envTest)
  } catch (error) {
    testResults.tests.push({
      name: "Environment Variables",
      status: "FAIL",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Test 2: OAuth Token Generation
  try {
    const tokenTest = {
      name: "OAuth Token Generation",
      status: "UNKNOWN" as "PASS" | "FAIL" | "UNKNOWN",
      details: {} as any,
    }

    console.log("Testing OAuth token generation...")
    const token = await getEbayOAuthToken()

    if (token && typeof token === "string" && token.length > 0) {
      tokenTest.status = "PASS"
      tokenTest.details = {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 10) + "...",
        message: "✅ OAuth token generated successfully",
      }
    } else {
      tokenTest.status = "FAIL"
      tokenTest.details = {
        message: "❌ OAuth token is empty or invalid",
        token: token,
      }
    }

    testResults.tests.push(tokenTest)
  } catch (error) {
    testResults.tests.push({
      name: "OAuth Token Generation",
      status: "FAIL",
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        message: "❌ Failed to generate OAuth token",
      },
    })
  }

  // Test 3: eBay API Call - More detailed debugging
  try {
    const apiTest = {
      name: "eBay Browse API Call",
      status: "UNKNOWN" as "PASS" | "FAIL" | "UNKNOWN",
      details: {} as any,
    }

    console.log("Testing eBay Browse API call...")
    const token = await getEbayOAuthToken()

    if (!token) {
      throw new Error("No OAuth token available for API test")
    }

    // Try the exact URL format that should work
    const url = "https://api.ebay.com/buy/browse/v1/item_summary/search"
    const params = new URLSearchParams({
      q: "iPhone",
      limit: "3",
    })

    const fullUrl = `${url}?${params.toString()}`

    console.log("Making request to:", fullUrl)
    console.log("Using token:", token.substring(0, 20) + "...")

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      "X-EBAY-C-ENDUSERCTX": "affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId>",
    }

    console.log("Headers:", headers)

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers,
    })

    const responseText = await response.text()
    console.log("eBay API Response Status:", response.status)
    console.log("eBay API Response Headers:", Object.fromEntries(response.headers.entries()))
    console.log("eBay API Response Body:", responseText.substring(0, 1000))

    if (response.ok) {
      const data = JSON.parse(responseText)

      apiTest.status = "PASS"
      apiTest.details = {
        message: "✅ eBay API call successful",
        statusCode: response.status,
        itemCount: data.itemSummaries?.length || 0,
        total: data.total || 0,
        hasItems: !!(data.itemSummaries && data.itemSummaries.length > 0),
        sampleItem: data.itemSummaries?.[0]
          ? {
              title: data.itemSummaries[0].title,
              price: data.itemSummaries[0].price,
              itemId: data.itemSummaries[0].itemId,
            }
          : null,
        fullResponse: data,
      }
    } else {
      // Parse error response if possible
      let errorData = null
      try {
        errorData = JSON.parse(responseText)
      } catch (e) {
        // Response is not JSON
      }

      apiTest.status = "FAIL"
      apiTest.details = {
        message: "❌ eBay API call failed",
        statusCode: response.status,
        statusText: response.statusText,
        responseBody: responseText,
        parsedError: errorData,
        requestUrl: fullUrl,
        requestHeaders: headers,
      }
    }

    testResults.tests.push(apiTest)
  } catch (error) {
    testResults.tests.push({
      name: "eBay Browse API Call",
      status: "FAIL",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      details: {
        message: "❌ Exception during eBay API call",
      },
    })
  }

  // Test 4: Direct Token Test (new test to verify token format)
  try {
    const tokenFormatTest = {
      name: "Token Format Validation",
      status: "UNKNOWN" as "PASS" | "FAIL" | "UNKNOWN",
      details: {} as any,
    }

    const token = await getEbayOAuthToken()

    if (token) {
      // Check if token looks like a valid OAuth token
      const isValidFormat = token.length > 50 && !token.includes(" ") && token.includes("v^1.1#i^1#")

      tokenFormatTest.status = isValidFormat ? "PASS" : "FAIL"
      tokenFormatTest.details = {
        tokenLength: token.length,
        hasValidPrefix: token.includes("v^1.1#i^1#"),
        tokenSample: token.substring(0, 50) + "...",
        message: isValidFormat ? "✅ Token format looks valid" : "❌ Token format may be invalid",
      }
    } else {
      tokenFormatTest.status = "FAIL"
      tokenFormatTest.details = {
        message: "❌ No token available",
      }
    }

    testResults.tests.push(tokenFormatTest)
  } catch (error) {
    testResults.tests.push({
      name: "Token Format Validation",
      status: "FAIL",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Skip price estimation test for now since it depends on the API call working

  // Determine overall status
  const failedTests = testResults.tests.filter((test) => test.status === "FAIL")
  const passedTests = testResults.tests.filter((test) => test.status === "PASS")

  if (failedTests.length === 0) {
    testResults.overall = "PASS"
    testResults.summary = `✅ All ${testResults.tests.length} tests passed! eBay integration is working correctly.`
  } else {
    testResults.overall = "FAIL"
    testResults.summary = `❌ ${failedTests.length} of ${testResults.tests.length} tests failed. eBay integration needs attention.`
  }

  return NextResponse.json(testResults, {
    status: testResults.overall === "PASS" ? 200 : 500,
  })
}
