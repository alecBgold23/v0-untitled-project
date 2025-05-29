import { type NextRequest, NextResponse } from "next/server"

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
