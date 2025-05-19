import { NextResponse } from "next/server"
import { getServiceStatus, resetCircuitBreaker } from "@/lib/circuit-breaker"
import { hasOpenAIKey } from "@/lib/env"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const service = url.searchParams.get("service") || "openai"

  const status = getServiceStatus(service)

  return NextResponse.json({
    service,
    status: {
      ...status,
      keyConfigured: service === "openai" ? hasOpenAIKey() : true,
    },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { service, action } = body

    if (!service) {
      return NextResponse.json({ error: "Service name is required" }, { status: 400 })
    }

    if (action === "reset") {
      resetCircuitBreaker(service)
      return NextResponse.json({
        service,
        status: getServiceStatus(service),
        message: `Circuit breaker for ${service} has been reset`,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
