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

    const requiredEnvVars = ["EBAY_CLIENT_ID", "EBAY_CLIENT_SECRET", "EBAY_BROWSE_API_ENDPOINT"]

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

  // Test 3: eBay API Call
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

    const apiEndpoint = process.env.EBAY_BROWSE_API_ENDPOINT || "https://api.ebay.com/buy/browse/v1"
    const testQuery = "iPhone"
    const url = `${apiEndpoint}/item_summary/search?q=${encodeURIComponent(testQuery)}&limit=3`

    console.log("Making request to:", url)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
    })

    const responseText = await response.text()
    console.log("eBay API Response Status:", response.status)
    console.log("eBay API Response:", responseText.substring(0, 500))

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
      }
    } else {
      apiTest.status = "FAIL"
      apiTest.details = {
        message: "❌ eBay API call failed",
        statusCode: response.status,
        statusText: response.statusText,
        responseBody: responseText.substring(0, 1000),
        url: url,
      }
    }

    testResults.tests.push(apiTest)
  } catch (error) {
    testResults.tests.push({
      name: "eBay Browse API Call",
      status: "FAIL",
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        message: "❌ Exception during eBay API call",
      },
    })
  }

  // Test 4: Price Estimation Function
  try {
    const priceTest = {
      name: "Price Estimation Function",
      status: "UNKNOWN" as "PASS" | "FAIL" | "UNKNOWN",
      details: {} as any,
    }

    // Test the price estimation endpoint
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const priceResponse = await fetch(`${baseUrl}/api/ebay-price-estimate?title=iPhone%2014`)

    if (priceResponse.ok) {
      const priceData = await priceResponse.json()
      priceTest.status = "PASS"
      priceTest.details = {
        message: "✅ Price estimation working",
        priceData: priceData,
      }
    } else {
      const errorText = await priceResponse.text()
      priceTest.status = "FAIL"
      priceTest.details = {
        message: "❌ Price estimation failed",
        statusCode: priceResponse.status,
        error: errorText,
      }
    }

    testResults.tests.push(priceTest)
  } catch (error) {
    testResults.tests.push({
      name: "Price Estimation Function",
      status: "FAIL",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }

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
