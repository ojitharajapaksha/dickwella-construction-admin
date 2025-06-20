import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql-database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let query = `
      SELECT 
        id, customer_type as customerType, name, company_name as companyName,
        contact_person as contactPerson, primary_phone as primaryPhone,
        secondary_phone as secondaryPhone, email, id_number as idNumber,
        business_reg_number as businessRegNumber, address_line1 as addressLine1,
        address_line2 as addressLine2, city, district, postal_code as postalCode,
        credit_limit as creditLimit, outstanding_balance as outstandingBalance,
        total_rentals as totalRentals, total_spent as totalSpent,
        status, notes, created_at as createdAt
      FROM customers 
      WHERE status != 'deleted'
    `

    const params: any[] = []

    if (search) {
      query += ` AND (name LIKE ? OR primary_phone LIKE ? OR id_number LIKE ? OR email LIKE ? OR company_name LIKE ?)`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
    }

    query += ` ORDER BY created_at DESC`

    const results = await executeQuery(query, params)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Customers API error:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const query = `
      INSERT INTO customers (
        customer_type, name, company_name, contact_person,
        primary_phone, secondary_phone, email, id_number, business_reg_number,
        address_line1, address_line2, city, district, postal_code,
        credit_limit, outstanding_balance, total_rentals, total_spent, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 'active')
    `

    const params = [
      data.customerType,
      data.name,
      data.companyName,
      data.contactPerson,
      data.primaryPhone,
      data.secondaryPhone,
      data.email,
      data.idNumber,
      data.businessRegNumber,
      data.addressLine1,
      data.addressLine2,
      data.city,
      data.district,
      data.postalCode,
      data.creditLimit || 0,
    ]

    const result = (await executeQuery(query, params)) as any

    if (result.insertId) {
      const createdCustomer = (await executeQuery("SELECT * FROM customers WHERE id = ?", [result.insertId])) as any[]
      return NextResponse.json(createdCustomer[0])
    }

    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  } catch (error) {
    console.error("Customer creation error:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
