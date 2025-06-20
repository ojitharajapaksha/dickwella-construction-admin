import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql-database"

export async function GET() {
  try {
    // Revenue by month
    const revenueQuery = `
      SELECT 
        DATE_FORMAT(rental_date, '%Y-%m') as month,
        SUM(total_amount) as amount
      FROM rentals 
      WHERE status != 'cancelled' AND rental_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(rental_date, '%Y-%m')
      ORDER BY month DESC
    `

    // Equipment utilization
    const utilizationQuery = `
      SELECT 
        'Heavy Machinery' as category,
        COALESCE(ROUND(AVG((total_quantity - available_quantity) / total_quantity * 100), 2), 0) as percentage
      FROM equipment_items 
      WHERE item_type = 'machine' AND total_quantity > 0
      UNION ALL
      SELECT 
        'Construction Materials' as category,
        COALESCE(ROUND(AVG((total_quantity - available_quantity) / total_quantity * 100), 2), 0) as percentage
      FROM equipment_items 
      WHERE item_type = 'material' AND total_quantity > 0
    `

    // Rental status
    const statusQuery = `
      SELECT status, COUNT(*) as count
      FROM rentals
      GROUP BY status
    `

    // Top customers
    const customersQuery = `
      SELECT 
        name, 
        total_spent as totalSpent, 
        total_rentals as rentals
      FROM customers
      WHERE total_spent > 0
      ORDER BY total_spent DESC
      LIMIT 10
    `

    // Popular equipment
    const popularQuery = `
      SELECT 
        ri.equipment_name as name,
        COUNT(*) as rentals
      FROM rental_items ri
      GROUP BY ri.equipment_name
      ORDER BY rentals DESC
      LIMIT 10
    `

    const [revenue, utilization, status, customers, popular] = await Promise.all([
      executeQuery(revenueQuery),
      executeQuery(utilizationQuery),
      executeQuery(statusQuery),
      executeQuery(customersQuery),
      executeQuery(popularQuery),
    ])

    return NextResponse.json({
      revenue: { monthly: revenue },
      equipment: {
        utilization,
        popular,
        revenue: [], // Will be calculated from rental data
      },
      rentals: {
        status,
        trends: [], // Will be calculated
      },
      customers: {
        topCustomers: customers,
        growth: [], // Will be calculated
      },
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({
      revenue: { monthly: [] },
      equipment: { utilization: [], popular: [], revenue: [] },
      rentals: { status: [], trends: [] },
      customers: { topCustomers: [], growth: [] },
    })
  }
}
