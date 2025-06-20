"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Calendar,
  User,
  Phone,
  Mail,
  ArrowLeft,
  Download,
  Printer,
} from "lucide-react"
import { getRentalById, getCustomerById } from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

export default function CheckStatusPage() {
  const params = useParams()
  const rental = getRentalById(params.id as string)
  const customer = rental ? getCustomerById(rental.customerId) : null

  if (!rental || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Rental Not Found</h2>
            <p className="text-gray-600 mb-6">
              The rental information you're looking for could not be found. Please check the QR code or contact support.
            </p>
            <Button asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "partial":
        return <Clock className="h-6 w-6 text-yellow-500" />
      default:
        return <AlertTriangle className="h-6 w-6 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Image src="/logo.png" alt="Company Logo" width={40} height={40} className="rounded" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bill Status Check</h1>
                <p className="text-gray-600">Real-time rental and payment information</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Status Overview Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Rental #{rental.rentalNumber}</CardTitle>
                <p className="text-gray-600 mt-1">Status checked on {formatDate(new Date())}</p>
              </div>
              <div className="text-right">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(rental.paymentStatus)}`}
                >
                  {getStatusIcon(rental.paymentStatus)}
                  <span className="font-semibold">{rental.paymentStatus.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Total Amount</h3>
                </div>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(rental.totalAmount)}</p>
                <p className="text-sm text-gray-600 mt-1">Invoice total including tax</p>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Amount Paid</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(rental.paidAmount)}</p>
                <p className="text-sm text-gray-600 mt-1">Payments received</p>
              </div>

              <div
                className={`p-6 rounded-xl border ${
                  rental.outstandingAmount > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle
                    className={`h-5 w-5 ${rental.outstandingAmount > 0 ? "text-red-600" : "text-gray-600"}`}
                  />
                  <h3 className="font-semibold text-gray-900">Outstanding</h3>
                </div>
                <p className={`text-2xl font-bold ${rental.outstandingAmount > 0 ? "text-red-600" : "text-gray-600"}`}>
                  {formatCurrency(rental.outstandingAmount)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {rental.outstandingAmount > 0 ? "Amount due" : "Fully paid"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Customer Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    {customer.companyName && <p className="text-gray-600">{customer.companyName}</p>}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{customer.primaryPhone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Rental Timeline
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{formatDate(rental.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Return:</span>
                    <span className="font-medium">{formatDate(rental.expectedReturnDate)}</span>
                  </div>
                  {rental.actualReturnDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual Return:</span>
                      <span className="font-medium text-green-600">{formatDate(rental.actualReturnDate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rental Status:</span>
                    <Badge variant={rental.status === "active" ? "default" : "secondary"}>
                      {rental.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Equipment Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Equipment Rented</h3>
              <div className="space-y-3">
                {rental.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.equipmentName}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} • Duration: {item.duration} {item.rateType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.rate)} per {item.rateType}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print Details
              </Button>
              {rental.outstandingAmount > 0 && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Make Payment
                </Button>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                For any questions about your rental or payment, contact our support team:
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-blue-600">
                  <Phone className="h-4 w-4" />
                  <span>+94777209227</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Mail className="h-4 w-4" />
                  <span>info@dickwellaconstruction.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
