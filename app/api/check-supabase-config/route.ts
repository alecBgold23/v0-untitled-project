import { NextResponse } from "next/server"

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Mask the keys for security
  const maskedAnonKey = supabaseAnonKey
    ? `${supabaseAnonKey.substring(0, 3)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 4)}`
    : ""

  const maskedServiceKey = supabaseServiceKey
    ? `${supabaseServiceKey.substring(0, 3)}...${supabaseServiceKey.substring(supabaseServiceKey.length - 4)}`
    : ""

  return NextResponse.json({
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
    maskedAnonKey,
    maskedServiceKey,
    url: supabaseUrl,
  })
}
