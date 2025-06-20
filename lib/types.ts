export interface Equipment {
  id: string
  name: string
  type: "material" | "machine"
  category: string
  brand?: string
  condition: "excellent" | "good" | "fair" | "needs_repair"
  totalQuantity: number
  availableQuantity: number
  reservedQuantity: number
  maintenanceQuantity: number

  // Material specific
  length?: number
  height?: number
  width?: number
  weight?: number
  unit?: string

  // Machine specific
  model?: string
  modelNumber?: string
  serialNumber?: string
  yearManufactured?: number
  wattage?: number
  fuelType?: string

  // Pricing
  hourlyRate?: number
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  securityDeposit: number

  status: "available" | "rented" | "maintenance" | "retired"
  qrCode: string
  barcode?: string
  location: string
  notes?: string

  // Maintenance
  lastMaintenanceDate?: Date
  nextMaintenanceDate?: Date
  maintenanceIntervalDays?: number

  createdAt: Date
  updatedAt?: Date
}

export interface Customer {
  id: string
  customerType: "individual" | "company"
  name: string
  companyName?: string
  contactPerson?: string
  primaryPhone: string
  secondaryPhone?: string
  email?: string
  idNumber: string
  businessRegNumber?: string

  // Address
  addressLine1: string
  addressLine2?: string
  city: string
  district: string
  postalCode: string

  // Financial
  creditLimit: number
  outstandingBalance: number
  totalRentals: number
  totalSpent: number

  status: "active" | "inactive" | "blacklisted"
  notes?: string

  createdAt: Date
  updatedAt?: Date
}

export interface RentalItem {
  id: string
  equipmentId: string
  equipmentName: string
  quantity: number
  rateType: "hourly" | "daily"
  rate: number
  duration: number
  subtotal: number
  conditionOut?: string
  conditionIn?: string
  damageNotes?: string
  damageCharges?: number
}

export interface Rental {
  id: string
  rentalNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  adminId?: string

  // Dates
  rentalDate: Date
  startDate: Date
  expectedReturnDate: Date
  actualReturnDate?: Date

  // Items
  items: RentalItem[]

  // Financial
  subtotal: number
  taxRate: number
  taxAmount: number
  discountAmount: number
  securityDeposit: number
  totalAmount: number
  paidAmount: number
  outstandingAmount: number

  // Status
  status: "active" | "returned" | "overdue" | "cancelled"
  paymentStatus: "pending" | "partial" | "paid" | "overdue"

  // Additional services
  deliveryRequired?: boolean
  deliveryAddress?: string
  deliveryFee?: number
  pickupRequired?: boolean
  pickupFee?: number

  notes?: string
  qrCode: string

  createdAt: Date
  updatedAt?: Date
}