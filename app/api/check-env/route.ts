import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { variables } = await request.json()

    if (!Array.isArray(variables)) {
      return NextResponse.json({ error: "Variables must be an array" }, { status: 400 })
    }

    const status: Record<string, boolean> = {}

    // Check each variable
    for (const variable of variables) {
      status[variable] = typeof process.env[variable] === "string" && process.env[variable] !== ""
    }

    return NextResponse.json({ status })
  } catch (error) {
    console.error("Error checking environment variables:", error)
    return NextResponse.json({ error: "Failed to check environment variables" }, { status: 500 })
  }
}
