import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql-database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let query = `
      SELECT 
        r.id, r.rental_number as rentalNumber, r.customer_id as customerId,
        r.customer_name as customerName, r.customer_phone as customerPhone,
        r.rental_date as rentalDate, r.start_date as startDate,
        r.expected_return_date as expectedReturnDate, r.actual_return_date as actualReturnDate,
        r.subtotal, r.tax_rate as taxRate, r.tax_amount as taxAmount,
        r.discount_amount as discountAmount, r.security_deposit as securityDeposit,
        r.total_amount as totalAmount, r.paid_amount as paidAmount,
        r.outstanding_amount as outstandingAmount, r.status, r.payment_status as paymentStatus,
        r.qr_code as qrCode, r.notes, r.created_at as createdAt
      FROM rentals r
    `

    const params: any[] = []

    if (search) {
      query += ` WHERE (r.rental_number LIKE ? OR r.customer_name LIKE ? OR r.customer_phone LIKE ? OR r.qr_code LIKE ?)`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern)
    }

    query += ` ORDER BY r.created_at DESC LIMIT 50` // Limit for performance

    const results = (await executeQuery(query, params)) as any[]

    if (results.length === 0) {
      return NextResponse.json([])
    }

    // Fetch all rental items in one query
    const rentalIds = results.map(r => r.id)
    let items: any[] = []
    if (rentalIds.length > 0) {
      const placeholders = rentalIds.map(() => '?').join(',')
      const itemsQuery = `
        SELECT 
          rental_id, equipment_id as equipmentId, equipment_name as equipmentName,
          quantity, rate_type as rateType, rate, duration, subtotal
        FROM rental_items 
        WHERE rental_id IN (${placeholders})
      `
      items = await executeQuery(itemsQuery, rentalIds) as any[]
    }

    // Attach items to their rentals
    for (const rental of results) {
      rental.items = items.filter(item => item.rental_id === rental.id)
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Rentals API error:", error instanceof Error ? error.stack : error)
    return NextResponse.json({ error: "Failed to fetch rentals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Start transaction
    await executeQuery("START TRANSACTION")

    try {
      // Insert rental
      const rentalQuery = `
        INSERT INTO rentals (
          rental_number, customer_id, customer_name, customer_phone,
          rental_date, start_date, expected_return_date,
          subtotal, tax_rate, tax_amount, discount_amount, security_deposit,
          total_amount, paid_amount, outstanding_amount,
          status, payment_status, qr_code, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      const rentalParams = [
        data.rentalNumber,
        data.customerId,
        data.customerName,
        data.customerPhone,
        data.rentalDate,
        data.startDate,
        data.expectedReturnDate,
        data.subtotal,
        data.taxRate || 0,
        data.taxAmount || 0,
        data.discountAmount || 0,
        data.securityDeposit || 0,
        data.totalAmount,
        data.paidAmount || 0,
        data.outstandingAmount,
        "active",
        "pending",
        data.qrCode,
        data.notes,
      ]

      const rentalResult = (await executeQuery(rentalQuery, rentalParams)) as any
      const rentalId = rentalResult.insertId

      // Insert rental items
      for (const item of data.items) {
        const itemQuery = `
          INSERT INTO rental_items (
            rental_id, equipment_id, equipment_name, quantity,
            rate_type, rate, duration, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `

        await executeQuery(itemQuery, [
          rentalId,
          item.equipmentId,
          item.equipmentName,
          item.quantity,
          item.rateType,
          item.rate,
          item.duration,
          item.subtotal,
        ])

        // Update equipment availability
        await executeQuery(
          "UPDATE equipment_items SET available_quantity = available_quantity - ?, reserved_quantity = reserved_quantity + ? WHERE id = ?",
          [item.quantity, item.quantity, item.equipmentId],
        )
      }

      await executeQuery("COMMIT")

      // Return the created rental
      const createdRental = (await executeQuery("SELECT * FROM rentals WHERE id = ?", [rentalId])) as any[]
      return NextResponse.json(createdRental[0])
    } catch (error) {
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Rental creation error:", error instanceof Error ? error.stack : error)
    return NextResponse.json({ error: "Failed to create rental" }, { status: 500 })
  }
}