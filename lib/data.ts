// Enhanced data store with full functionality
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

  lastMaintenanceDate?: string
  nextMaintenanceDate?: string

  createdAt: string
  updatedAt: string
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

  addressLine1: string
  addressLine2?: string
  city: string
  district: string
  postalCode: string

  creditLimit: number
  outstandingBalance: number
  totalRentals: number
  totalSpent: number

  status: "active" | "inactive" | "blacklisted"
  notes?: string

  createdAt: string
  updatedAt: string
}

export interface RentalItem {
  id: string
  equipmentId: string
  equipmentName: string
  quantity: number
  rateType: "hourly" | "daily" | "weekly" | "monthly"
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
  adminId: string

  rentalDate: string
  startDate: string
  expectedReturnDate: string
  actualReturnDate?: string

  items: RentalItem[]

  subtotal: number
  taxRate: number
  taxAmount: number
  discountAmount: number
  securityDeposit: number
  totalAmount: number
  paidAmount: number
  outstandingAmount: number

  status: "draft" | "active" | "returned" | "overdue" | "cancelled"
  paymentStatus: "pending" | "partial" | "paid" | "overdue"

  deliveryRequired: boolean
  deliveryAddress?: string
  deliveryFee: number
  pickupRequired: boolean
  pickupFee: number

  notes?: string
  termsConditions?: string
  qrCode: string

  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  rentalId: string
  customerId: string
  paymentNumber: string
  amount: number
  paymentMethod: "cash" | "card" | "bank_transfer" | "cheque"
  paymentDate: string
  referenceNumber?: string
  notes?: string
  createdAt: string
}

export interface Invoice {
  id: string
  rentalId: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  createdAt: string
  updatedAt: string
}

// Enhanced mock data with more realistic entries
const equipmentData: Equipment[] = [
  {
    id: "1",
    name: "Excavator CAT 320D",
    type: "machine",
    category: "Heavy Machinery",
    brand: "Caterpillar",
    condition: "excellent",
    totalQuantity: 3,
    availableQuantity: 1,
    reservedQuantity: 1,
    maintenanceQuantity: 1,
    model: "CAT 320D",
    modelNumber: "CAT320D2023",
    serialNumber: "CAT320D001",
    yearManufactured: 2023,
    wattage: 150000,
    fuelType: "diesel",
    hourlyRate: 5000,
    dailyRate: 35000,
    weeklyRate: 210000,
    monthlyRate: 800000,
    securityDeposit: 100000,
    status: "available",
    qrCode: "EXC001",
    barcode: "BAR001",
    location: "Yard A",
    lastMaintenanceDate: "2024-01-01",
    nextMaintenanceDate: "2024-04-01",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Steel Rebar 12mm",
    type: "material",
    category: "Construction Materials",
    brand: "Ceylon Steel",
    condition: "excellent",
    totalQuantity: 1000,
    availableQuantity: 750,
    reservedQuantity: 200,
    maintenanceQuantity: 0,
    length: 6.0,
    unit: "meters",
    dailyRate: 150,
    weeklyRate: 900,
    monthlyRate: 3600,
    securityDeposit: 0,
    status: "available",
    qrCode: "STL001",
    barcode: "BAR005",
    location: "Material Store",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "3",
    name: "Concrete Mixer Honda",
    type: "machine",
    category: "Concrete Equipment",
    brand: "Honda",
    condition: "good",
    totalQuantity: 5,
    availableQuantity: 3,
    reservedQuantity: 2,
    maintenanceQuantity: 0,
    model: "CM500",
    modelNumber: "CM500-2023",
    serialNumber: "HON500001",
    yearManufactured: 2023,
    wattage: 5000,
    fuelType: "petrol",
    hourlyRate: 1200,
    dailyRate: 8000,
    weeklyRate: 48000,
    monthlyRate: 180000,
    securityDeposit: 20000,
    status: "available",
    qrCode: "MIX001",
    barcode: "BAR003",
    location: "Yard B",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "4",
    name: "Bulldozer Komatsu D65",
    type: "machine",
    category: "Heavy Machinery",
    brand: "Komatsu",
    condition: "excellent",
    totalQuantity: 2,
    availableQuantity: 2,
    reservedQuantity: 0,
    maintenanceQuantity: 0,
    model: "D65PX-18",
    modelNumber: "D65PX001",
    serialNumber: "KOM65001",
    yearManufactured: 2022,
    wattage: 180000,
    fuelType: "diesel",
    hourlyRate: 6000,
    dailyRate: 42000,
    weeklyRate: 252000,
    monthlyRate: 960000,
    securityDeposit: 120000,
    status: "available",
    qrCode: "BUL001",
    barcode: "BAR002",
    location: "Yard A",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "5",
    name: "Angle Grinder Bosch",
    type: "machine",
    category: "Power Tools",
    brand: "Bosch",
    condition: "excellent",
    totalQuantity: 15,
    availableQuantity: 12,
    reservedQuantity: 3,
    maintenanceQuantity: 0,
    model: "GWS 2000",
    modelNumber: "GWS2000-230",
    serialNumber: "BOS2000001",
    yearManufactured: 2023,
    wattage: 2000,
    fuelType: "electric",
    hourlyRate: 300,
    dailyRate: 1500,
    weeklyRate: 9000,
    monthlyRate: 30000,
    securityDeposit: 5000,
    status: "available",
    qrCode: "GRN001",
    barcode: "BAR004",
    location: "Tool Room",
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-12T10:00:00Z",
  },
  {
    id: "6",
    name: "Mobile Crane 25T",
    type: "machine",
    category: "Lifting Equipment",
    brand: "Tadano",
    condition: "good",
    totalQuantity: 1,
    availableQuantity: 0,
    reservedQuantity: 1,
    maintenanceQuantity: 0,
    model: "GR-250XL",
    modelNumber: "GR250XL001",
    serialNumber: "TAD250001",
    yearManufactured: 2021,
    wattage: 200000,
    fuelType: "diesel",
    hourlyRate: 8000,
    dailyRate: 55000,
    weeklyRate: 330000,
    monthlyRate: 1200000,
    securityDeposit: 200000,
    status: "rented",
    qrCode: "CRN001",
    barcode: "BAR008",
    location: "Yard A",
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
]

const customerData: Customer[] = [
  {
    id: "1",
    customerType: "individual",
    name: "John Silva",
    primaryPhone: "+94771234567",
    email: "john.silva@email.com",
    idNumber: "123456789V",
    addressLine1: "No. 123, Main Street",
    addressLine2: "Matara South",
    city: "Matara",
    district: "Matara",
    postalCode: "81000",
    creditLimit: 500000,
    outstandingBalance: 63400,
    totalRentals: 8,
    totalSpent: 450000,
    status: "active",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-22T10:00:00Z",
  },
  {
    id: "2",
    customerType: "company",
    name: "ABC Construction Ltd",
    companyName: "ABC Construction Ltd",
    contactPerson: "Sunil Perera",
    primaryPhone: "+94777654321",
    secondaryPhone: "+94112345678",
    email: "info@abcconstruction.lk",
    idNumber: "PV00123456",
    businessRegNumber: "PV00123456",
    addressLine1: "No. 456, Industrial Zone",
    addressLine2: "Galle Road",
    city: "Galle",
    district: "Galle",
    postalCode: "80000",
    creditLimit: 2000000,
    outstandingBalance: 275000,
    totalRentals: 25,
    totalSpent: 1850000,
    status: "active",
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "3",
    customerType: "company",
    name: "Metro Builders",
    companyName: "Metro Builders (Pvt) Ltd",
    contactPerson: "Kamal Fernando",
    primaryPhone: "+94712345678",
    secondaryPhone: "+94115678901",
    email: "contact@metrobuilders.lk",
    idNumber: "PV00789012",
    businessRegNumber: "PV00789012",
    addressLine1: "No. 789, Commercial Street",
    addressLine2: "Colombo 03",
    city: "Colombo",
    district: "Colombo",
    postalCode: "00300",
    creditLimit: 5000000,
    outstandingBalance: 0,
    totalRentals: 15,
    totalSpent: 2100000,
    status: "active",
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-18T10:00:00Z",
  },
  {
    id: "4",
    customerType: "individual",
    name: "Nimal Rajapaksa",
    primaryPhone: "+94701234567",
    email: "nimal.r@email.com",
    idNumber: "987654321V",
    addressLine1: "No. 321, Temple Road",
    addressLine2: "Tangalle",
    city: "Tangalle",
    district: "Hambantota",
    postalCode: "82200",
    creditLimit: 300000,
    outstandingBalance: 0,
    totalRentals: 3,
    totalSpent: 125000,
    status: "active",
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "5",
    customerType: "company",
    name: "Lanka Constructions",
    companyName: "Lanka Constructions (Pvt) Ltd",
    contactPerson: "Priya Wickramasinghe",
    primaryPhone: "+94765432109",
    secondaryPhone: "+94117654321",
    email: "admin@lankaconstructions.lk",
    idNumber: "PV00456789",
    businessRegNumber: "PV00456789",
    addressLine1: "No. 654, New Town",
    addressLine2: "Kandy Road",
    city: "Kandy",
    district: "Kandy",
    postalCode: "20000",
    creditLimit: 1500000,
    outstandingBalance: 180000,
    totalRentals: 12,
    totalSpent: 980000,
    status: "active",
    createdAt: "2024-01-06T10:00:00Z",
    updatedAt: "2024-01-19T10:00:00Z",
  },
]

const rentalData: Rental[] = [
  {
    id: "1",
    rentalNumber: "R001",
    customerId: "1",
    customerName: "John Silva",
    customerPhone: "+94771234567",
    adminId: "1",
    rentalDate: "2024-01-22T10:00:00Z",
    startDate: "2024-01-22",
    expectedReturnDate: "2024-01-25",
    items: [
      {
        id: "1",
        equipmentId: "1",
        equipmentName: "Excavator CAT 320D",
        quantity: 1,
        rateType: "daily",
        rate: 35000,
        duration: 3,
        subtotal: 105000,
      },
    ],
    subtotal: 105000,
    taxRate: 8,
    taxAmount: 8400,
    discountAmount: 0,
    securityDeposit: 100000,
    totalAmount: 113400,
    paidAmount: 50000,
    outstandingAmount: 63400,
    status: "active",
    paymentStatus: "partial",
    deliveryRequired: false,
    deliveryFee: 0,
    pickupRequired: false,
    pickupFee: 0,
    qrCode: "RNT001",
    createdAt: "2024-01-22T10:00:00Z",
    updatedAt: "2024-01-22T10:00:00Z",
  },
  {
    id: "2",
    rentalNumber: "R002",
    customerId: "2",
    customerName: "ABC Construction Ltd",
    customerPhone: "+94777654321",
    adminId: "1",
    rentalDate: "2024-01-18T10:00:00Z",
    startDate: "2024-01-18",
    expectedReturnDate: "2024-01-23",
    items: [
      {
        id: "2",
        equipmentId: "3",
        equipmentName: "Concrete Mixer Honda",
        quantity: 2,
        rateType: "daily",
        rate: 8000,
        duration: 5,
        subtotal: 80000,
      },
    ],
    subtotal: 80000,
    taxRate: 8,
    taxAmount: 6400,
    discountAmount: 5000,
    securityDeposit: 40000,
    totalAmount: 81400,
    paidAmount: 81400,
    outstandingAmount: 0,
    status: "overdue",
    paymentStatus: "paid",
    deliveryRequired: true,
    deliveryAddress: "Construction Site, Galle Road",
    deliveryFee: 5000,
    pickupRequired: true,
    pickupFee: 5000,
    qrCode: "RNT002",
    createdAt: "2024-01-18T10:00:00Z",
    updatedAt: "2024-01-23T10:00:00Z",
  },
  {
    id: "3",
    rentalNumber: "R003",
    customerId: "3",
    customerName: "Metro Builders",
    customerPhone: "+94712345678",
    adminId: "1",
    rentalDate: "2024-01-20T10:00:00Z",
    startDate: "2024-01-20",
    expectedReturnDate: "2024-01-22",
    actualReturnDate: "2024-01-22",
    items: [
      {
        id: "3",
        equipmentId: "2",
        equipmentName: "Steel Rebar 12mm",
        quantity: 100,
        rateType: "daily",
        rate: 150,
        duration: 2,
        subtotal: 30000,
      },
    ],
    subtotal: 30000,
    taxRate: 8,
    taxAmount: 2400,
    discountAmount: 0,
    securityDeposit: 0,
    totalAmount: 32400,
    paidAmount: 32400,
    outstandingAmount: 0,
    status: "returned",
    paymentStatus: "paid",
    deliveryRequired: false,
    deliveryFee: 0,
    pickupRequired: false,
    pickupFee: 0,
    qrCode: "RNT003",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-22T10:00:00Z",
  },
  {
    id: "4",
    rentalNumber: "R004",
    customerId: "5",
    customerName: "Lanka Constructions",
    customerPhone: "+94765432109",
    adminId: "1",
    rentalDate: "2024-01-15T10:00:00Z",
    startDate: "2024-01-15",
    expectedReturnDate: "2024-01-30",
    items: [
      {
        id: "4",
        equipmentId: "6",
        equipmentName: "Mobile Crane 25T",
        quantity: 1,
        rateType: "weekly",
        rate: 330000,
        duration: 2,
        subtotal: 660000,
      },
    ],
    subtotal: 660000,
    taxRate: 8,
    taxAmount: 52800,
    discountAmount: 20000,
    securityDeposit: 200000,
    totalAmount: 692800,
    paidAmount: 400000,
    outstandingAmount: 292800,
    status: "active",
    paymentStatus: "partial",
    deliveryRequired: true,
    deliveryAddress: "Highway Construction Site, Matara",
    deliveryFee: 15000,
    pickupRequired: true,
    pickupFee: 15000,
    qrCode: "RNT004",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
]

// Analytics data
export interface AnalyticsData {
  revenue: {
    daily: { date: string; amount: number }[]
    monthly: { month: string; amount: number }[]
    yearly: { year: string; amount: number }[]
  }
  equipment: {
    utilization: { category: string; percentage: number }[]
    popular: { name: string; rentals: number }[]
    revenue: { name: string; revenue: number }[]
  }
  customers: {
    segments: { type: string; count: number; revenue: number }[]
    topCustomers: { name: string; totalSpent: number; rentals: number }[]
    growth: { month: string; newCustomers: number }[]
  }
  rentals: {
    status: { status: string; count: number }[]
    trends: { month: string; count: number }[]
    duration: { duration: string; count: number }[]
  }
}

const analyticsData: AnalyticsData = {
  revenue: {
    daily: [
      { date: "2024-01-15", amount: 125000 },
      { date: "2024-01-16", amount: 89000 },
      { date: "2024-01-17", amount: 156000 },
      { date: "2024-01-18", amount: 203000 },
      { date: "2024-01-19", amount: 178000 },
      { date: "2024-01-20", amount: 234000 },
      { date: "2024-01-21", amount: 198000 },
      { date: "2024-01-22", amount: 267000 },
      { date: "2024-01-23", amount: 145000 },
      { date: "2024-01-24", amount: 189000 },
    ],
    monthly: [
      { month: "Oct 2023", amount: 2450000 },
      { month: "Nov 2023", amount: 2780000 },
      { month: "Dec 2023", amount: 3120000 },
      { month: "Jan 2024", amount: 3450000 },
    ],
    yearly: [
      { year: "2021", amount: 18500000 },
      { year: "2022", amount: 24300000 },
      { year: "2023", amount: 31200000 },
      { year: "2024", amount: 8900000 },
    ],
  },
  equipment: {
    utilization: [
      { category: "Heavy Machinery", percentage: 85 },
      { category: "Concrete Equipment", percentage: 72 },
      { category: "Power Tools", percentage: 68 },
      { category: "Lifting Equipment", percentage: 90 },
      { category: "Construction Materials", percentage: 45 },
      { category: "Safety Equipment", percentage: 55 },
    ],
    popular: [
      { name: "Excavator CAT 320D", rentals: 45 },
      { name: "Concrete Mixer Honda", rentals: 38 },
      { name: "Mobile Crane 25T", rentals: 32 },
      { name: "Bulldozer Komatsu D65", rentals: 28 },
      { name: "Angle Grinder Bosch", rentals: 25 },
    ],
    revenue: [
      { name: "Heavy Machinery", revenue: 15600000 },
      { name: "Lifting Equipment", revenue: 8900000 },
      { name: "Concrete Equipment", revenue: 4200000 },
      { name: "Power Tools", revenue: 1800000 },
      { name: "Construction Materials", revenue: 950000 },
    ],
  },
  customers: {
    segments: [
      { type: "Company", count: 35, revenue: 28500000 },
      { type: "Individual", count: 52, revenue: 3200000 },
    ],
    topCustomers: [
      { name: "Metro Builders", totalSpent: 2100000, rentals: 15 },
      { name: "ABC Construction Ltd", totalSpent: 1850000, rentals: 25 },
      { name: "Lanka Constructions", totalSpent: 980000, rentals: 12 },
      { name: "John Silva", totalSpent: 450000, rentals: 8 },
      { name: "Nimal Rajapaksa", totalSpent: 125000, rentals: 3 },
    ],
    growth: [
      { month: "Oct 2023", newCustomers: 8 },
      { month: "Nov 2023", newCustomers: 12 },
      { month: "Dec 2023", newCustomers: 15 },
      { month: "Jan 2024", newCustomers: 18 },
    ],
  },
  rentals: {
    status: [
      { status: "Active", count: 23 },
      { status: "Returned", count: 156 },
      { status: "Overdue", count: 3 },
      { status: "Cancelled", count: 2 },
    ],
    trends: [
      { month: "Oct 2023", count: 45 },
      { month: "Nov 2023", count: 52 },
      { month: "Dec 2023", count: 48 },
      { month: "Jan 2024", count: 67 },
    ],
    duration: [
      { duration: "1-3 days", count: 89 },
      { duration: "4-7 days", count: 56 },
      { duration: "1-2 weeks", count: 34 },
      { duration: "1+ month", count: 12 },
    ],
  },
}

// Data access functions with full CRUD operations
export const getEquipment = (): Equipment[] => [...equipmentData]
export const getCustomers = (): Customer[] => [...customerData]
export const getRentals = (): Rental[] => [...rentalData]
export const getAnalytics = (): AnalyticsData => analyticsData

export const getEquipmentById = (id: string): Equipment | undefined => {
  return equipmentData.find((e) => e.id === id)
}

export const getCustomerById = (id: string): Customer | undefined => {
  return customerData.find((c) => c.id === id)
}

export const getRentalById = (id: string): Rental | undefined => {
  return rentalData.find((r) => r.id === id)
}

export const addEquipment = (equipment: Omit<Equipment, "id" | "createdAt" | "updatedAt">): Equipment => {
  const newEquipment: Equipment = {
    ...equipment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  equipmentData.push(newEquipment)
  return newEquipment
}

export const addCustomer = (
  customer: Omit<Customer, "id" | "createdAt" | "updatedAt" | "totalRentals" | "totalSpent" | "outstandingBalance">,
): Customer => {
  const newCustomer: Customer = {
    ...customer,
    id: Date.now().toString(),
    totalRentals: 0,
    totalSpent: 0,
    outstandingBalance: 0,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  customerData.push(newCustomer)
  return newCustomer
}

export const addRental = (rental: Omit<Rental, "id" | "createdAt" | "updatedAt">): Rental => {
  const newRental: Rental = {
    ...rental,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  rentalData.push(newRental)

  // Update equipment availability
  rental.items.forEach((item) => {
    const equipment = equipmentData.find((e) => e.id === item.equipmentId)
    if (equipment) {
      equipment.availableQuantity -= item.quantity
      equipment.reservedQuantity += item.quantity
      equipment.updatedAt = new Date().toISOString()
    }
  })

  // Update customer stats
  const customer = customerData.find((c) => c.id === rental.customerId)
  if (customer) {
    customer.totalRentals += 1
    customer.totalSpent += rental.totalAmount
    customer.outstandingBalance += rental.outstandingAmount
    customer.updatedAt = new Date().toISOString()
  }

  return newRental
}

export const updateEquipment = (id: string, updates: Partial<Equipment>): Equipment | null => {
  const index = equipmentData.findIndex((e) => e.id === id)
  if (index === -1) return null

  equipmentData[index] = {
    ...equipmentData[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  return equipmentData[index]
}

export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | null => {
  const index = customerData.findIndex((c) => c.id === id)
  if (index === -1) return null

  customerData[index] = {
    ...customerData[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  return customerData[index]
}

export const updateRental = (id: string, updates: Partial<Rental>): Rental | null => {
  const index = rentalData.findIndex((r) => r.id === id)
  if (index === -1) return null

  const oldRental = rentalData[index]
  rentalData[index] = {
    ...oldRental,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  // Handle equipment return
  if (updates.status === "returned" && oldRental.status !== "returned") {
    oldRental.items.forEach((item) => {
      const equipment = equipmentData.find((e) => e.id === item.equipmentId)
      if (equipment) {
        equipment.availableQuantity += item.quantity
        equipment.reservedQuantity -= item.quantity
        equipment.updatedAt = new Date().toISOString()
      }
    })
  }

  return rentalData[index]
}

export const deleteEquipment = (id: string): boolean => {
  const index = equipmentData.findIndex((e) => e.id === id)
  if (index === -1) return false

  equipmentData.splice(index, 1)
  return true
}

export const deleteCustomer = (id: string): boolean => {
  const index = customerData.findIndex((c) => c.id === id)
  if (index === -1) return false

  customerData.splice(index, 1)
  return true
}

export const generateRentalNumber = (): string => {
  const count = rentalData.length + 1
  return `R${count.toString().padStart(3, "0")}`
}

export const generateInvoiceNumber = (): string => {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `INV${year}${month}${random}`
}

export const generateQRCode = (prefix = "QR"): string => {
  return `${prefix}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

// Search and filter functions with proper null/undefined checks
export const searchEquipment = (query: string): Equipment[] => {
  if (!query || query.trim() === "") return equipmentData

  const lowercaseQuery = query.toLowerCase()
  return equipmentData.filter(
    (equipment) =>
      (equipment.name && equipment.name.toLowerCase().includes(lowercaseQuery)) ||
      (equipment.category && equipment.category.toLowerCase().includes(lowercaseQuery)) ||
      (equipment.brand && equipment.brand.toLowerCase().includes(lowercaseQuery)) ||
      (equipment.qrCode && equipment.qrCode.toLowerCase().includes(lowercaseQuery)),
  )
}

export const searchCustomers = (query: string): Customer[] => {
  if (!query || query.trim() === "") return customerData

  const lowercaseQuery = query.toLowerCase()
  return customerData.filter(
    (customer) =>
      (customer.name && customer.name.toLowerCase().includes(lowercaseQuery)) ||
      (customer.primaryPhone && customer.primaryPhone.includes(query)) ||
      (customer.idNumber && customer.idNumber.toLowerCase().includes(lowercaseQuery)) ||
      (customer.email && customer.email.toLowerCase().includes(lowercaseQuery)) ||
      (customer.companyName && customer.companyName.toLowerCase().includes(lowercaseQuery)),
  )
}

export const searchRentals = (query: string): Rental[] => {
  if (!query || query.trim() === "") return rentalData

  const lowercaseQuery = query.toLowerCase()
  return rentalData.filter(
    (rental) =>
      (rental.rentalNumber && rental.rentalNumber.toLowerCase().includes(lowercaseQuery)) ||
      (rental.customerName && rental.customerName.toLowerCase().includes(lowercaseQuery)) ||
      (rental.qrCode && rental.qrCode.toLowerCase().includes(lowercaseQuery)),
  )
}
