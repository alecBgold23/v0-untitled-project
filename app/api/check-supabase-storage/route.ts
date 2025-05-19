import { NextResponse } from "next/server"
import { checkSupabaseStorage } from "@/lib/check-supabase-storage"

export async function GET() {
  try {
    const result = await checkSupabaseStorage()

    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
