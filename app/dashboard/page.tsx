"use client"

import { useState, useEffect } from "react"
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
  Eye,
  ArrowUpRight,
  Sparkles,
  Zap,
  BarChart3,
  Clock,
  Target,
  Wrench,
  Loader2,
} from "lucide-react"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { fetchAnalytics, fetchEquipment, fetchCustomers, fetchRentals } from "@/lib/api-client"
import Link from "next/link"

interface DashboardStats {
  totalEquipment: number
  availableEquipment: number
  activeRentals: number
  totalCustomers: number
  monthlyRevenue: number
  overdueRentals: number
  totalValue: number
  utilizationRate: number
}

interface RecentRental {
  id: string
  rentalNumber: string
  customerName: string
  customerPhone: string
  totalAmount: number
  status: string
  rentalDate: string
  expectedReturnDate: string
  outstandingAmount: number
  items: Array<{
    equipmentName: string
    quantity: number
  }>
}

interface LowStockEquipment {
  id: string
  name: string
  category: string
  availableQuantity: number
  totalQuantity: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentRentals, setRecentRentals] = useState<RecentRental[]>([])
  const [lowStockEquipment, setLowStockEquipment] = useState<LowStockEquipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [analyticsData, equipmentData, customersData, rentalsData] = await Promise.all([
        fetchAnalytics(),
        fetchEquipment(),
        fetchCustomers(),
        fetchRentals(),
      ])

      // Calculate stats
      const totalEquipment = equipmentData.length
      const availableEquipment = equipmentData.filter((e: any) => e.status === "available").length
      const activeRentals = rentalsData.filter((r: any) => r.status === "active").length
      const totalCustomers = customersData.length
      const monthlyRevenue = rentalsData.reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0)
      const overdueRentals = rentalsData.filter((r: any) => r.status === "overdue").length
      const totalValue = equipmentData.reduce(
        (sum: number, e: any) => sum + (e.dailyRate || 0) * (e.totalQuantity || 0),
        0,
      )

      const totalEquipmentCount = equipmentData.reduce((sum: number, e: any) => sum + (e.totalQuantity || 0), 0)
      const rentedEquipmentCount = equipmentData.reduce(
        (sum: number, e: any) => sum + ((e.totalQuantity || 0) - (e.availableQuantity || 0)),
        0,
      )
      const utilizationRate =
        totalEquipmentCount > 0 ? Math.round((rentedEquipmentCount / totalEquipmentCount) * 100) : 0

      setStats({
        totalEquipment,
        availableEquipment,
        activeRentals,
        totalCustomers,
        monthlyRevenue,
        overdueRentals,
        totalValue,
        utilizationRate,
      })

      // Set recent rentals (last 5)
      const sortedRentals = rentalsData
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt || b.rentalDate).getTime() - new Date(a.createdAt || a.rentalDate).getTime(),
        )
        .slice(0, 5)
      setRecentRentals(sortedRentals)

      // Set low stock equipment
      const lowStock = equipmentData.filter((e: any) => (e.availableQuantity || 0) <= 2 && (e.totalQuantity || 0) > 2)
      setLowStockEquipment(lowStock)
    } catch (err) {
      console.error("Dashboard data loading error:", err)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

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
                    {stats.totalEquipment > 0 ? Math.round((stats.availableEquipment / stats.totalEquipment) * 100) : 0}
                    % availability rate
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
                  <div className="mt-2 text-xs text-purple-200">Active customer database</div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total registered customers in your database.</p>
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
                  <div className="mt-2 text-xs text-orange-200">Revenue from all rentals</div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total revenue generated from all rental activities.</p>
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
                {recentRentals.length > 0 ? (
                  recentRentals.map((rental) => (
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
                        <p className="text-sm text-gray-600">{rental.items?.[0]?.equipmentName || "No equipment"}</p>
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
                  ))
                ) : (
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
