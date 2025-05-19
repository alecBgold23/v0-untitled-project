import { NextResponse } from "next/server"
import { initializeStorage, initializeDatabase, testSupabaseConnection } from "@/lib/supabase-admin"

export async function GET() {
  try {
    // Test connection first
    const connectionTest = await testSupabaseConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to connect to Supabase",
          details: connectionTest.error,
        },
        { status: 500 },
      )
    }

    // Initialize storage buckets
    const storageResult = await initializeStorage()

    // Initialize database tables
    const dbResult = await initializeDatabase()

    return NextResponse.json({
      success: true,
      storage: storageResult,
      database: dbResult,
    })
  } catch (error) {
    console.error("Error initializing Supabase:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
