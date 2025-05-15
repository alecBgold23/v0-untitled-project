import { NextResponse } from "next/server"

export async function GET() {
  // This is a debug endpoint to check if environment variables are properly set
  // In a production environment, you would NOT expose this information

  return NextResponse.json({
    hasOpenAIKey: process.env.OPENAI_API_KEY ? true : false,
    openAIKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    openAIKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 3) : null,
    nodeEnv: process.env.NODE_ENV,
  })
}
