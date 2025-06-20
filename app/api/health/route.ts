// Health check API route for monitoring
import { checkDatabaseConnection } from "@/lib/production-database"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const dbHealth = await checkDatabaseConnection()

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbHealth,
      environment: process.env.NODE_ENV,
      version: "1.0.0",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
