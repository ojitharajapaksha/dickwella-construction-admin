// Production-ready MySQL connection for Vercel
import mysql from "mysql2/promise"

// Production database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00",
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
  acquireTimeout: 60000,
  timeout: 60000,
}

// Create connection pool with error handling
let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Enhanced query execution with retry logic
export async function executeQuery(query: string, params: any[] = []) {
  const maxRetries = 3
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connection = getPool()
      const [results] = await connection.execute(query, params)
      return results
    } catch (error: any) {
      lastError = error
      console.error(`Database query attempt ${attempt} failed:`, error.message)

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  throw new Error(`Database query failed after ${maxRetries} attempts: ${lastError.message}`)
}

// Health check function
export async function checkDatabaseConnection() {
  try {
    await executeQuery("SELECT 1 as health_check")
    return { status: "healthy", timestamp: new Date().toISOString() }
  } catch (error: any) {
    return { status: "unhealthy", error: error.message, timestamp: new Date().toISOString() }
  }
}

// Export all database functions from mysql-database.ts
export * from "./mysql-database"
