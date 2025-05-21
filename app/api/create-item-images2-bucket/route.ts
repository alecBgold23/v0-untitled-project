import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = process.env.SUPABASE_URL || ""
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json({ success: false, error: "Missing Supabase credentials" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Check if bucket already exists
    const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket("item_images2")

    if (existingBucket) {
      return NextResponse.json({
        success: true,
        message: "Bucket 'item_images2' already exists",
        bucket: existingBucket,
      })
    }

    // Create the new bucket
    const { data, error } = await supabase.storage.createBucket("item_images2", {
      public: true, // Make the bucket publicly accessible
      fileSizeLimit: 10485760, // 10MB file size limit
    })

    if (error) {
      console.error("Error creating bucket:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Bucket 'item_images2' created successfully",
      data,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
