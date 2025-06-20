"use client"

import { useParams } from "next/navigation"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Printer, ArrowLeft, QrCode, Phone, Mail, MapPin } from "lucide-react"
import { getRentalById, getCustomerById, updateRental } from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"

export default function InvoicePage() {
  const params = useParams()
  const { toast } = useToast()
  const printRef = useRef<HTMLDivElement>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [deliveryOption, setDeliveryOption] = useState<string>("none")
  const [pickupOption, setPickupOption] = useState<string>("none")

  const rental = getRentalById(params.id as string)
  const customer = rental ? getCustomerById(rental.customerId) : null

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

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  const updateDeliveryPickup = () => {
    const updatedRental = {
      ...rental,
      deliveryRequired: deliveryOption === "required",
      pickupRequired: pickupOption === "required",
      deliveryFee: deliveryOption === "required" ? 2500 : 0,
      pickupFee: pickupOption === "required" ? 2500 : 0,
    }

    // Recalculate total
    const newTotalAmount =
      updatedRental.subtotal +
      updatedRental.taxAmount +
      updatedRental.deliveryFee +
      updatedRental.pickupFee -
      updatedRental.discountAmount +
      updatedRental.securityDeposit

    updatedRental.totalAmount = newTotalAmount
    updatedRental.outstandingAmount = newTotalAmount - updatedRental.paidAmount

    updateRental(rental.id, updatedRental)

    toast({
      title: "Invoice Updated",
      description: "Delivery and pickup options have been updated.",
    })
  }

  const companyInfo = {
    name: "Dickwella Construction",
    tagline: "The pioneers of building material suppliers and government contractors",
    address: "Tangalle Rd, Dickwella",
    phone: "+94777209227, +94707209227",
    email: "info@dickwellaconstruction.com",
    website: "www.dickwellaconstruction.com",
    regNo: "PV00123456789",
    vatNo: "134567890001",
  }

  // Calculate current totals with delivery/pickup options
  const currentDeliveryFee = deliveryOption === "required" ? 2500 : 0
  const currentPickupFee = pickupOption === "required" ? 2500 : 0
  const currentTotalAmount =
    rental.subtotal +
    rental.taxAmount +
    currentDeliveryFee +
    currentPickupFee -
    rental.discountAmount +
    rental.securityDeposit
  const currentOutstandingAmount = currentTotalAmount - rental.paidAmount

  return (
    <>
      {/* Professional A4 Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print-container, .print-container * {
            visibility: visible;
          }
          
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
          }
          
          .no-print {
            display: none !important;
          }
          
          .invoice-header {
            border-bottom: 3px solid #1e40af;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          
          .company-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
          }
          
          .invoice-details {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 8px;
          }
          
          .customer-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 15px 0;
          }
          
          .equipment-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            border: 2px solid #1e40af;
          }
          
          .equipment-table th {
            background: #1e40af;
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10px;
          }
          
          .equipment-table td {
            border: 1px solid #cbd5e1;
            padding: 8px;
            font-size: 10px;
          }
          
          .equipment-table tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          
          .totals-section {
            width: 300px;
            margin-left: auto;
            border: 2px solid #1e40af;
            margin-top: 15px;
          }
          
          .totals-header {
            background: #1e40af;
            color: white;
            padding: 8px 12px;
            font-weight: bold;
            text-align: center;
          }
          
          .totals-body {
            padding: 12px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 10px;
          }
          
          .total-final {
            border-top: 2px solid #1e40af;
            padding-top: 8px;
            margin-top: 8px;
            font-weight: bold;
            font-size: 12px;
          }
          
          .qr-section {
            border: 2px solid #1e40af;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
            background: #f8fafc;
          }
          
          .terms-section {
            border-top: 2px solid #e2e8f0;
            padding-top: 15px;
            margin-top: 20px;
            font-size: 9px;
            line-height: 1.3;
          }
          
          .footer-section {
            border-top: 3px solid #1e40af;
            padding-top: 15px;
            margin-top: 20px;
            text-align: center;
            background: #f8fafc;
            padding: 15px;
          }
        }
        
        @media screen {
          .print-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            min-height: 297mm;
            padding: 15mm;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100">
        {/* Header Actions - No Print */}
        <div className="no-print bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/rentals">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Rentals
                  </Button>
                </Link>
                <h1 className="text-xl font-semibold">Professional Invoice #{rental.rentalNumber}</h1>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handlePrint} disabled={isPrinting}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
                <Link href={`/scan-return/${rental.id}`}>
                  <Button size="sm">
                    <QrCode className="mr-2 h-4 w-4" />
                    Process Return
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery/Pickup Options - No Print */}
        <div className="no-print bg-white border-b p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Delivery Service:</label>
                <Select value={deliveryOption} onValueChange={setDeliveryOption}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not Required</SelectItem>
                    <SelectItem value="required">Required (+LKR 2,500)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Pickup Service:</label>
                <Select value={pickupOption} onValueChange={setPickupOption}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not Required</SelectItem>
                    <SelectItem value="required">Required (+LKR 2,500)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={updateDeliveryPickup} size="sm" className="bg-blue-600 hover:bg-blue-700">
                Update Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* Professional A4 Invoice */}
        <div className="py-6 px-4">
          <div ref={printRef} className="print-container">
            {/* Professional Header */}
            <div className="invoice-header">
              <div className="company-info">
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <Image src="/logo.png" alt="Company Logo" width={70} height={70} />
                  <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e40af", margin: "0" }}>
                      {companyInfo.name}
                    </h1>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0", fontStyle: "italic" }}>
                      {companyInfo.tagline}
                    </p>
                    <div style={{ fontSize: "10px", color: "#475569", marginTop: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                        <MapPin style={{ width: "12px", height: "12px" }} />
                        <span>{companyInfo.address}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                        <Phone style={{ width: "12px", height: "12px" }} />
                        <span>{companyInfo.phone}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Mail style={{ width: "12px", height: "12px" }} />
                        <span>{companyInfo.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="invoice-details">
                  <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1e40af", margin: "0 0 10px 0" }}>
                    RENTAL INVOICE
                  </h2>
                  <div style={{ fontSize: "11px", lineHeight: "1.5" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                      <strong>Invoice Number:</strong>
                      <span>{rental.rentalNumber}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                      <strong>Invoice Date:</strong>
                      <span>{formatDate(rental.rentalDate)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                      <strong>Due Date:</strong>
                      <span>{formatDate(rental.expectedReturnDate)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>Status:</strong>
                      <span
                        style={{
                          background:
                            rental.paymentStatus === "paid"
                              ? "#10b981"
                              : rental.paymentStatus === "partial"
                                ? "#f59e0b"
                                : "#ef4444",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "9px",
                          fontWeight: "bold",
                        }}
                      >
                        {rental.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Registration Details */}
              <div
                style={{
                  background: "#f1f5f9",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "9px",
                  color: "#475569",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  <strong>Reg No:</strong> {companyInfo.regNo}
                </span>
                <span>
                  <strong>VAT No:</strong> {companyInfo.vatNo}
                </span>
                <span>
                  <strong>Website:</strong> {companyInfo.website}
                </span>
              </div>
            </div>

            {/* Customer & Rental Information */}
            <div className="customer-section">
              <div style={{ border: "1px solid #e2e8f0", padding: "15px", borderRadius: "6px", background: "#fafafa" }}>
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#1e40af",
                    margin: "0 0 10px 0",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "5px",
                  }}
                >
                  BILL TO:
                </h3>
                <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
                  <p style={{ fontWeight: "bold", fontSize: "13px", margin: "0 0 5px 0", color: "#1e293b" }}>
                    {customer.name}
                  </p>
                  {customer.companyName && (
                    <p style={{ fontWeight: "600", margin: "0 0 3px 0", color: "#475569" }}>{customer.companyName}</p>
                  )}
                  {customer.contactPerson && (
                    <p style={{ margin: "0 0 8px 0", color: "#64748b" }}>Contact: {customer.contactPerson}</p>
                  )}
                  <div style={{ marginBottom: "8px" }}>
                    <p style={{ margin: "0", color: "#475569" }}>{customer.addressLine1}</p>
                    {customer.addressLine2 && <p style={{ margin: "0", color: "#475569" }}>{customer.addressLine2}</p>}
                    <p style={{ margin: "0", color: "#475569" }}>
                      {customer.city}, {customer.district} {customer.postalCode}
                    </p>
                  </div>
                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
                    <p style={{ margin: "0 0 2px 0", color: "#475569" }}>
                      <strong>Phone:</strong> {customer.primaryPhone}
                    </p>
                    {customer.email && (
                      <p style={{ margin: "0 0 2px 0", color: "#475569" }}>
                        <strong>Email:</strong> {customer.email}
                      </p>
                    )}
                    <p style={{ margin: "0", color: "#64748b", fontSize: "10px" }}>
                      <strong>ID:</strong> {customer.idNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ border: "1px solid #e2e8f0", padding: "15px", borderRadius: "6px", background: "#fafafa" }}>
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#1e40af",
                    margin: "0 0 10px 0",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "5px",
                  }}
                >
                  RENTAL DETAILS:
                </h3>
                <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                    <div>
                      <p style={{ margin: "0", color: "#64748b", fontSize: "10px" }}>Start Date:</p>
                      <p style={{ margin: "0", fontWeight: "bold", color: "#1e293b" }}>
                        {formatDate(rental.startDate)}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: "0", color: "#64748b", fontSize: "10px" }}>Expected Return:</p>
                      <p style={{ margin: "0", fontWeight: "bold", color: "#1e293b" }}>
                        {formatDate(rental.expectedReturnDate)}
                      </p>
                    </div>
                  </div>

                  {rental.actualReturnDate && (
                    <div style={{ marginBottom: "10px" }}>
                      <p style={{ margin: "0", color: "#64748b", fontSize: "10px" }}>Actual Return:</p>
                      <p style={{ margin: "0", fontWeight: "bold", color: "#10b981" }}>
                        {formatDate(rental.actualReturnDate)}
                      </p>
                    </div>
                  )}

                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
                    <p style={{ margin: "0 0 5px 0", fontSize: "10px", color: "#64748b" }}>Rental Status:</p>
                    <span
                      style={{
                        background: rental.status === "active" ? "#10b981" : "#64748b",
                        color: "white",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "9px",
                        fontWeight: "bold",
                      }}
                    >
                      {rental.status.toUpperCase()}
                    </span>
                  </div>

                  {(deliveryOption === "required" || pickupOption === "required") && (
                    <div style={{ marginTop: "10px", borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
                      <p style={{ margin: "0 0 5px 0", fontSize: "10px", color: "#64748b" }}>Additional Services:</p>
                      {deliveryOption === "required" && (
                        <p style={{ margin: "0", color: "#10b981", fontSize: "10px" }}>✓ Delivery Service Included</p>
                      )}
                      {pickupOption === "required" && (
                        <p style={{ margin: "0", color: "#10b981", fontSize: "10px" }}>✓ Pickup Service Included</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Equipment Table */}
            <table className="equipment-table">
              <thead>
                <tr>
                  <th style={{ width: "35%" }}>EQUIPMENT DESCRIPTION</th>
                  <th style={{ width: "8%", textAlign: "center" }}>QTY</th>
                  <th style={{ width: "12%", textAlign: "center" }}>RATE TYPE</th>
                  <th style={{ width: "12%", textAlign: "center" }}>DURATION</th>
                  <th style={{ width: "16%", textAlign: "right" }}>UNIT RATE</th>
                  <th style={{ width: "17%", textAlign: "right" }}>TOTAL AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {rental.items.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: "600", marginBottom: "2px" }}>{item.equipmentName}</div>
                      <div style={{ fontSize: "9px", color: "#64748b" }}>Equipment ID: {item.equipmentId}</div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "600" }}>{item.quantity}</td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          background: "#dbeafe",
                          color: "#1e40af",
                          padding: "2px 6px",
                          borderRadius: "3px",
                          fontSize: "9px",
                          fontWeight: "600",
                        }}
                      >
                        {item.rateType.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "600" }}>{item.duration}</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>{formatCurrency(item.rate)}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold", color: "#1e293b" }}>
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Section */}
            <div className="totals-section">
              <div className="totals-header">INVOICE SUMMARY</div>
              <div className="totals-body">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: "600" }}>{formatCurrency(rental.subtotal)}</span>
                </div>

                {currentDeliveryFee > 0 && (
                  <div className="total-row">
                    <span>Delivery Service:</span>
                    <span style={{ fontWeight: "600" }}>{formatCurrency(currentDeliveryFee)}</span>
                  </div>
                )}

                {currentPickupFee > 0 && (
                  <div className="total-row">
                    <span>Pickup Service:</span>
                    <span style={{ fontWeight: "600" }}>{formatCurrency(currentPickupFee)}</span>
                  </div>
                )}

                <div className="total-row">
                  <span>Tax ({rental.taxRate}%):</span>
                  <span style={{ fontWeight: "600" }}>{formatCurrency(rental.taxAmount)}</span>
                </div>

                {rental.discountAmount > 0 && (
                  <div className="total-row" style={{ color: "#10b981" }}>
                    <span>Discount Applied:</span>
                    <span style={{ fontWeight: "600" }}>-{formatCurrency(rental.discountAmount)}</span>
                  </div>
                )}

                {rental.securityDeposit > 0 && (
                  <div className="total-row">
                    <span>Security Deposit:</span>
                    <span style={{ fontWeight: "600" }}>{formatCurrency(rental.securityDeposit)}</span>
                  </div>
                )}

                <div className="total-final" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>TOTAL AMOUNT:</span>
                  <span>{formatCurrency(currentTotalAmount)}</span>
                </div>

                <div className="total-row" style={{ color: "#10b981", marginTop: "8px" }}>
                  <span>Amount Paid:</span>
                  <span style={{ fontWeight: "bold" }}>{formatCurrency(rental.paidAmount)}</span>
                </div>

                <div
                  className="total-row"
                  style={{
                    color: "#ef4444",
                    fontWeight: "bold",
                    background: "#fef2f2",
                    padding: "5px",
                    borderRadius: "4px",
                    border: "1px solid #fecaca",
                  }}
                >
                  <span>OUTSTANDING BALANCE:</span>
                  <span style={{ fontSize: "12px" }}>{formatCurrency(currentOutstandingAmount)}</span>
                </div>
              </div>
            </div>

            <div style={{ clear: "both" }}></div>

            {/* QR Code Section */}
            <div className="qr-section">
              <h3 style={{ fontSize: "12px", fontWeight: "bold", margin: "0 0 10px 0", color: "#1e40af" }}>
                EQUIPMENT RETURN PROCESSING
              </h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" }}>
                <div
                  style={{
                    border: "2px solid #1e40af",
                    padding: "10px",
                    background: "white",
                    borderRadius: "6px",
                  }}
                >
                  <QrCode style={{ width: "60px", height: "60px", color: "#1e40af" }} />
                  <p style={{ fontSize: "8px", margin: "5px 0 0 0", fontFamily: "monospace", textAlign: "center" }}>
                    {rental.qrCode}
                  </p>
                </div>
                <div style={{ textAlign: "left", fontSize: "10px", lineHeight: "1.4" }}>
                  <p style={{ margin: "0 0 5px 0", fontWeight: "bold", color: "#1e40af" }}>
                    IMPORTANT RETURN INSTRUCTIONS:
                  </p>
                  <p style={{ margin: "0 0 3px 0" }}>• Present this invoice when returning equipment</p>
                  <p style={{ margin: "0 0 3px 0" }}>• Our staff will scan the QR code for processing</p>
                  <p style={{ margin: "0 0 3px 0" }}>• Final charges calculated based on actual usage time</p>
                  <p style={{ margin: "0 0 3px 0" }}>• Additional fees may apply for damages or overtime</p>
                  <p style={{ margin: "0", fontWeight: "bold", color: "#1e293b" }}>Rental Reference: {rental.id}</p>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="terms-section">
              <h3 style={{ fontSize: "11px", fontWeight: "bold", margin: "0 0 8px 0", color: "#1e40af" }}>
                TERMS AND CONDITIONS:
              </h3>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "10px",
                  borderRadius: "4px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <p style={{ margin: "0 0 4px 0" }}>
                    • Equipment must be returned in the same condition as received, allowing for normal wear and tear.
                  </p>
                  <p style={{ margin: "0 0 4px 0" }}>
                    • Late returns will incur additional charges at the prevailing daily rental rate.
                  </p>
                  <p style={{ margin: "0 0 4px 0" }}>
                    • Customer is fully responsible for any damage, loss, or theft of equipment during the rental
                    period.
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0" }}>
                    • Security deposit will be refunded upon satisfactory return of equipment within 7 business days.
                  </p>
                  <p style={{ margin: "0 0 4px 0" }}>
                    • Payment is due within 30 days of invoice date. Late payment charges of 2% per month may apply.
                  </p>
                  <p style={{ margin: "0" }}>
                    • All disputes are subject to the jurisdiction of courts in Matara District, Sri Lanka.
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Footer */}
            <div className="footer-section">
              <h3 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 8px 0", color: "#1e40af" }}>
                Thank you for choosing {companyInfo.name}
              </h3>
              <p style={{ fontSize: "11px", margin: "0 0 10px 0", color: "#475569" }}>
                Your trusted partner in construction equipment and building materials
              </p>
              <div
                style={{
                  borderTop: "1px solid #cbd5e1",
                  paddingTop: "10px",
                  fontSize: "10px",
                  color: "#64748b",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "10px",
                  textAlign: "center",
                }}
              >
                <div>
                  <strong>24/7 Support Hotline</strong>
                  <br />
                  {companyInfo.phone}
                </div>
                <div>
                  <strong>Email Support</strong>
                  <br />
                  {companyInfo.email}
                </div>
                <div>
                  <strong>Visit Our Website</strong>
                  <br />
                  {companyInfo.website}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
