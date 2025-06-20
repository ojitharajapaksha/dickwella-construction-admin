import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function isOverdue(expectedReturnDate: string): boolean {
  return new Date(expectedReturnDate) < new Date()
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
    case "available":
    case "excellent":
      return "bg-green-100 text-green-800"
    case "pending":
    case "partial":
    case "good":
      return "bg-yellow-100 text-yellow-800"
    case "overdue":
    case "maintenance":
    case "needs_repair":
      return "bg-red-100 text-red-800"
    case "returned":
    case "paid":
    case "inactive":
      return "bg-gray-100 text-gray-800"
    case "cancelled":
    case "retired":
    case "blacklisted":
      return "bg-red-100 text-red-800"
    default:
      return "bg-blue-100 text-blue-800"
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+94[0-9]{9}$/
  return phoneRegex.test(phone)
}

export function validateIdNumber(idNumber: string): boolean {
  // Sri Lankan NIC validation (basic)
  const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/
  return nicRegex.test(idNumber)
}

export function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `INV${year}${month}${random}`
}

export function generatePaymentNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `PAY${year}${month}${random}`
}
