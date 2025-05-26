import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const testItem = searchParams.get("item") || "iPhone 14 Pro 128GB"

  try {
    // Test the improved pricing endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/ebay-price-estimate-improved?title=${encodeURIComponent(testItem)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const data = await response.json()

    return NextResponse.json({
      testItem,
      success: response.ok,
      status: response.status,
      data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        testItem,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
