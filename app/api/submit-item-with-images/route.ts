import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      itemName,
      itemDescription,
      itemCondition,
      itemIssues,
      fullName,
      email,
      phone,
      address,
      pickupDate,
      photoCount,
      imagePaths,
    } = body

    // Make sure we have the required fields
    if (!itemName || !itemDescription || !fullName || !email) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Make sure we have valid Supabase credentials
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 })
    }

    // Insert the data into Supabase
    const { data, error } = await supabase
      .from("sell_items")
      .insert([
        {
          item_name: itemName,
          item_description: itemDescription,
          item_condition: itemCondition,
          item_issues: itemIssues || "None",
          full_name: fullName,
          email,
          phone,
          address: address || "",
          pickup_date: pickupDate || "",
          photo_count: photoCount || 0,
          image_paths: imagePaths || [], // make sure your table has this column (text array)
          status: "pending",
          submission_date: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error inserting data into Supabase:", error)
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Item submitted successfully",
      data,
    })
  } catch (error: any) {
    console.error("Unexpected error in submit-item-with-images:", error)
    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
