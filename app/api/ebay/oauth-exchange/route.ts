import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with Service Role key for full DB access
const supabase = createClient(
  process.env.SUPABASE_URL!,          // Use NEXT_PUBLIC_SUPABASE_URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    if (!code) {
      console.log("Missing authorization code")
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 })
    }

    const clientId = process.env.EBAY_CLIENT_ID
    const clientSecret = process.env.EBAY_CLIENT_SECRET
    const redirectUri = process.env.EBAY_RUNAME_ID

    if (!clientId || !clientSecret || !redirectUri) {
      console.log("Missing eBay credentials or redirect URI (RuName)")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    })

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    console.log("Exchanging code for token...")

    const tokenRes = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      console.log("Token exchange failed:", tokenData)
      return NextResponse.json(
        { error: tokenData.error_description || "Token exchange failed" },
        { status: tokenRes.status },
      )
    }

    console.log("Token exchange successful")

    const expiresAt = Date.now() + tokenData.expires_in * 1000

    // Explicitly define the object with correct column names for Supabase
    const upsertPayload = {
      id: "singleton", // primary key
      access_token: tokenData.access_token ?? null,
      refresh_token: tokenData.refresh_token ?? null,
      expires_at: expiresAt ?? null,
      updated_at: new Date().toISOString(),
    }

    console.log("Saving tokens to Supabase:", upsertPayload)

    // Upsert into Supabase with full column mapping
    await supabase
      .from("ebay_tokens")
      .upsert(upsertPayload, { onConflict: "id" })
      .then(({ data, error }) => {
        if (error) {
          console.error("❌ Supabase upsert error:", error.message)
        } else {
          console.log("✅ Tokens saved to Supabase:", data)
        }
      })
      .catch((e) => {
        console.error("❌ Unexpected error saving tokens to Supabase:", e.message)
      })

    // Always return tokens to the client
    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      success: true,
    })
  } catch (error) {
    console.error("OAuth exchange error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
