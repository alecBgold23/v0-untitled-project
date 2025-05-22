import { NextResponse } from "next/server"
import { fixAllImageUrls } from "@/lib/fix-image-urls"

export async function GET() {
  try {
    const result = await fixAllImageUrls()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in fix-image-urls route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
