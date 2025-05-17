import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client with service role for higher privileges
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabase = createClient(supabaseUrl, supabaseServiceRole)

export async function POST(request: NextRequest) {
  try {
    // Get form data with file
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const userId = (formData.get("userId") as string) || "anonymous"

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    console.log("Server uploading file:", fileName, "size:", buffer.length)

    // Upload to Supabase
    const { data, error } = await supabase.storage.from("images2").upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Server upload error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("images2").getPublicUrl(data.path)

    console.log("Server upload successful:", data.path)
    console.log("Public URL:", urlData.publicUrl)

    return NextResponse.json({
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    })
  } catch (error) {
    console.error("Unexpected server error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    )
  }
}
