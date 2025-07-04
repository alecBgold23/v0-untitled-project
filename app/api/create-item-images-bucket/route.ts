import { NextResponse } from "next/server"
import { ensureItemImagesBucket } from "@/lib/supabase-image-upload"

export async function GET() {
  try {
    const result = await ensureItemImagesBucket()

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in create-item-images-bucket route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
