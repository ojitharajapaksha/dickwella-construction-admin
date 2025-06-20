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
  Edit,
  Trash2,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Eye,
  Download,
  Upload,
  Users,
  TrendingUp,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCustomers, addCustomer, searchCustomers } from "@/lib/data"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCustomerType, setSelectedCustomerType] = useState<"individual" | "company">("individual")
  const [customers, setCustomers] = useState(getCustomers())
  const { toast } = useToast()

  const filteredCustomers = searchTerm
    ? searchCustomers(searchTerm).filter((customer) => {
        const matchesType = customerTypeFilter === "all" || customer.customerType === customerTypeFilter
        const matchesStatus = statusFilter === "all" || customer.status === statusFilter
        return matchesType && matchesStatus
      })
    : customers.filter((customer) => {
        const matchesType = customerTypeFilter === "all" || customer.customerType === customerTypeFilter
        const matchesStatus = statusFilter === "all" || customer.status === statusFilter
        return matchesType && matchesStatus
      })

  const handleAddCustomer = (formData: FormData) => {
    try {
      const newCustomer = addCustomer({
        customerType: selectedCustomerType,
        name: formData.get("name") as string,
        companyName: selectedCustomerType === "company" ? (formData.get("companyName") as string) : undefined,
        contactPerson: selectedCustomerType === "company" ? (formData.get("contactPerson") as string) : undefined,
        primaryPhone: formData.get("primaryPhone") as string,
        secondaryPhone: (formData.get("secondaryPhone") as string) || undefined,
        email: (formData.get("email") as string) || undefined,
        idNumber: formData.get("idNumber") as string,
        businessRegNumber:
          selectedCustomerType === "company" ? (formData.get("businessRegNumber") as string) : undefined,
        addressLine1: formData.get("addressLine1") as string,
        addressLine2: (formData.get("addressLine2") as string) || undefined,
        city: formData.get("city") as string,
        district: formData.get("district") as string,
        postalCode: formData.get("postalCode") as string,
        creditLimit: Number.parseFloat(formData.get("creditLimit") as string) || 0,
        notes: (formData.get("notes") as string) || undefined,
      })

      setCustomers(getCustomers()) // Refresh the customers list
      setIsAddDialogOpen(false)

      toast({
        title: "Customer Added Successfully",
        description: `${newCustomer.name} has been added to the database`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      })
    }
  }

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.status === "active").length,
    companyCustomers: customers.filter((c) => c.customerType === "company").length,
    totalCreditLimit: customers.reduce((sum, c) => sum + c.creditLimit, 0),
    totalOutstanding: customers.reduce((sum, c) => sum + c.outstandingBalance, 0),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Customer Management
          </h1>
          <p className="text-gray-600 mt-1">Manage your customer database and relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/80 border-white/30">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/80 border-white/30">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Customer</DialogTitle>
                <DialogDescription>Add a new customer to your database</DialogDescription>
              </DialogHeader>
              <form action={handleAddCustomer} className="space-y-6">
                {/* Customer Type Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Customer Type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={selectedCustomerType === "individual" ? "default" : "outline"}
                      onClick={() => setSelectedCustomerType("individual")}
                      className="h-16 flex-col gap-2"
                    >
                      <User className="h-6 w-6" />
                      Individual
                    </Button>
                    <Button
                      type="button"
                      variant={selectedCustomerType === "company" ? "default" : "outline"}
                      onClick={() => setSelectedCustomerType("company")}
                      className="h-16 flex-col gap-2"
                    >
                      <Building className="h-6 w-6" />
                      Company
                    </Button>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {selectedCustomerType === "individual" ? "Full Name" : "Company Name"} *
                      </Label>
                      <Input id="name" name="name" required placeholder="Enter name" />
                    </div>
                    {selectedCustomerType === "company" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="contactPerson">Contact Person</Label>
                          <Input id="contactPerson" name="contactPerson" placeholder="Primary contact person" />
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="primaryPhone">Primary Phone *</Label>
                      <Input id="primaryPhone" name="primaryPhone" type="tel" required placeholder="+94771234567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                      <Input id="secondaryPhone" name="secondaryPhone" type="tel" placeholder="+94771234567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="email@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idNumber">
                        {selectedCustomerType === "individual" ? "NIC Number" : "Registration Number"} *
                      </Label>
                      <Input
                        id="idNumber"
                        name="idNumber"
                        required
                        placeholder={selectedCustomerType === "individual" ? "123456789V" : "PV00123456"}
                      />
                    </div>
                    {selectedCustomerType === "company" && (
                      <div className="space-y-2">
                        <Label htmlFor="businessRegNumber">Business Registration Number</Label>
                        <Input id="businessRegNumber" name="businessRegNumber" placeholder="BR123456" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Input id="addressLine1" name="addressLine1" required placeholder="Street address" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Input id="addressLine2" name="addressLine2" placeholder="Apartment, suite, etc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" name="city" required placeholder="City" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Input id="district" name="district" required placeholder="District" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input id="postalCode" name="postalCode" required placeholder="12345" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="creditLimit">Credit Limit (LKR)</Label>
                      <Input id="creditLimit" name="creditLimit" type="number" min="0" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Additional notes about the customer..." />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Add Customer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Customers</p>
                <p className="text-3xl font-bold">{stats.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold">{stats.activeCustomers}</p>
              </div>
              <User className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Companies</p>
                <p className="text-3xl font-bold">{stats.companyCustomers}</p>
              </div>
              <Building className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Credit Limit</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalCreditLimit)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Outstanding</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalOutstanding)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers by name, phone, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80"
              />
            </div>
            <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-white/80">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-white/80">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blacklisted">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Customer Database</CardTitle>
          <CardDescription>
            Showing {filteredCustomers.length} of {customers.length} customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Credit Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-blue-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            customer.customerType === "company"
                              ? "bg-gradient-to-r from-purple-500 to-pink-500"
                              : "bg-gradient-to-r from-blue-500 to-cyan-500"
                          }`}
                        >
                          {customer.customerType === "company" ? (
                            <Building className="h-5 w-5 text-white" />
                          ) : (
                            <User className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{customer.name}</div>
                          {customer.companyName && customer.companyName !== customer.name && (
                            <div className="text-sm text-gray-600">{customer.companyName}</div>
                          )}
                          {customer.contactPerson && (
                            <div className="text-sm text-gray-500">Contact: {customer.contactPerson}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={customer.customerType === "company" ? "default" : "secondary"}
                        className={
                          customer.customerType === "company"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {customer.customerType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {customer.primaryPhone}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {customer.email}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">ID: {customer.idNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div>
                            {customer.city}, {customer.district}
                          </div>
                          <div className="text-xs text-gray-500">{customer.postalCode}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-600">Limit:</span>{" "}
                          <span className="font-medium">{formatCurrency(customer.creditLimit)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Outstanding:</span>{" "}
                          <span
                            className={`font-medium ${
                              customer.outstandingBalance > 0 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {formatCurrency(customer.outstandingBalance)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{customer.totalRentals} rentals</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{formatDate(customer.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-red-100">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
