import { NextResponse } from "next/server"
import { searchItems } from "@/lib/ebay-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const categoryId = searchParams.get("category") || undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 10

    const results = await searchItems({
      q: query,
      category_ids: categoryId,
      limit,
    })

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Error searching eBay:", error)
    return NextResponse.json({ error: "Error searching eBay" }, { status: 500 })
  }
}
