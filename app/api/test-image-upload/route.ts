import { NextResponse } from "next/server"
import { uploadImageToSupabase } from "@/lib/supabase-image-upload"

export async function POST(request: Request) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload the image to Supabase with signed URL
    const result = await uploadImageToSupabase(buffer, file.name)

    return NextResponse.json({
      message: "Image uploaded successfully",
      result,
    })
  } catch (error) {
    console.error("Error in test-image-upload:", error)
    return NextResponse.json({ error: "Failed to upload image", details: String(error) }, { status: 500 })
  }
}
