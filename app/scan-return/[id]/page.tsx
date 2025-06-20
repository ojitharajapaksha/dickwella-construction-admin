"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { QrCode, Calculator, Clock, AlertTriangle, ArrowLeft, Save, Printer } from "lucide-react"
import { getRentalById, getCustomerById, updateRental } from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ScanReturnPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [rental, setRental] = useState(getRentalById(params.id as string))
  const [customer, setCustomer] = useState(rental ? getCustomerById(rental.customerId) : null)
  const [actualReturnDate, setActualReturnDate] = useState(new Date().toISOString().split("T")[0])
  const [actualReturnTime, setActualReturnTime] = useState(new Date().toTimeString().slice(0, 5))
  const [damageNotes, setDamageNotes] = useState("")
  const [additionalCharges, setAdditionalCharges] = useState(0)
  const [calculatedAmounts, setCalculatedAmounts] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (rental) {
      calculateFinalAmount()
    }
  }, [actualReturnDate, actualReturnTime, additionalCharges])

  if (!rental || !customer) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rental Not Found</h2>
          <p className="text-gray-600 mb-4">The requested rental could not be found.</p>
          <Link href="/dashboard/rentals">
            <Button>Back to Rentals</Button>
          </Link>
        </div>
      </div>
    )
  }

  const calculateFinalAmount = () => {
    const actualReturnDateTime = new Date(`${actualReturnDate}T${actualReturnTime}`)
    const startDateTime = new Date(rental.startDate)

    // Calculate actual duration in hours
    const actualHours = Math.ceil((actualReturnDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60))
    const actualDays = Math.ceil(actualHours / 24)

    let newSubtotal = 0
    const updatedItems = rental.items.map((item) => {
      let newDuration = 0
      let newSubtotalForItem = 0

      if (item.rateType === "hourly") {
        newDuration = actualHours
        newSubtotalForItem = item.quantity * item.rate * actualHours
      } else if (item.rateType === "daily") {
        newDuration = actualDays
        newSubtotalForItem = item.quantity * item.rate * actualDays
      } else if (item.rateType === "weekly") {
        const weeks = Math.ceil(actualDays / 7)
        newDuration = weeks
        newSubtotalForItem = item.quantity * item.rate * weeks
      } else if (item.rateType === "monthly") {
        const months = Math.ceil(actualDays / 30)
        newDuration = months
        newSubtotalForItem = item.quantity * item.rate * months
      }

      newSubtotal += newSubtotalForItem

      return {
        ...item,
        duration: newDuration,
        subtotal: newSubtotalForItem,
      }
    })

    // Calculate new totals
    const newTaxAmount = (newSubtotal * rental.taxRate) / 100
    const newTotalAmount =
      newSubtotal +
      newTaxAmount +
      rental.deliveryFee +
      rental.pickupFee +
      additionalCharges -
      rental.discountAmount +
      rental.securityDeposit
    const newOutstandingAmount = newTotalAmount - rental.paidAmount

    setCalculatedAmounts({
      items: updatedItems,
      subtotal: newSubtotal,
      taxAmount: newTaxAmount,
      totalAmount: newTotalAmount,
      outstandingAmount: newOutstandingAmount,
      actualHours,
      actualDays,
      additionalCharges,
    })
  }

  const processReturn = async () => {
    if (!calculatedAmounts) return

    setIsProcessing(true)

    try {
      const updatedRental = {
        ...rental,
        actualReturnDate: `${actualReturnDate}T${actualReturnTime}`,
        items: calculatedAmounts.items,
        subtotal: calculatedAmounts.subtotal,
        taxAmount: calculatedAmounts.taxAmount,
        totalAmount: calculatedAmounts.totalAmount,
        outstandingAmount: calculatedAmounts.outstandingAmount,
        status: "returned" as const,
        notes: damageNotes ? `${rental.notes || ""}\n\nReturn Notes: ${damageNotes}` : rental.notes,
      }

      const result = updateRental(rental.id, updatedRental)

      if (result) {
        toast({
          title: "Return Processed Successfully",
          description: `Final amount: ${formatCurrency(calculatedAmounts.totalAmount)}`,
        })

        // Redirect to updated invoice
        router.push(`/dashboard/rentals/${rental.id}/invoice`)
      } else {
        throw new Error("Failed to update rental")
      }
    } catch (error) {
      toast({
        title: "Error Processing Return",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const isOvertime =
    calculatedAmounts && new Date(`${actualReturnDate}T${actualReturnTime}`) > new Date(rental.expectedReturnDate)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/rentals/${rental.id}/invoice`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Invoice
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Process Equipment Return</h1>
                <p className="text-gray-600">Rental #{rental.rentalNumber} - QR Code Scanned</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="h-8 w-8 text-green-600" />
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                QR Verified
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Customer & Rental Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {customer.name}
              </p>
              {customer.companyName && (
                <p>
                  <strong>Company:</strong> {customer.companyName}
                </p>
              )}
              <p>
                <strong>Phone:</strong> {customer.primaryPhone}
              </p>
              <p>
                <strong>ID:</strong> {customer.idNumber}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Original Rental Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Start Date:</strong> {formatDate(rental.startDate)}
              </p>
              <p>
                <strong>Expected Return:</strong> {formatDate(rental.expectedReturnDate)}
              </p>
              <p>
                <strong>Original Amount:</strong> {formatCurrency(rental.totalAmount)}
              </p>
              <p>
                <strong>Paid Amount:</strong> {formatCurrency(rental.paidAmount)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Return Processing Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Return Processing & Final Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Return Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="returnDate">Actual Return Date</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={actualReturnDate}
                  onChange={(e) => setActualReturnDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="returnTime">Actual Return Time</Label>
                <Input
                  id="returnTime"
                  type="time"
                  value={actualReturnTime}
                  onChange={(e) => setActualReturnTime(e.target.value)}
                />
              </div>
            </div>

            {/* Overtime Warning */}
            {isOvertime && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800">Overtime Return Detected</p>
                  <p className="text-sm text-yellow-700">
                    Equipment returned after expected date. Additional charges will apply based on actual usage time.
                  </p>
                </div>
              </div>
            )}

            {/* Additional Charges */}
            <div>
              <Label htmlFor="additionalCharges">Additional Charges (Damage/Cleaning/etc.)</Label>
              <Input
                id="additionalCharges"
                type="number"
                min="0"
                step="0.01"
                value={additionalCharges}
                onChange={(e) => setAdditionalCharges(Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            {/* Damage Notes */}
            <div>
              <Label htmlFor="damageNotes">Return Condition Notes</Label>
              <Textarea
                id="damageNotes"
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                placeholder="Note any damage, cleaning requirements, or other observations..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Calculated Final Amount */}
        {calculatedAmounts && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Final Calculation Based on Actual Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Usage Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">Actual Usage Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700">Total Hours:</p>
                    <p className="font-semibold text-blue-900">{calculatedAmounts.actualHours}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Total Days:</p>
                    <p className="font-semibold text-blue-900">{calculatedAmounts.actualDays}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Return Status:</p>
                    <p className={`font-semibold ${isOvertime ? "text-red-600" : "text-green-600"}`}>
                      {isOvertime ? "Overtime" : "On Time"}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700">Additional Charges:</p>
                    <p className="font-semibold text-blue-900">{formatCurrency(additionalCharges)}</p>
                  </div>
                </div>
              </div>

              {/* Final Totals */}
              <div className="flex justify-end">
                <div className="w-80 border border-gray-300 rounded-lg">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                    <h4 className="font-bold">Final Invoice Summary</h4>
                  </div>
                  <div className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>New Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(calculatedAmounts.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({rental.taxRate}%):</span>
                      <span>{formatCurrency(calculatedAmounts.taxAmount)}</span>
                    </div>
                    {rental.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span>{formatCurrency(rental.deliveryFee)}</span>
                      </div>
                    )}
                    {rental.pickupFee > 0 && (
                      <div className="flex justify-between">
                        <span>Pickup Fee:</span>
                        <span>{formatCurrency(rental.pickupFee)}</span>
                      </div>
                    )}
                    {additionalCharges > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Additional Charges:</span>
                        <span>{formatCurrency(additionalCharges)}</span>
                      </div>
                    )}
                    {rental.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(rental.discountAmount)}</span>
                      </div>
                    )}
                    {rental.securityDeposit > 0 && (
                      <div className="flex justify-between">
                        <span>Security Deposit:</span>
                        <span>{formatCurrency(rental.securityDeposit)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg bg-blue-100 px-2 py-2 -mx-2 rounded">
                      <span>NEW TOTAL:</span>
                      <span>{formatCurrency(calculatedAmounts.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Already Paid:</span>
                      <span>{formatCurrency(rental.paidAmount)}</span>
                    </div>
                    <div
                      className={`flex justify-between font-bold ${calculatedAmounts.outstandingAmount >= 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      <span>{calculatedAmounts.outstandingAmount >= 0 ? "Amount Due:" : "Refund Due:"}</span>
                      <span>{formatCurrency(Math.abs(calculatedAmounts.outstandingAmount))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print Summary
          </Button>
          <Button
            onClick={processReturn}
            disabled={isProcessing || !calculatedAmounts}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {isProcessing ? "Processing..." : "Complete Return & Update Invoice"}
          </Button>
        </div>
      </div>
    </div>
  )
}
