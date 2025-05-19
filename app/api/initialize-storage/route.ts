import { NextResponse } from "next/server"
import { initializeSupabaseStorage } from "@/lib/initialize-supabase-storage"

export async function GET() {
  try {
    const result = await initializeSupabaseStorage()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in initialize-storage API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
