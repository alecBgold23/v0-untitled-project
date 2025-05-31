import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with Service Role key for full DB access
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token, expires_in } = await request.json()

    if (!access_token || !refresh_token || !expires_in) {
      return NextResponse.json({ error: "Missing required token data" }, { status: 400 })
    }

    const expiresAt = Date.now() + expires_in * 1000

    const upsertPayload = {
      id: "singleton",
      access_token,
      refresh_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }

    console.log("Saving eBay tokens to Supabase:", { ...upsertPayload, access_token: "***", refresh_token: "***" })

    const { error } = await supabase.from("ebay_tokens").upsert(upsertPayload, { onConflict: "id" })

    if (error) {
      console.error("❌ Supabase upsert error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ eBay tokens saved to Supabase successfully")
    return NextResponse.json({ success: true, message: "Tokens saved successfully" })
  } catch (error) {
    console.error("❌ Unexpected error saving eBay tokens:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
