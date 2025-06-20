"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, QrCode, Eye, RotateCcw, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getRentals, getCustomers, getEquipment, updateRental, searchRentals } from "@/lib/data"
import Link from "next/link"

interface Rental {
  id: string
  rentalNumber: string
  customerName: string
  customerContact: string
  equipment: string
  quantity: number
  rateType: "hourly" | "daily"
  rate: number
  duration: number
  totalAmount: number
  status: "active" | "returned" | "overdue"
  rentalDate: string
  expectedReturnDate: string
  actualReturnDate?: string
  qrCode: string
}

export default function RentalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewRentalDialogOpen, setIsNewRentalDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [selectedEquipment, setSelectedEquipment] = useState("")
  const { toast } = useToast()

  // Mock data
  const [rentals, setRentals] = useState(getRentals())
  const customers = getCustomers()
  const equipment = getEquipment()

  const filteredRentals = searchTerm ? searchRentals(searchTerm) : rentals

  const generateRentalNumber = () => {
    return "R" + (rentals.length + 1).toString().padStart(3, "0")
  }

  const generateQRCode = () => {
    return "RNT" + Math.random().toString(36).substr(2, 6).toUpperCase()
  }

  const handleCreateRental = (formData: FormData) => {
    const customer = customers.find((c) => c.id === selectedCustomer)
    const equipmentItem = equipment.find((e) => e.id === selectedEquipment)
    const rateType = formData.get("rateType") as "hourly" | "daily"
    const duration = Number.parseInt(formData.get("duration") as string)
    const quantity = Number.parseInt(formData.get("quantity") as string)

    if (!customer || !equipmentItem) return

    const rate = rateType === "daily" ? equipmentItem.dailyRate : equipmentItem.hourlyRate || 0
    const totalAmount = rate * duration * quantity

    const newRental: Rental = {
      id: Date.now().toString(),
      rentalNumber: generateRentalNumber(),
      customerName: customer.name,
      customerContact: customer.contact,
      equipment: equipmentItem.name,
      quantity,
      rateType,
      rate,
      duration,
      totalAmount,
      status: "active",
      rentalDate: new Date().toISOString().split("T")[0],
      expectedReturnDate: formData.get("expectedReturnDate") as string,
      qrCode: generateQRCode(),
    }

    setRentals([...rentals, newRental])
    setIsNewRentalDialogOpen(false)
    setSelectedCustomer("")
    setSelectedEquipment("")

    toast({
      title: "Rental Created",
      description: `Rental ${newRental.rentalNumber} created successfully with QR code: ${newRental.qrCode}`,
    })
  }

  const handleReturnItem = (rentalId: string) => {
    const updatedRental = updateRental(rentalId, {
      status: "returned",
      actualReturnDate: new Date().toISOString().split("T")[0],
    })

    if (updatedRental) {
      setRentals(getRentals()) // Refresh the rentals list
      toast({
        title: "Item Returned",
        description: "Equipment has been successfully returned",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rental Management</h1>
          <p className="text-gray-600">Manage equipment rentals and returns</p>
        </div>
        <Dialog open={isNewRentalDialogOpen} onOpenChange={setIsNewRentalDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Rental
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Rental</DialogTitle>
              <DialogDescription>Create a new equipment rental agreement</DialogDescription>
            </DialogHeader>
            <form action={handleCreateRental} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.contact}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment</Label>
                  <Select value={selectedEquipment} onValueChange={setSelectedEquipment} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} - Rs. {item.dailyRate}/day
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateType">Rate Type</Label>
                  <Select name="rateType" defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" name="duration" type="number" min="1" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedReturnDate">Expected Return Date</Label>
                <Input id="expectedReturnDate" name="expectedReturnDate" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" name="notes" placeholder="Additional notes..." />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsNewRentalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Rental</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rentals by number, customer, or equipment..."
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
          <CardTitle>Active Rentals</CardTitle>
          <CardDescription>
            Total: {rentals.length} | Active: {rentals.filter((r) => r.status === "active").length} | Overdue:{" "}
            {rentals.filter((r) => r.status === "overdue").length}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      <div className="text-sm text-gray-500">{rental.customerContact}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{rental.equipment}</div>
                      <div className="text-sm text-gray-500">Qty: {rental.quantity}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {rental.duration} {rental.rateType === "daily" ? "days" : "hours"}
                  </TableCell>
                  <TableCell>Rs. {rental.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        rental.status === "active"
                          ? "default"
                          : rental.status === "overdue"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {rental.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">Expected: {rental.expectedReturnDate}</div>
                      {rental.actualReturnDate && (
                        <div className="text-sm text-green-600">Returned: {rental.actualReturnDate}</div>
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
        </CardContent>
      </Card>
    </div>
  )
}
