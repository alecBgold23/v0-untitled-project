import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "Supabase credentials not configured",
        details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey },
      })
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check storage configuration
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json({
        success: false,
        error: bucketsError.message,
        details: {
          code: bucketsError.code,
          statusCode: bucketsError.status,
        },
      })
    }

    // Return buckets information
    return NextResponse.json({
      success: true,
      buckets: buckets.map((b) => ({
        name: b.name,
        public: b.public,
        createdAt: b.created_at,
      })),
      count: buckets.length,
    })
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
