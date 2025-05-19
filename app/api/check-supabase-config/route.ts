import { NextResponse } from "next/server"
import { checkSupabaseConfig } from "@/lib/check-supabase"

export async function GET() {
  try {
    const result = await checkSupabaseConfig()

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
