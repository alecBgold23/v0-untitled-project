import { type NextRequest, NextResponse } from "next/server"
import { getPhotoCount, updatePhotoCount } from "@/lib/supabase-upload"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const itemId = searchParams.get("itemId")

  if (!itemId) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
  }

  try {
    const count = await getPhotoCount(itemId)
    return NextResponse.json({ itemId, photoCount: count })
  } catch (error) {
    console.error("Error getting photo count:", error)
    return NextResponse.json({ error: "Failed to get photo count" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { itemId, table } = await request.json()

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    const success = await updatePhotoCount(itemId, table)

    if (success) {
      const count = await getPhotoCount(itemId)
      return NextResponse.json({
        success: true,
        itemId,
        photoCount: count,
        message: `Updated photo count for item ${itemId} to ${count}`,
      })
    } else {
      return NextResponse.json({ error: "Failed to update photo count" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating photo count:", error)
    return NextResponse.json({ error: "Failed to update photo count" }, { status: 500 })
  }
}
