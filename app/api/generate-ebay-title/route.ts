import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    {
      error: "Title generation is not yet configured",
      message: "The OpenAI API key will be set up later",
    },
    { status: 501 },
  )
}
