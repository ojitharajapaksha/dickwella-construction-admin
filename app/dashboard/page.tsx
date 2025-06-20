"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Package,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Activity,
  Eye,
  ArrowUpRight,
  Sparkles,
  Zap,
  BarChart3,
  Clock,
  Target,
  Wrench,
} from "lucide-react"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { getRentals, getEquipment, getCustomers } from "@/lib/data"
import Link from "next/link"

export default function DashboardPage() {
  const rentals = getRentals()
  const equipment = getEquipment()
  const customers = getCustomers()

  // Calculate statistics
  const stats = {
    totalEquipment: equipment.length,
    availableEquipment: equipment.filter((e) => e.status === "available").length,
    activeRentals: rentals.filter((r) => r.status === "active").length,
    totalCustomers: customers.length,
    monthlyRevenue: rentals.reduce((sum, r) => sum + r.totalAmount, 0),
    overdueRentals: rentals.filter((r) => r.status === "overdue").length,
    totalValue: equipment.reduce((sum, e) => sum + e.dailyRate * e.totalQuantity, 0),
    utilizationRate:
      Math.round(
        (equipment.reduce((sum, e) => sum + (e.totalQuantity - e.availableQuantity), 0) /
          equipment.reduce((sum, e) => sum + e.totalQuantity, 0)) *
          100,
      ) || 0,
  }

  const recentRentals = rentals.slice(0, 5).map((rental) => ({
    ...rental,
    customer: customers.find((c) => c.id === rental.customerId),
  }))

  const lowStockEquipment = equipment.filter((e) => e.availableQuantity <= 2 && e.totalQuantity > 2)

  const quickActions = [
    {
      title: "New Rental",
      description: "Create a new equipment rental",
      icon: FileText,
      href: "/dashboard/rentals/new",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Add Equipment",
      description: "Add new equipment to inventory",
      icon: Package,
      href: "/dashboard/equipment",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Add Customer",
      description: "Register a new customer",
      icon: Users,
      href: "/dashboard/customers",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "View Reports",
      description: "Access detailed analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Welcome Header with improved visual hierarchy */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 text-yellow-300" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">Good Morning!</h1>
                  <p className="text-blue-100 text-lg">Welcome back to your dashboard</p>
                </div>
              </div>
              <p className="text-blue-200 text-sm flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4" />
                {formatDate(new Date())} • System Status: All systems operational
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-100">Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-200" />
                  <span className="text-blue-100">Performance: Excellent</span>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{stats.utilizationRate}%</div>
                  <div className="text-sm text-blue-200 mb-3">Equipment Utilization</div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000 shadow-lg"
                      style={{ width: `${stats.utilizationRate}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-blue-200 mt-2">
                    {stats.utilizationRate >= 80
                      ? "Excellent"
                      : stats.utilizationRate >= 60
                        ? "Good"
                        : "Needs Attention"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics Grid with tooltips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Equipment</CardTitle>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-white mb-2">{stats.totalEquipment}</div>
                  <div className="flex items-center text-sm text-blue-100">
                    <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                    {stats.availableEquipment} available now
                  </div>
                  <div className="mt-2 text-xs text-blue-200">
                    {Math.round((stats.availableEquipment / stats.totalEquipment) * 100)}% availability rate
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total equipment in your inventory. Click to view equipment management.</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium text-green-100">Active Rentals</CardTitle>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-white mb-2">{stats.activeRentals}</div>
                  <div className="flex items-center text-sm text-green-100">
                    {stats.overdueRentals > 0 ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-300 mr-2" />
                        <span className="text-red-200">{stats.overdueRentals} overdue</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                        <span className="text-green-200">All on schedule</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-green-200">
                    {stats.overdueRentals === 0 ? "Perfect compliance" : "Attention needed"}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Currently active rental agreements.{" "}
                {stats.overdueRentals > 0 ? "Some rentals are overdue." : "All rentals are on track."}
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium text-purple-100">Total Customers</CardTitle>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-white mb-2">{stats.totalCustomers}</div>
                  <div className="flex items-center text-sm text-purple-100">
                    <ArrowUpRight className="h-4 w-4 text-green-300 mr-2" />
                    Growing customer base
                  </div>
                  <div className="mt-2 text-xs text-purple-200">
                    {customers.filter((c) => c.customerType === "company").length} companies,{" "}
                    {customers.filter((c) => c.customerType === "individual").length} individuals
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total registered customers in your database. Mix of companies and individuals.</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium text-orange-100">Monthly Revenue</CardTitle>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {formatCurrency(stats.monthlyRevenue)}
                  </div>
                  <div className="flex items-center text-sm text-orange-100">
                    <ArrowUpRight className="h-4 w-4 text-green-300 mr-2" />
                    Strong performance
                  </div>
                  <div className="mt-2 text-xs text-orange-200">Revenue from {rentals.length} total rentals</div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total revenue generated this month from all rental activities.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Quick Actions with improved UX */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used operations to speed up your workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Tooltip key={action.title}>
                  <TooltipTrigger asChild>
                    <Link href={action.href}>
                      <Button
                        className={`h-24 w-full flex-col gap-3 bg-gradient-to-r ${action.color} hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white border-0`}
                      >
                        <action.icon className="h-6 w-6" />
                        <div className="text-center">
                          <div className="text-sm font-semibold">{action.title}</div>
                          <div className="text-xs opacity-90">{action.description}</div>
                        </div>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Secondary Metrics with better visual design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                Equipment Performance
              </CardTitle>
              <CardDescription>Current utilization and availability metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-700">Utilization Rate</span>
                    <span className="font-bold text-blue-600 text-lg">{stats.utilizationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all duration-1000 shadow-lg relative"
                      style={{ width: `${stats.utilizationRate}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {stats.utilizationRate >= 80
                      ? "🟢 Excellent utilization"
                      : stats.utilizationRate >= 60
                        ? "🟡 Good utilization"
                        : "🔴 Low utilization"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-gray-600 text-xs font-medium">Currently Rented</div>
                    <div className="font-bold text-blue-600 text-xl">
                      {equipment.reduce((sum, e) => sum + (e.totalQuantity - e.availableQuantity), 0)}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">Active equipment</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="text-gray-600 text-xs font-medium">Available Now</div>
                    <div className="font-bold text-green-600 text-xl">{stats.availableEquipment}</div>
                    <div className="text-xs text-green-600 mt-1">Ready to rent</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                Financial Summary
              </CardTitle>
              <CardDescription>Revenue and outstanding amounts overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-100">
                  <div>
                    <span className="text-gray-600 font-medium text-sm">Total Revenue</span>
                    <div className="text-xs text-gray-500">This month</div>
                  </div>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(stats.monthlyRevenue)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div>
                    <span className="text-gray-600 font-medium text-sm">Outstanding</span>
                    <div className="text-xs text-gray-500">Pending payments</div>
                  </div>
                  <span className="font-bold text-orange-600 text-lg">
                    {formatCurrency(rentals.reduce((sum, r) => sum + r.outstandingAmount, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <span className="text-gray-600 font-medium text-sm">Equipment Value</span>
                    <div className="text-xs text-gray-500">Total inventory</div>
                  </div>
                  <span className="font-bold text-blue-600 text-lg">{formatCurrency(stats.totalValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                System Alerts
              </CardTitle>
              <CardDescription>Important notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.overdueRentals > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                    <div className="flex-1">
                      <span className="text-red-700 font-medium text-sm">{stats.overdueRentals} overdue rentals</span>
                      <div className="text-xs text-red-600 mt-1">Requires immediate attention</div>
                    </div>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      View
                    </Button>
                  </div>
                )}
                {lowStockEquipment.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse flex-shrink-0"></div>
                    <div className="flex-1">
                      <span className="text-yellow-700 font-medium text-sm">
                        {lowStockEquipment.length} items low stock
                      </span>
                      <div className="text-xs text-yellow-600 mt-1">Consider restocking soon</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                    >
                      View
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <span className="text-green-700 font-medium text-sm">System operational</span>
                    <div className="text-xs text-green-600 mt-1">All systems running smoothly</div>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Recent Activity with better information architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Rentals */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  Recent Rentals
                </CardTitle>
                <Link href="/dashboard/rentals">
                  <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/80">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
              <CardDescription>Latest rental activities and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRentals.map((rental) => (
                  <div
                    key={rental.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-200/50 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-lg text-sm">
                          {rental.rentalNumber}
                        </span>
                        <Badge className={`${getStatusColor(rental.status)} border-0 text-xs`}>{rental.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-900 font-semibold">{rental.customerName}</p>
                      <p className="text-sm text-gray-600">{rental.items[0]?.equipmentName}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {formatDate(rental.expectedReturnDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(rental.rentalDate)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(rental.totalAmount)}</p>
                      <p className="text-xs text-gray-500">Total amount</p>
                      {rental.outstandingAmount > 0 && (
                        <p className="text-xs text-red-600 font-medium mt-1">
                          {formatCurrency(rental.outstandingAmount)} pending
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {recentRentals.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No recent rentals</p>
                    <p className="text-sm text-gray-400 mt-1">New rentals will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Alerts */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-white" />
                </div>
                Inventory Status
              </CardTitle>
              <CardDescription>Equipment requiring attention or restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockEquipment.length > 0 ? (
                  lowStockEquipment.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                            Low Stock
                          </Badge>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg">
                            {item.availableQuantity}/{item.totalQuantity} available
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">{item.availableQuantity}</p>
                        <p className="text-xs text-gray-500">remaining</p>
                        <div className="mt-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                              style={{ width: `${(item.availableQuantity / item.totalQuantity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-600 font-medium">All equipment well stocked</p>
                    <p className="text-sm text-gray-500 mt-1">No immediate restocking required</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
