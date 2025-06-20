"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Plus, Minus, Search, User, Package, Calculator, FileText, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  fetchCustomers,
  fetchEquipment,
  createRental,
  generateNextRentalNumber,
  generateQRCode,
} from "@/lib/api-client"
import { formatCurrency } from "@/lib/utils"

interface Customer {
  id: string
  name: string
  primaryPhone: string
  email: string
  customerType: string
  status: string
  creditLimit: number
  outstandingBalance: number
}

interface Equipment {
  id: string
  name: string
  brand: string
  category: string
  dailyRate: number
  hourlyRate?: number
  weeklyRate?: number
  monthlyRate?: number
  availableQuantity: number
  securityDeposit?: number
}

interface RentalItem {
  id: string
  equipmentId: string
  equipmentName: string
  quantity: number
  rateType: "hourly" | "daily" | "weekly" | "monthly"
  rate: number
  duration: number
  subtotal: number
}

export default function NewRentalPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Data states
  const [customers, setCustomers] = useState<Customer[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])

  // Form data
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([])
  const [startDate, setStartDate] = useState("")
  const [expectedReturnDate, setExpectedReturnDate] = useState("")
  const [deliveryRequired, setDeliveryRequired] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [pickupRequired, setPickupRequired] = useState(false)
  const [notes, setNotes] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)

  // Dialog states
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState("")
  const [equipmentSearch, setEquipmentSearch] = useState("")

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [customersData, equipmentData] = await Promise.all([fetchCustomers(), fetchEquipment()])
      setCustomers(customersData)
      setEquipment(equipmentData)
    } catch (error) {
      console.error("Failed to load initial data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive",
      })
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.primaryPhone.includes(customerSearch) ||
      customer.email.toLowerCase().includes(customerSearch.toLowerCase()),
  )

  const filteredEquipment = equipment.filter(
    (item) =>
      item.availableQuantity > 0 &&
      (item.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(equipmentSearch.toLowerCase())),
  )

  const addEquipmentToRental = (equipmentItem: Equipment) => {
    const existingItem = rentalItems.find((item) => item.equipmentId === equipmentItem.id)
    if (existingItem) {
      toast({
        title: "Equipment Already Added",
        description: "This equipment is already in the rental. You can modify the quantity.",
        variant: "destructive",
      })
      return
    }

    const newItem: RentalItem = {
      id: Date.now().toString(),
      equipmentId: equipmentItem.id,
      equipmentName: equipmentItem.name,
      quantity: 1,
      rateType: "daily",
      rate: equipmentItem.dailyRate,
      duration: 1,
      subtotal: equipmentItem.dailyRate,
    }

    setRentalItems([...rentalItems, newItem])
    setIsEquipmentDialogOpen(false)
    toast({
      title: "Equipment Added",
      description: `${equipmentItem.name} has been added to the rental`,
    })
  }

  const updateRentalItem = (id: string, updates: Partial<RentalItem>) => {
    setRentalItems(
      rentalItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates }
          updatedItem.subtotal = updatedItem.rate * updatedItem.quantity * updatedItem.duration
          return updatedItem
        }
        return item
      }),
    )
  }

  const removeRentalItem = (id: string) => {
    setRentalItems(rentalItems.filter((item) => item.id !== id))
  }

  const calculateTotals = () => {
    const subtotal = rentalItems.reduce((sum, item) => sum + item.subtotal, 0)
    const deliveryFee = deliveryRequired ? 5000 : 0
    const pickupFee = pickupRequired ? 5000 : 0
    const taxRate = 8
    const taxAmount = (subtotal * taxRate) / 100
    const totalAmount = subtotal + taxAmount + deliveryFee + pickupFee - discountAmount

    return {
      subtotal,
      deliveryFee,
      pickupFee,
      taxRate,
      taxAmount,
      discountAmount,
      totalAmount,
    }
  }

  const handleCreateRental = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Customer Required",
        description: "Please select a customer for this rental",
        variant: "destructive",
      })
      return
    }

    if (rentalItems.length === 0) {
      toast({
        title: "Equipment Required",
        description: "Please add at least one equipment item to the rental",
        variant: "destructive",
      })
      return
    }

    if (!startDate || !expectedReturnDate) {
      toast({
        title: "Dates Required",
        description: "Please specify start and expected return dates",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const totals = calculateTotals()
      const securityDeposit = rentalItems.reduce((sum, item) => {
        const equipmentItem = equipment.find((e) => e.id === item.equipmentId)
        return sum + (equipmentItem?.securityDeposit || 0) * item.quantity
      }, 0)

      const rentalNumber = await generateNextRentalNumber()

      const newRental = await createRental({
        rentalNumber,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.primaryPhone,
        rentalDate: new Date().toISOString(),
        startDate,
        expectedReturnDate,
        items: rentalItems,
        subtotal: totals.subtotal,
        taxRate: totals.taxRate,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        securityDeposit,
        totalAmount: totals.totalAmount,
        paidAmount: 0,
        outstandingAmount: totals.totalAmount,
        deliveryRequired,
        deliveryAddress: deliveryRequired ? deliveryAddress : undefined,
        deliveryFee: totals.deliveryFee,
        pickupRequired,
        pickupFee: totals.pickupFee,
        notes,
        qrCode: generateQRCode("RNT"),
      })

      toast({
        title: "Rental Created Successfully",
        description: `Rental ${rentalNumber} has been created`,
      })

      router.push(`/dashboard/rentals/${newRental.id}/invoice`)
    } catch (error) {
      console.error("Failed to create rental:", error)
      toast({
        title: "Error",
        description: "Failed to create rental. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Rental</h1>
          <p className="text-gray-600">Complete rental process with customer and equipment selection</p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {stepNumber}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Customer Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Step 1: Select Customer
            </CardTitle>
            <CardDescription>Choose the customer for this rental</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCustomer ? (
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedCustomer.name}</h3>
                    <p className="text-sm text-gray-600">{selectedCustomer.primaryPhone}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                    <p className="text-xs text-gray-500">
                      Credit Limit: {formatCurrency(selectedCustomer.creditLimit)} | Outstanding:{" "}
                      {formatCurrency(selectedCustomer.outstandingBalance)}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full h-20 border-dashed">
                    <div className="text-center">
                      <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Select Customer</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Select Customer</DialogTitle>
                    <DialogDescription>Choose a customer for this rental</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, phone, or email..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setIsCustomerDialogOpen(false)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{customer.name}</h3>
                              <p className="text-sm text-gray-600">{customer.primaryPhone}</p>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={customer.customerType === "company" ? "default" : "secondary"}>
                                  {customer.customerType}
                                </Badge>
                                <Badge variant={customer.status === "active" ? "default" : "destructive"}>
                                  {customer.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>Credit: {formatCurrency(customer.creditLimit)}</p>
                              <p>Outstanding: {formatCurrency(customer.outstandingBalance)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedCustomer}>
                Next: Add Equipment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Equipment Selection */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Step 2: Add Equipment
              </CardTitle>
              <CardDescription>Select equipment items for this rental</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Equipment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Select Equipment</DialogTitle>
                    <DialogDescription>Choose equipment to add to this rental</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search equipment..."
                        value={equipmentSearch}
                        onChange={(e) => setEquipmentSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Equipment</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead>Daily Rate</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEquipment.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-gray-500">{item.brand}</p>
                                </div>
                              </TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.availableQuantity}</Badge>
                              </TableCell>
                              <TableCell>{formatCurrency(item.dailyRate)}</TableCell>
                              <TableCell>
                                <Button size="sm" onClick={() => addEquipmentToRental(item)}>
                                  Add
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {rentalItems.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Rate Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rentalItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.equipmentName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateRentalItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateRentalItem(item.id, { quantity: item.quantity + 1 })}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.rateType}
                              onValueChange={(value: any) => {
                                const equipmentItem = equipment.find((e) => e.id === item.equipmentId)
                                const rate =
                                  value === "hourly"
                                    ? equipmentItem?.hourlyRate || equipmentItem?.dailyRate || 0
                                    : value === "weekly"
                                      ? equipmentItem?.weeklyRate ?? (equipmentItem?.dailyRate !== undefined ? equipmentItem.dailyRate * 7 : 0)
                                      : value === "monthly"
                                        ? equipmentItem?.monthlyRate ?? (equipmentItem?.dailyRate !== undefined ? equipmentItem.dailyRate * 30 : 0)
                                        : equipmentItem?.dailyRate || 0
                                updateRentalItem(item.id, { rateType: value, rate })
                              }}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.duration}
                              onChange={(e) =>
                                updateRentalItem(item.id, { duration: Number.parseInt(e.target.value) || 1 })
                              }
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>{formatCurrency(item.rate)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(item.subtotal)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => removeRentalItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Previous
            </Button>
            <Button onClick={() => setStep(3)} disabled={rentalItems.length === 0}>
              Next: Review & Confirm
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review and Confirm */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Step 3: Review & Confirm
              </CardTitle>
              <CardDescription>Review rental details and complete the transaction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rental Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedReturnDate">Expected Return Date *</Label>
                    <Input
                      id="expectedReturnDate"
                      type="date"
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="delivery"
                      checked={deliveryRequired}
                      onCheckedChange={(checked) => setDeliveryRequired(checked as boolean)}
                    />
                    <Label htmlFor="delivery">Delivery Required (+{formatCurrency(5000)})</Label>
                  </div>
                  {deliveryRequired && (
                    <div>
                      <Label htmlFor="deliveryAddress">Delivery Address</Label>
                      <Textarea
                        id="deliveryAddress"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter delivery address..."
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pickup"
                      checked={pickupRequired}
                      onCheckedChange={(checked) => setPickupRequired(checked as boolean)}
                    />
                    <Label htmlFor="pickup">Pickup Required (+{formatCurrency(5000)})</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or special instructions..."
                />
              </div>

              <div>
                <Label htmlFor="discount">Discount Amount</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Rental Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <p className="text-sm">{selectedCustomer?.name}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer?.primaryPhone}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer?.email}</p>
                </div>

                {/* Equipment Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Equipment Items ({rentalItems.length})</h3>
                  {rentalItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span>
                        {item.equipmentName} (x{item.quantity}) - {item.duration} {item.rateType}
                      </span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-2">Financial Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    {deliveryRequired && (
                      <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span>{formatCurrency(totals.deliveryFee)}</span>
                      </div>
                    )}
                    {pickupRequired && (
                      <div className="flex justify-between">
                        <span>Pickup Fee:</span>
                        <span>{formatCurrency(totals.pickupFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax ({totals.taxRate}%):</span>
                      <span>{formatCurrency(totals.taxAmount)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(totals.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Previous
            </Button>
            <Button onClick={handleCreateRental} className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Rental & Generate Invoice
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
