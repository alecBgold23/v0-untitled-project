import { NextResponse } from "next/server"
import { createRobustSupabaseClient } from "@/lib/supabase-robust-client"

export async function GET() {
  try {
    // Get environment variables (redacted for security)
    const envInfo = {
      SUPABASE_URL: process.env.SUPABASE_URL ? "✓ Set" : "✗ Not set",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Not set",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Not set",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Not set",
    }

    // Create a Supabase client
    const supabase = createRobustSupabaseClient()

    // Test connection by listing buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return NextResponse.json({
        success: false,
        message: "Failed to connect to Supabase",
        error: error.message,
        envInfo,
      })
    }

    // Test if images2 bucket exists
    const images2Bucket = buckets.find((bucket) => bucket.name === "images2")

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Supabase",
      buckets: buckets.map((b) => b.name),
      images2BucketExists: !!images2Bucket,
      envInfo,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error testing Supabase connection",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
