"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, QrCode, Eye, RotateCcw, FileText, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchRentals } from "@/lib/api-client"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import Link from "next/link"

interface Rental {
  id: string
  rentalNumber: string
  customerName: string
  customerPhone: string
  totalAmount: number
  status: "active" | "returned" | "overdue"
  rentalDate: string
  expectedReturnDate: string
  actualReturnDate?: string
  qrCode: string
  items: Array<{
    equipmentName: string
    quantity: number
    rateType: string
    duration: number
  }>
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadRentals()
  }, [])

  useEffect(() => {
    // Filter rentals based on search term
    if (searchTerm.trim() === "") {
      setFilteredRentals(rentals)
    } else {
      const filtered = rentals.filter(
        (rental) =>
          rental.rentalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rental.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rental.customerPhone.includes(searchTerm) ||
          rental.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rental.items.some((item) => item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredRentals(filtered)
    }
  }, [searchTerm, rentals])

  const loadRentals = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchRentals()
      setRentals(data)
      setFilteredRentals(data)
    } catch (err) {
      console.error("Failed to load rentals:", err)
      setError("Failed to load rentals. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load rentals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReturnItem = async (rentalId: string) => {
    try {
      // TODO: Implement return functionality via API
      toast({
        title: "Feature Coming Soon",
        description: "Return processing will be available soon.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to process return. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusStats = () => {
    const active = rentals.filter((r) => r.status === "active").length
    const overdue = rentals.filter((r) => r.status === "overdue").length
    const returned = rentals.filter((r) => r.status === "returned").length
    return { active, overdue, returned, total: rentals.length }
  }

  const stats = getStatusStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading rentals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadRentals}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rental Management</h1>
          <p className="text-gray-600">Manage equipment rentals and returns</p>
        </div>
        <Link href="/dashboard/rentals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Rental
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rentals by number, customer, equipment, or QR code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rentals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Records</CardTitle>
          <CardDescription>
            Total: {stats.total} | Active: {stats.active} | Overdue: {stats.overdue} | Returned: {stats.returned}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRentals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                {searchTerm ? "No rentals found matching your search" : "No rentals found"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm ? "Try adjusting your search terms" : "Create your first rental to get started"}
              </p>
              {!searchTerm && (
                <Link href="/dashboard/rentals/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Rental
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rental #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>QR Code</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRentals.map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell className="font-medium">{rental.rentalNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rental.customerName}</div>
                          <div className="text-sm text-gray-500">{rental.customerPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{rental.items?.[0]?.equipmentName || "No equipment"}</div>
                          <div className="text-sm text-gray-500">
                            {rental.items?.length > 1
                              ? `+${rental.items.length - 1} more items`
                              : `Qty: ${rental.items?.[0]?.quantity || 0}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {rental.items?.[0]?.duration || 0}{" "}
                        {rental.items?.[0]?.rateType === "daily" ? "days" : rental.items?.[0]?.rateType || ""}
                      </TableCell>
                      <TableCell>{formatCurrency(rental.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(rental.status)}>{rental.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">Expected: {formatDate(rental.expectedReturnDate)}</div>
                          {rental.actualReturnDate && (
                            <div className="text-sm text-green-600">
                              Returned: {formatDate(rental.actualReturnDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{rental.qrCode}</code>
                          <Button variant="ghost" size="sm">
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/rentals/${rental.id}/invoice`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                          {rental.status === "active" && (
                            <Button variant="ghost" size="sm" onClick={() => handleReturnItem(rental.id)}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
