// Database connection and queries for production use
// Replace the mock data functions with real database operations

import { neon } from "@neondatabase/serverless"

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!)

// Equipment operations
export async function getEquipmentFromDB() {
  const result = await sql`
    SELECT * FROM equipment 
    ORDER BY created_at DESC
  `
  return result
}

export async function addEquipmentToDB(equipment: any) {
  const result = await sql`
    INSERT INTO equipment (
      name, type, category, brand, condition,
      total_quantity, available_quantity, daily_rate,
      security_deposit, qr_code, location, status
    ) VALUES (
      ${equipment.name}, ${equipment.type}, ${equipment.category},
      ${equipment.brand}, ${equipment.condition}, ${equipment.totalQuantity},
      ${equipment.availableQuantity}, ${equipment.dailyRate},
      ${equipment.securityDeposit}, ${equipment.qrCode},
      ${equipment.location}, ${equipment.status}
    )
    RETURNING *
  `
  return result[0]
}

// Customer operations
export async function getCustomersFromDB() {
  const result = await sql`
    SELECT * FROM customers 
    WHERE status = 'active'
    ORDER BY created_at DESC
  `
  return result
}

export async function addCustomerToDB(customer: any) {
  const result = await sql`
    INSERT INTO customers (
      customer_type, name, company_name, contact_person,
      primary_phone, secondary_phone, email, id_number,
      business_reg_number, address_line1, address_line2,
      city, district, postal_code, credit_limit
    ) VALUES (
      ${customer.customerType}, ${customer.name}, ${customer.companyName},
      ${customer.contactPerson}, ${customer.primaryPhone}, ${customer.secondaryPhone},
      ${customer.email}, ${customer.idNumber}, ${customer.businessRegNumber},
      ${customer.addressLine1}, ${customer.addressLine2}, ${customer.city},
      ${customer.district}, ${customer.postalCode}, ${customer.creditLimit}
    )
    RETURNING *
  `
  return result[0]
}

// Rental operations
export async function getRentalsFromDB() {
  const result = await sql`
    SELECT r.*, 
           json_agg(
             json_build_object(
               'id', ri.id,
               'equipmentId', ri.equipment_id,
               'equipmentName', ri.equipment_name,
               'quantity', ri.quantity,
               'rateType', ri.rate_type,
               'rate', ri.rate,
               'duration', ri.duration,
               'subtotal', ri.subtotal
             )
           ) as items
    FROM rentals r
    LEFT JOIN rental_items ri ON r.id = ri.rental_id
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `
  return result
}

export async function addRentalToDB(rental: any) {
  // Start transaction
  const rentalResult = await sql`
    INSERT INTO rentals (
      rental_number, customer_id, customer_name, customer_phone,
      admin_id, rental_date, start_date, expected_return_date,
      subtotal, tax_rate, tax_amount, discount_amount,
      security_deposit, total_amount, paid_amount,
      outstanding_amount, status, payment_status,
      delivery_required, delivery_fee, pickup_required,
      pickup_fee, qr_code
    ) VALUES (
      ${rental.rentalNumber}, ${rental.customerId}, ${rental.customerName},
      ${rental.customerPhone}, ${rental.adminId}, ${rental.rentalDate},
      ${rental.startDate}, ${rental.expectedReturnDate}, ${rental.subtotal},
      ${rental.taxRate}, ${rental.taxAmount}, ${rental.discountAmount},
      ${rental.securityDeposit}, ${rental.totalAmount}, ${rental.paidAmount},
      ${rental.outstandingAmount}, ${rental.status}, ${rental.paymentStatus},
      ${rental.deliveryRequired}, ${rental.deliveryFee}, ${rental.pickupRequired},
      ${rental.pickupFee}, ${rental.qrCode}
    )
    RETURNING *
  `

  // Add rental items
  for (const item of rental.items) {
    await sql`
      INSERT INTO rental_items (
        rental_id, equipment_id, equipment_name, quantity,
        rate_type, rate, duration, subtotal
      ) VALUES (
        ${rentalResult[0].id}, ${item.equipmentId}, ${item.equipmentName},
        ${item.quantity}, ${item.rateType}, ${item.rate},
        ${item.duration}, ${item.subtotal}
      )
    `
  }

  return rentalResult[0]
}

// Search functions
export async function searchEquipmentInDB(query: string) {
  const result = await sql`
    SELECT * FROM equipment 
    WHERE name ILIKE ${"%" + query + "%"}
       OR category ILIKE ${"%" + query + "%"}
       OR brand ILIKE ${"%" + query + "%"}
       OR qr_code ILIKE ${"%" + query + "%"}
    ORDER BY name
  `
  return result
}

export async function searchCustomersInDB(query: string) {
  const result = await sql`
    SELECT * FROM customers 
    WHERE name ILIKE ${"%" + query + "%"}
       OR primary_phone LIKE ${"%" + query + "%"}
       OR id_number ILIKE ${"%" + query + "%"}
       OR email ILIKE ${"%" + query + "%"}
       OR company_name ILIKE ${"%" + query + "%"}
    ORDER BY name
  `
  return result
}
