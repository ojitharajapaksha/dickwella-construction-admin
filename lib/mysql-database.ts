// MySQL Database connection and operations
import mysql from "mysql2/promise"

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "dickwella_construction",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00",
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Helper function to execute queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Equipment operations
export async function getEquipmentFromDB() {
  const query = `
    SELECT 
      id,
      name,
      item_type as type,
      category_id,
      brand,
      equipment_condition as \`condition\`,
      total_quantity as totalQuantity,
      available_quantity as availableQuantity,
      reserved_quantity as reservedQuantity,
      maintenance_quantity as maintenanceQuantity,
      length,
      height,
      width,
      weight,
      unit,
      model,
      model_number as modelNumber,
      serial_number as serialNumber,
      year_manufactured as yearManufactured,
      wattage,
      fuel_type as fuelType,
      hourly_rate as hourlyRate,
      daily_rate as dailyRate,
      weekly_rate as weeklyRate,
      monthly_rate as monthlyRate,
      security_deposit as securityDeposit,
      status,
      qr_code as qrCode,
      barcode,
      location,
      notes,
      last_maintenance_date as lastMaintenanceDate,
      next_maintenance_date as nextMaintenanceDate,
      maintenance_interval_days as maintenanceIntervalDays,
      created_at as createdAt,
      updated_at as updatedAt
    FROM equipment_items 
    ORDER BY created_at DESC
  `
  return await executeQuery(query)
}

export async function addEquipmentToDB(equipment: any) {
  const query = `
    INSERT INTO equipment_items (
      name, item_type, category_id, brand, equipment_condition,
      total_quantity, available_quantity, reserved_quantity, maintenance_quantity,
      length, height, width, weight, unit,
      model, model_number, serial_number, year_manufactured, wattage, fuel_type,
      hourly_rate, daily_rate, weekly_rate, monthly_rate, security_deposit,
      status, qr_code, barcode, location, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  const params = [
    equipment.name,
    equipment.type,
    equipment.categoryId,
    equipment.brand,
    equipment.condition,
    equipment.totalQuantity,
    equipment.availableQuantity,
    equipment.reservedQuantity,
    equipment.maintenanceQuantity,
    equipment.length,
    equipment.height,
    equipment.width,
    equipment.weight,
    equipment.unit,
    equipment.model,
    equipment.modelNumber,
    equipment.serialNumber,
    equipment.yearManufactured,
    equipment.wattage,
    equipment.fuelType,
    equipment.hourlyRate,
    equipment.dailyRate,
    equipment.weeklyRate,
    equipment.monthlyRate,
    equipment.securityDeposit,
    equipment.status,
    equipment.qrCode,
    equipment.barcode,
    equipment.location,
    equipment.notes,
  ]

  const result = await executeQuery(query, params)
  return result
}

export async function searchEquipmentInDB(searchQuery: string) {
  const query = `
    SELECT 
      id, name, item_type as type, brand, equipment_condition as \`condition\`,
      total_quantity as totalQuantity, available_quantity as availableQuantity,
      daily_rate as dailyRate, security_deposit as securityDeposit,
      status, qr_code as qrCode, location
    FROM equipment_items 
    WHERE name LIKE ? 
       OR brand LIKE ? 
       OR qr_code LIKE ?
       OR location LIKE ?
    ORDER BY name
  `
  const searchTerm = `%${searchQuery}%`
  return await executeQuery(query, [searchTerm, searchTerm, searchTerm, searchTerm])
}

// Customer operations
export async function getCustomersFromDB() {
  const query = `
    SELECT 
      id,
      customer_type as customerType,
      name,
      company_name as companyName,
      contact_person as contactPerson,
      primary_phone as primaryPhone,
      secondary_phone as secondaryPhone,
      email,
      id_number as idNumber,
      business_reg_number as businessRegNumber,
      address_line1 as addressLine1,
      address_line2 as addressLine2,
      city,
      district,
      postal_code as postalCode,
      credit_limit as creditLimit,
      outstanding_balance as outstandingBalance,
      total_rentals as totalRentals,
      total_spent as totalSpent,
      status,
      notes,
      created_at as createdAt,
      updated_at as updatedAt
    FROM customers 
    WHERE status = 'active'
    ORDER BY created_at DESC
  `
  return await executeQuery(query)
}

export async function addCustomerToDB(customer: any) {
  const query = `
    INSERT INTO customers (
      customer_type, name, company_name, contact_person,
      primary_phone, secondary_phone, email, id_number, business_reg_number,
      address_line1, address_line2, city, district, postal_code,
      credit_limit, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `

  const params = [
    customer.customerType,
    customer.name,
    customer.companyName,
    customer.contactPerson,
    customer.primaryPhone,
    customer.secondaryPhone,
    customer.email,
    customer.idNumber,
    customer.businessRegNumber,
    customer.addressLine1,
    customer.addressLine2,
    customer.city,
    customer.district,
    customer.postalCode,
    customer.creditLimit,
  ]

  return await executeQuery(query, params)
}

export async function searchCustomersInDB(searchQuery: string) {
  const query = `
    SELECT 
      id, name, customer_type as customerType, company_name as companyName,
      primary_phone as primaryPhone, email, id_number as idNumber,
      city, district, status, outstanding_balance as outstandingBalance
    FROM customers 
    WHERE name LIKE ? 
       OR primary_phone LIKE ? 
       OR id_number LIKE ? 
       OR email LIKE ?
       OR company_name LIKE ?
    ORDER BY name
  `
  const searchTerm = `%${searchQuery}%`
  return await executeQuery(query, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm])
}

// Rental operations
export async function getRentalsFromDB() {
  const query = `
    SELECT 
      r.id,
      r.rental_number as rentalNumber,
      r.customer_id as customerId,
      r.customer_name as customerName,
      r.customer_phone as customerPhone,
      r.admin_id as adminId,
      r.rental_date as rentalDate,
      r.start_date as startDate,
      r.expected_return_date as expectedReturnDate,
      r.actual_return_date as actualReturnDate,
      r.subtotal,
      r.tax_rate as taxRate,
      r.tax_amount as taxAmount,
      r.discount_amount as discountAmount,
      r.security_deposit as securityDeposit,
      r.total_amount as totalAmount,
      r.paid_amount as paidAmount,
      r.outstanding_amount as outstandingAmount,
      r.status,
      r.payment_status as paymentStatus,
      r.delivery_required as deliveryRequired,
      r.delivery_address as deliveryAddress,
      r.delivery_fee as deliveryFee,
      r.pickup_required as pickupRequired,
      r.pickup_fee as pickupFee,
      r.notes,
      r.qr_code as qrCode,
      r.created_at as createdAt,
      r.updated_at as updatedAt
    FROM rentals r
    ORDER BY r.created_at DESC
  `
  return await executeQuery(query)
}

export async function getRentalItemsByRentalId(rentalId: string) {
  const query = `
    SELECT 
      id,
      equipment_id as equipmentId,
      equipment_name as equipmentName,
      quantity,
      rate_type as rateType,
      rate,
      duration,
      subtotal,
      condition_out as conditionOut,
      condition_in as conditionIn,
      damage_notes as damageNotes,
      damage_charges as damageCharges
    FROM rental_items 
    WHERE rental_id = ?
    ORDER BY created_at
  `
  return await executeQuery(query, [rentalId])
}

export async function addRentalToDB(rental: any) {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Insert rental
    const rentalQuery = `
      INSERT INTO rentals (
        rental_number, customer_id, customer_name, customer_phone, admin_id,
        rental_date, start_date, expected_return_date,
        subtotal, tax_rate, tax_amount, discount_amount, security_deposit,
        total_amount, paid_amount, outstanding_amount,
        status, payment_status, delivery_required, delivery_fee,
        pickup_required, pickup_fee, notes, qr_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const rentalParams = [
      rental.rentalNumber,
      rental.customerId,
      rental.customerName,
      rental.customerPhone,
      rental.adminId,
      rental.rentalDate,
      rental.startDate,
      rental.expectedReturnDate,
      rental.subtotal,
      rental.taxRate,
      rental.taxAmount,
      rental.discountAmount,
      rental.securityDeposit,
      rental.totalAmount,
      rental.paidAmount,
      rental.outstandingAmount,
      rental.status,
      rental.paymentStatus,
      rental.deliveryRequired,
      rental.deliveryFee,
      rental.pickupRequired,
      rental.pickupFee,
      rental.notes,
      rental.qrCode,
    ]

    const [rentalResult] = await connection.execute(rentalQuery, rentalParams)
    const rentalId = (rentalResult as any).insertId

    // Insert rental items
    for (const item of rental.items) {
      const itemQuery = `
        INSERT INTO rental_items (
          rental_id, equipment_id, equipment_name, quantity,
          rate_type, rate, duration, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `

      const itemParams = [
        rentalId,
        item.equipmentId,
        item.equipmentName,
        item.quantity,
        item.rateType,
        item.rate,
        item.duration,
        item.subtotal,
      ]

      await connection.execute(itemQuery, itemParams)

      // Update equipment availability
      const updateEquipmentQuery = `
        UPDATE equipment_items 
        SET available_quantity = available_quantity - ?,
            reserved_quantity = reserved_quantity + ?
        WHERE id = ?
      `
      await connection.execute(updateEquipmentQuery, [item.quantity, item.quantity, item.equipmentId])
    }

    await connection.commit()
    return { id: rentalId, ...rental }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export async function searchRentalsInDB(searchQuery: string) {
  const query = `
    SELECT 
      id, rental_number as rentalNumber, customer_name as customerName,
      customer_phone as customerPhone, start_date as startDate,
      expected_return_date as expectedReturnDate, total_amount as totalAmount,
      status, payment_status as paymentStatus
    FROM rentals 
    WHERE rental_number LIKE ? 
       OR customer_name LIKE ? 
       OR customer_phone LIKE ?
       OR qr_code LIKE ?
    ORDER BY created_at DESC
  `
  const searchTerm = `%${searchQuery}%`
  return await executeQuery(query, [searchTerm, searchTerm, searchTerm, searchTerm])
}

// Analytics operations
export async function getAnalyticsFromDB() {
  // Revenue by month
  const revenueQuery = `
    SELECT 
      DATE_FORMAT(rental_date, '%Y-%m') as month,
      SUM(total_amount) as amount
    FROM rentals 
    WHERE status != 'cancelled'
    GROUP BY DATE_FORMAT(rental_date, '%Y-%m')
    ORDER BY month DESC
    LIMIT 12
  `

  // Equipment utilization
  const utilizationQuery = `
    SELECT 
      ec.name as category,
      ROUND(AVG((ei.total_quantity - ei.available_quantity) / ei.total_quantity * 100), 2) as percentage
    FROM equipment_items ei
    JOIN equipment_categories ec ON ei.category_id = ec.id
    WHERE ei.total_quantity > 0
    GROUP BY ec.name
  `

  // Rental status distribution
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

  const [revenue, utilization, status, customers] = await Promise.all([
    executeQuery(revenueQuery),
    executeQuery(utilizationQuery),
    executeQuery(statusQuery),
    executeQuery(customersQuery),
  ])

  return {
    revenue: { monthly: revenue },
    equipment: { utilization },
    rentals: { status },
    customers: { topCustomers: customers },
  }
}

// Utility functions
export async function generateRentalNumber() {
  const query = `SELECT COUNT(*) as count FROM rentals`
  const result = (await executeQuery(query)) as any[]
  const count = result[0].count + 1
  return `R${count.toString().padStart(3, "0")}`
}

export async function generateInvoiceNumber() {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `INV${year}${month}${random}`
}

export function generateQRCode(prefix = "QR"): string {
  return `${prefix}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

// Close pool connection
export async function closeConnection() {
  await pool.end()
}
