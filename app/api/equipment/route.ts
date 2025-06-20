import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql-database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let query = `
      SELECT 
        e.id,
        e.name,
        e.item_type as type,
        COALESCE(ec.name, 'Uncategorized') as category,
        e.brand,
        e.equipment_condition as \`condition\`,
        e.total_quantity as totalQuantity,
        e.available_quantity as availableQuantity,
        e.reserved_quantity as reservedQuantity,
        e.maintenance_quantity as maintenanceQuantity,
        e.daily_rate as dailyRate,
        e.hourly_rate as hourlyRate,
        e.weekly_rate as weeklyRate,
        e.monthly_rate as monthlyRate,
        e.security_deposit as securityDeposit,
        e.status,
        e.qr_code as qrCode,
        e.location,
        e.notes,
        e.created_at as createdAt
      FROM equipment_items e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
    `

    const params: any[] = []

    if (search) {
      query += ` WHERE (e.name LIKE ? OR e.brand LIKE ? OR e.qr_code LIKE ? OR e.location LIKE ?)`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern)
    }

    query += ` ORDER BY e.created_at DESC`

    const results = await executeQuery(query, params)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Equipment API error:", error)
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const query = `
      INSERT INTO equipment_items (
        name, item_type, category_id, brand, equipment_condition,
        total_quantity, available_quantity, reserved_quantity, maintenance_quantity,
        daily_rate, hourly_rate, weekly_rate, monthly_rate, security_deposit,
        status, qr_code, location, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      data.name,
      data.type || "material",
      1, // Default category ID
      data.brand,
      data.condition || "excellent",
      data.totalQuantity,
      data.totalQuantity, // available = total initially
      0, // reserved
      0, // maintenance
      data.dailyRate,
      data.hourlyRate,
      data.weeklyRate,
      data.monthlyRate,
      data.securityDeposit || 0,
      "available",
      data.qrCode,
      data.location || "Main Yard",
      data.notes,
    ]

    const result = (await executeQuery(query, params)) as any

    if (result.insertId) {
      // Fetch the created equipment
      const createdEquipment = (await executeQuery("SELECT * FROM equipment_items WHERE id = ?", [
        result.insertId,
      ])) as any[]
      return NextResponse.json(createdEquipment[0])
    }

    return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 })
  } catch (error) {
    console.error("Equipment creation error:", error)
    return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 })
  }
}
