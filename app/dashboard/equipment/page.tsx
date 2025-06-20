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
import {
  Plus,
  Search,
  QrCode,
  Edit,
  Trash2,
  Download,
  Upload,
  Package,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Eye,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getEquipment, addEquipment, generateQRCode, searchEquipment, type Equipment } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"

const categories = [
  "Heavy Machinery",
  "Power Tools",
  "Construction Materials",
  "Safety Equipment",
  "Concrete Equipment",
  "Lifting Equipment",
  "Scaffolding",
  "Electrical Equipment",
]

const conditions = [
  { value: "excellent", label: "Excellent", color: "text-green-600" },
  { value: "good", label: "Good", color: "text-blue-600" },
  { value: "fair", label: "Fair", color: "text-yellow-600" },
  { value: "needs_repair", label: "Needs Repair", color: "text-red-600" },
]

export default function EquipmentPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<"material" | "machine">("material")
  const [equipment, setEquipment] = useState(getEquipment())
  const { toast } = useToast()

  const filteredEquipment = searchTerm
    ? searchEquipment(searchTerm).filter((item) => {
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
        const matchesStatus = statusFilter === "all" || item.status === statusFilter
        return matchesCategory && matchesStatus
      })
    : equipment.filter((item) => {
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
        const matchesStatus = statusFilter === "all" || item.status === statusFilter
        return matchesCategory && matchesStatus
      })

  const handleAddEquipment = (formData: FormData) => {
    try {
      const newEquipment = addEquipment({
        name: formData.get("name") as string,
        type: selectedType,
        category: formData.get("category") as string,
        brand: (formData.get("brand") as string) || undefined,
        condition: (formData.get("condition") as any) || "excellent",
        totalQuantity: Number.parseInt(formData.get("totalQuantity") as string),
        availableQuantity: Number.parseInt(formData.get("totalQuantity") as string),
        reservedQuantity: 0,
        maintenanceQuantity: 0,

        // Material specific
        length: formData.get("length") ? Number.parseFloat(formData.get("length") as string) : undefined,
        height: formData.get("height") ? Number.parseFloat(formData.get("height") as string) : undefined,
        width: formData.get("width") ? Number.parseFloat(formData.get("width") as string) : undefined,
        weight: formData.get("weight") ? Number.parseFloat(formData.get("weight") as string) : undefined,
        unit: (formData.get("unit") as string) || undefined,

        // Machine specific
        model: (formData.get("model") as string) || undefined,
        modelNumber: (formData.get("modelNumber") as string) || undefined,
        serialNumber: (formData.get("serialNumber") as string) || undefined,
        yearManufactured: formData.get("yearManufactured")
          ? Number.parseInt(formData.get("yearManufactured") as string)
          : undefined,
        wattage: formData.get("wattage") ? Number.parseInt(formData.get("wattage") as string) : undefined,
        fuelType: (formData.get("fuelType") as string) || undefined,

        // Pricing
        hourlyRate: formData.get("hourlyRate") ? Number.parseFloat(formData.get("hourlyRate") as string) : undefined,
        dailyRate: Number.parseFloat(formData.get("dailyRate") as string),
        weeklyRate: formData.get("weeklyRate") ? Number.parseFloat(formData.get("weeklyRate") as string) : undefined,
        monthlyRate: formData.get("monthlyRate") ? Number.parseFloat(formData.get("monthlyRate") as string) : undefined,
        securityDeposit: Number.parseFloat(formData.get("securityDeposit") as string) || 0,

        status: "available",
        qrCode: generateQRCode("EQP"),
        barcode: generateQRCode("BAR"),
        location: (formData.get("location") as string) || "Main Yard",
        notes: (formData.get("notes") as string) || undefined,
      })

      setEquipment(getEquipment()) // Refresh the equipment list
      setIsAddDialogOpen(false)

      toast({
        title: "Equipment Added Successfully",
        description: `${newEquipment.name} has been added with QR code: ${newEquipment.qrCode}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add equipment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getAvailabilityStatus = (item: Equipment) => {
    const percentage = (item.availableQuantity / item.totalQuantity) * 100
    if (percentage === 0) return { status: "Out of Stock", color: "text-red-600" }
    if (percentage <= 25) return { status: "Low Stock", color: "text-orange-600" }
    if (percentage <= 50) return { status: "Medium Stock", color: "text-yellow-600" }
    return { status: "In Stock", color: "text-green-600" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600">Manage your construction equipment inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
                <DialogDescription>Add new equipment to your inventory</DialogDescription>
              </DialogHeader>
              <form action={handleAddEquipment} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Equipment Name *</Label>
                      <Input id="name" name="name" required placeholder="e.g., Excavator CAT 320D" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={selectedType}
                        onValueChange={(value: "material" | "machine") => setSelectedType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="material">Material</SelectItem>
                          <SelectItem value="machine">Machine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input id="brand" name="brand" placeholder="e.g., Caterpillar, Honda" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select name="condition" defaultValue="excellent">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conditions.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value}>
                              {condition.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalQuantity">Total Quantity *</Label>
                      <Input id="totalQuantity" name="totalQuantity" type="number" min="1" required />
                    </div>
                  </div>
                </div>

                {/* Machine Specific Fields */}
                {selectedType === "machine" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Machine Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <Input id="model" name="model" placeholder="e.g., CAT 320D" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="modelNumber">Model Number</Label>
                        <Input id="modelNumber" name="modelNumber" placeholder="e.g., CAT320D2023" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serialNumber">Serial Number</Label>
                        <Input id="serialNumber" name="serialNumber" placeholder="e.g., CAT320D001" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yearManufactured">Year Manufactured</Label>
                        <Input id="yearManufactured" name="yearManufactured" type="number" min="1990" max="2030" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wattage">Wattage (W)</Label>
                        <Input id="wattage" name="wattage" type="number" min="0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fuelType">Fuel Type</Label>
                        <Select name="fuelType">
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="petrol">Petrol</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Material Specific Fields */}
                {selectedType === "material" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Material Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="length">Length</Label>
                        <Input id="length" name="length" type="number" step="0.01" min="0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height</Label>
                        <Input id="height" name="height" type="number" step="0.01" min="0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="width">Width</Label>
                        <Input id="width" name="width" type="number" step="0.01" min="0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input id="weight" name="weight" type="number" step="0.01" min="0" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit of Measurement</Label>
                      <Input id="unit" name="unit" placeholder="e.g., meters, pieces, kg, tons" />
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate (LKR)</Label>
                      <Input id="hourlyRate" name="hourlyRate" type="number" step="0.01" min="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dailyRate">Daily Rate (LKR) *</Label>
                      <Input id="dailyRate" name="dailyRate" type="number" step="0.01" min="0" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weeklyRate">Weekly Rate (LKR)</Label>
                      <Input id="weeklyRate" name="weeklyRate" type="number" step="0.01" min="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyRate">Monthly Rate (LKR)</Label>
                      <Input id="monthlyRate" name="monthlyRate" type="number" step="0.01" min="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="securityDeposit">Security Deposit (LKR)</Label>
                      <Input
                        id="securityDeposit"
                        name="securityDeposit"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="e.g., Main Yard, Warehouse A"
                        defaultValue="Main Yard"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Additional notes about the equipment..." />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Equipment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold">{equipment.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {equipment.filter((e) => e.status === "available").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Use</p>
                <p className="text-2xl font-bold text-blue-600">
                  {equipment.reduce((sum, e) => sum + (e.totalQuantity - e.availableQuantity), 0)}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-orange-600">
                  {equipment.filter((e) => e.status === "maintenance").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search equipment by name, brand, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Inventory</CardTitle>
          <CardDescription>
            Showing {filteredEquipment.length} of {equipment.length} equipment items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item) => {
                  const availability = getAvailabilityStatus(item)
                  return (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.brand && `${item.brand} • `}
                            {item.model || item.unit}
                          </div>
                          <div className="text-xs text-gray-400">{item.location}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.type === "machine" ? "default" : "secondary"}>{item.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.category}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">
                            {item.availableQuantity}/{item.totalQuantity}
                          </div>
                          <div className={`text-xs ${availability.color}`}>{availability.status}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={conditions.find((c) => c.value === item.condition)?.color}>
                          {conditions.find((c) => c.value === item.condition)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.dailyRate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{item.qrCode}</code>
                          <Button variant="ghost" size="sm">
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
