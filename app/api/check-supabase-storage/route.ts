import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // List buckets to check if storage is working
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Error listing buckets: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      buckets: buckets.map((bucket) => bucket.name),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Error checking Supabase storage: ${error.message}`,
    })
  }
}
