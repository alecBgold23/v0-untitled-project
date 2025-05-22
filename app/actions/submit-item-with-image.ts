"use server"

import { createClient } from "@supabase/supabase-js"
import { uploadImageToSupabase, ensureItemImagesBucket } from "@/lib/supabase-image-upload"
import { sendConfirmationEmail } from "./send-confirmation-email"
// Import the fix-image-urls utility at the top of the file
import { fixImageUrl } from "@/lib/fix-image-urls"

export async function submitItemWithImage(formData: FormData) {
  try {
    console.log("Starting submission with image...")

    // Extract form data
    const itemName = formData.get("itemName") as string
    const itemDescription = formData.get("itemDescription") as string
    const itemCondition = formData.get("itemCondition") as string
    const itemIssues = (formData.get("itemIssues") as string) || "None"
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const imageFile = formData.get("image") as File

    // Validate required fields
    if (!itemName || !itemDescription || !itemCondition || !fullName || !email || !phone || !imageFile) {
      return {
        success: false,
        message: "Missing required fields",
      }
    }

    // Ensure the item_images bucket exists
    await ensureItemImagesBucket()

    // Convert the file to a buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload the image to Supabase with public URL
    const uploadResult = await uploadImageToSupabase(buffer, imageFile.name, "item_images")

    if (!uploadResult.success) {
      console.error("Image upload failed:", uploadResult)
      return {
        success: false,
        message: "Failed to upload image",
      }
    }

    const image_path = uploadResult.image_path
    const image_url = uploadResult.publicUrl || uploadResult.image_url

    console.log("Image uploaded successfully:", { image_path, image_url })

    // Get Supabase client for database operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables")
      return {
        success: false,
        message: "Server configuration error",
      }
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // Prepare data for submission
    const itemData = {
      item_name: itemName,
      item_description: itemDescription,
      item_condition: itemCondition,
      item_issues: itemIssues, // This should not be null
      full_name: fullName,
      email: email,
      phone: phone,
      status: "pending",
      submission_date: new Date().toISOString(),
      image_path: image_path, // Store the path
      image_url: fixImageUrl(image_url), // Fix the URL format here
    }

    console.log("Submitting item data to database:", itemData)

    // Ensure the image_url column exists
    try {
      await supabase.rpc("ensure_image_url_column")
    } catch (error) {
      console.log("Error ensuring image_url column exists, attempting to create it manually:", error)

      // Try to create the column manually if the RPC fails
      try {
        await supabase.query(`
          ALTER TABLE sell_items 
          ADD COLUMN IF NOT EXISTS image_url TEXT;
        `)
      } catch (alterError) {
        console.error("Error creating image_url column:", alterError)
        // Continue anyway, as the column might already exist
      }
    }

    // Insert data into Supabase
    const { data, error } = await supabase.from("sell_items").insert([itemData]).select()

    if (error) {
      console.error("Error inserting data:", error)
      return {
        success: false,
        message: `Database error: ${error.message}`,
      }
    }

    console.log("Item submitted successfully:", data)

    // Send confirmation email
    try {
      await sendConfirmationEmail({
        fullName,
        email,
        itemName,
        itemCondition,
        itemDescription,
        itemIssues,
        phone,
        imageUrl: image_url || "",
      })
    } catch (emailError) {
      console.error("Error sending email:", emailError)
    }

    return {
      success: true,
      message: "Item submitted successfully",
      data,
      imageUrl: image_url,
    }
  } catch (error) {
    console.error("Error in submitItemWithImage:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
