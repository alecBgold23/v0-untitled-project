import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with Service Role key for full DB access
const supabase = createClient(
  process.env.SUPABASE_URL!,
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
    const redirectUri = process.env.EBAY_RUNAME_ID // <- Use RuName here

    if (!clientId || !clientSecret || !redirectUri) {
      console.log("Missing eBay credentials or redirect URI (RuName)")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri, // <- Must match the one in your Dev Portal
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

    // Calculate expires_at as Unix timestamp in milliseconds
    const expiresAt = Date.now() + tokenData.expires_in * 1000

    // Upsert the tokens into Supabase (using fixed id 'singleton' for one row)
    const { error } = await supabase
      .from("ebay_tokens")
      .upsert(
        {
          id: "singleton",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )

    if (error) {
      console.error("Supabase upsert error:", error)
      return NextResponse.json({ error: "Failed to save tokens" }, { status: 500 })
    }

    return NextResponse.json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      success: true,
    })
  } catch (error) {
    console.error("OAuth exchange error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
