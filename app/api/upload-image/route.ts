import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = (formData.get("userId") as string) || "anonymous"
    const itemId = formData.get("itemId") as string | null

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9]/g, "_")
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileName = `${sanitizedUserId}_${timestamp}_${randomId}.${fileExt}`

    console.log("Uploading file:", fileName)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase storage using service role
    const { data, error } = await supabase.storage.from("item_images").upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Supabase upload error:", error)
      return NextResponse.json(
        {
          success: false,
          error: `Upload failed: ${error.message}`,
        },
        { status: 500 },
      )
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from("item_images").getPublicUrl(data.path)

    console.log("Upload successful:", data.path)
    console.log("Public URL:", publicUrlData.publicUrl)

    // If itemId provided, update image_urls array in sell_items table
    if (itemId) {
      const { data: itemData, error: fetchError } = await supabase
        .from("sell_items")
        .select("image_urls")
        .eq("id", itemId)
        .single()

      if (fetchError) {
        console.error("Error fetching current image_urls:", fetchError)
      } else {
        const currentUrls = itemData?.image_urls || []
        const updatedUrls = [...currentUrls, publicUrlData.publicUrl]

        const { error: updateError } = await supabase
          .from("sell_items")
          .update({ image_urls: updatedUrls })
          .eq("id", itemId)

        if (updateError) {
          console.error("Error updating image_urls:", updateError)
        } else {
          console.log("image_urls updated successfully")
        }
      }
    }

    return NextResponse.json({
      success: true,
      path: data.path,
      url: publicUrlData.publicUrl,
      publicUrl: publicUrlData.publicUrl,
      bucket: "item_images",
    })
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      },
      { status: 500 },
    )
  }
}
