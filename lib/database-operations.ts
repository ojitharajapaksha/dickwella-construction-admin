import { executeQuery } from "./mysql-database"
import type { Equipment, Customer, Rental } from "./types"

// Equipment Operations
export async function getEquipmentList(): Promise<Equipment[]> {
  try {
    const query = `
      SELECT 
        e.id,
        e.name,
        e.item_type as type,
        ec.name as category,
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
      ORDER BY e.created_at DESC
    `

    const results = (await executeQuery(query)) as any[]
    return results.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt),
    }))
  } catch (error) {
    console.error("Error fetching equipment:", error)
    return []
  }
}

export async function createEquipment(equipmentData: Partial<Equipment>): Promise<Equipment | null> {
  try {
    const query = `
      INSERT INTO equipment_items (
        name, item_type, category_id, brand, equipment_condition,
        total_quantity, available_quantity, reserved_quantity, maintenance_quantity,
        daily_rate, hourly_rate, weekly_rate, monthly_rate, security_deposit,
        status, qr_code, location, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      equipmentData.name,
      equipmentData.type || "material",
      1, // Default category ID
      equipmentData.brand,
      equipmentData.condition || "excellent",
      equipmentData.totalQuantity,
      equipmentData.totalQuantity, // available = total initially
      0, // reserved
      0, // maintenance
      equipmentData.dailyRate,
      equipmentData.hourlyRate,
      equipmentData.weeklyRate,
      equipmentData.monthlyRate,
      equipmentData.securityDeposit || 0,
      "available",
      equipmentData.qrCode,
      equipmentData.location || "Main Yard",
      equipmentData.notes,
    ]

    const result = (await executeQuery(query, params)) as any

    if (result.insertId) {
      // Fetch the created equipment
      const createdEquipment = (await executeQuery("SELECT * FROM equipment_items WHERE id = ?", [
        result.insertId,
      ])) as any[]

      return createdEquipment[0] || null
    }

    return null
  } catch (error) {
    console.error("Error creating equipment:", error)
    throw new Error("Failed to create equipment")
  }
}

export async function searchEquipmentByTerm(searchTerm: string): Promise<Equipment[]> {
  try {
    const query = `
      SELECT 
        e.id, e.name, e.item_type as type, e.brand, e.equipment_condition as \`condition\`,
        e.total_quantity as totalQuantity, e.available_quantity as availableQuantity,
        e.daily_rate as dailyRate, e.status, e.qr_code as qrCode, e.location
      FROM equipment_items e
      WHERE e.name LIKE ? OR e.brand LIKE ? OR e.qr_code LIKE ? OR e.location LIKE ?
      ORDER BY e.name
    `

    const searchPattern = `%${searchTerm}%`
    const results = (await executeQuery(query, [searchPattern, searchPattern, searchPattern, searchPattern])) as any[]

    return results
  } catch (error) {
    console.error("Error searching equipment:", error)
    return []
  }
}

// Customer Operations
export async function getCustomersList(): Promise<Customer[]> {
  try {
    const query = `
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
      ORDER BY created_at DESC
    `

    const results = (await executeQuery(query)) as any[]
    return results.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt),
    }))
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

export async function createCustomer(customerData: Partial<Customer>): Promise<Customer | null> {
  try {
    const query = `
      INSERT INTO customers (
        customer_type, name, company_name, contact_person,
        primary_phone, secondary_phone, email, id_number, business_reg_number,
        address_line1, address_line2, city, district, postal_code,
        credit_limit, outstanding_balance, total_rentals, total_spent, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 'active')
    `

    const params = [
      customerData.customerType,
      customerData.name,
      customerData.companyName,
      customerData.contactPerson,
      customerData.primaryPhone,
      customerData.secondaryPhone,
      customerData.email,
      customerData.idNumber,
      customerData.businessRegNumber,
      customerData.addressLine1,
      customerData.addressLine2,
      customerData.city,
      customerData.district,
      customerData.postalCode,
      customerData.creditLimit || 0,
    ]

    const result = (await executeQuery(query, params)) as any

    if (result.insertId) {
      const createdCustomer = (await executeQuery("SELECT * FROM customers WHERE id = ?", [result.insertId])) as any[]

      return createdCustomer[0] || null
    }

    return null
  } catch (error) {
    console.error("Error creating customer:", error)
    throw new Error("Failed to create customer")
  }
}

export async function searchCustomersByTerm(searchTerm: string): Promise<Customer[]> {
  try {
    const query = `
      SELECT 
        id, name, customer_type as customerType, company_name as companyName,
        primary_phone as primaryPhone, email, id_number as idNumber,
        city, district, status, outstanding_balance as outstandingBalance
      FROM customers 
      WHERE (name LIKE ? OR primary_phone LIKE ? OR id_number LIKE ? OR email LIKE ? OR company_name LIKE ?)
        AND status != 'deleted'
      ORDER BY name
    `

    const searchPattern = `%${searchTerm}%`
    const results = (await executeQuery(query, [
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
    ])) as any[]

    return results
  } catch (error) {
    console.error("Error searching customers:", error)
    return []
  }
}

// Rental Operations
export async function getRentalsList(): Promise<Rental[]> {
  try {
    const query = `
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
      ORDER BY r.created_at DESC
    `

    const results = (await executeQuery(query)) as any[]

    // Get rental items for each rental
    for (const rental of results) {
      const itemsQuery = `
        SELECT 
          equipment_id as equipmentId, equipment_name as equipmentName,
          quantity, rate_type as rateType, rate, duration, subtotal
        FROM rental_items 
        WHERE rental_id = ?
      `
      const items = (await executeQuery(itemsQuery, [rental.id])) as any[]
      rental.items = items
    }

    return results.map((row) => ({
      ...row,
      rentalDate: new Date(row.rentalDate),
      startDate: new Date(row.startDate),
      expectedReturnDate: new Date(row.expectedReturnDate),
      actualReturnDate: row.actualReturnDate ? new Date(row.actualReturnDate) : null,
      createdAt: new Date(row.createdAt),
    }))
  } catch (error) {
    console.error("Error fetching rentals:", error)
    return []
  }
}

export async function createRental(rentalData: any): Promise<Rental | null> {
  try {
    // Start transaction
    await executeQuery("START TRANSACTION")

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
      rentalData.rentalNumber,
      rentalData.customerId,
      rentalData.customerName,
      rentalData.customerPhone,
      rentalData.rentalDate,
      rentalData.startDate,
      rentalData.expectedReturnDate,
      rentalData.subtotal,
      rentalData.taxRate || 0,
      rentalData.taxAmount || 0,
      rentalData.discountAmount || 0,
      rentalData.securityDeposit || 0,
      rentalData.totalAmount,
      rentalData.paidAmount || 0,
      rentalData.outstandingAmount,
      "active",
      "pending",
      rentalData.qrCode,
      rentalData.notes,
    ]

    const rentalResult = (await executeQuery(rentalQuery, rentalParams)) as any
    const rentalId = rentalResult.insertId

    // Insert rental items
    for (const item of rentalData.items) {
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

    return createdRental[0] || null
  } catch (error) {
    await executeQuery("ROLLBACK")
    console.error("Error creating rental:", error)
    throw new Error("Failed to create rental")
  }
}

export async function searchRentalsByTerm(searchTerm: string): Promise<Rental[]> {
  try {
    const query = `
      SELECT 
        id, rental_number as rentalNumber, customer_name as customerName,
        customer_phone as customerPhone, start_date as startDate,
        expected_return_date as expectedReturnDate, total_amount as totalAmount,
        status, payment_status as paymentStatus
      FROM rentals 
      WHERE rental_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR qr_code LIKE ?
      ORDER BY created_at DESC
    `

    const searchPattern = `%${searchTerm}%`
    const results = (await executeQuery(query, [searchPattern, searchPattern, searchPattern, searchPattern])) as any[]

    return results
  } catch (error) {
    console.error("Error searching rentals:", error)
    return []
  }
}

// Analytics Operations
export async function getAnalyticsData() {
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
        ROUND(AVG((total_quantity - available_quantity) / total_quantity * 100), 2) as percentage
      FROM equipment_items 
      WHERE item_type = 'machine' AND total_quantity > 0
      UNION ALL
      SELECT 
        'Construction Materials' as category,
        ROUND(AVG((total_quantity - available_quantity) / total_quantity * 100), 2) as percentage
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

    return {
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
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return {
      revenue: { monthly: [] },
      equipment: { utilization: [], popular: [], revenue: [] },
      rentals: { status: [], trends: [] },
      customers: { topCustomers: [], growth: [] },
    }
  }
}

// Utility functions
export async function generateNextRentalNumber(): Promise<string> {
  try {
    const result = (await executeQuery("SELECT COUNT(*) as count FROM rentals")) as any[]
    const count = result[0].count + 1
    return `R${count.toString().padStart(3, "0")}`
  } catch (error) {
    console.error("Error generating rental number:", error)
    return `R${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`
  }
}

export function generateQRCode(prefix = "QR"): string {
  return `${prefix}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}
