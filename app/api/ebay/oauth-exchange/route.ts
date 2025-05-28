import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 })

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: "https://www.bluberryhq.com/auth/callback", // must match your registered redirect URI
    })

    const clientId = process.env.EBAY_CLIENT_ID!
    const clientSecret = process.env.EBAY_CLIENT_SECRET!

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const tokenRes = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) return NextResponse.json(tokenData, { status: tokenRes.status })

    // Optional: Save tokens securely to Supabase, DB, etc.

    return NextResponse.json(tokenData)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
