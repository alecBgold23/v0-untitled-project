import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const body = await req.json()

    const {
      item_name,
      item_description,
      item_condition,
      item_issues: rawItemIssues,
      full_name,
      email,
      phone,
      address,
      pickup_date,
      photo_count,
      estimated_price,
      estimated_price_numeric,
    } = body

    // Ensure item_issues is never null or empty
    const item_issues = rawItemIssues?.trim() ? rawItemIssues : "None"

    const { data, error } = await supabase
      .from("sell_items")
      .insert([
        {
          item_name,
          item_description,
          item_condition,
          item_issues,
          full_name,
          email,
          phone,
          address,
          pickup_date,
          photo_count,
          estimated_price,
          estimated_price_numeric,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Item submitted successfully", data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
