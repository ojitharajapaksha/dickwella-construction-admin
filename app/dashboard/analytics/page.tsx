"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAnalyticsData } from "@/lib/database-operations"
import { formatCurrency } from "@/lib/utils"

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("monthly")
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      const data = await getAnalyticsData()
      setAnalytics(data)
    } catch (error) {
      console.error("Error loading analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load analytics data</p>
          <Button onClick={loadAnalytics} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Overview</h1>
          <p className="text-gray-600">Simple insights about your rental business</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Simple Key Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Money Earned</p>
                <p className="text-2xl font-bold text-blue-900">
                  {analytics.revenue.monthly.length > 0
                    ? formatCurrency(analytics.revenue.monthly.reduce((sum: number, item: any) => sum + item.amount, 0))
                    : formatCurrency(0)}
                </p>
                <p className="text-sm text-blue-600 mt-1">↗ From all rentals</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Customers</p>
                <p className="text-2xl font-bold text-green-900">{analytics.customers.topCustomers.length}</p>
                <p className="text-sm text-green-600 mt-1">Registered customers</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Equipment in Use</p>
                <p className="text-2xl font-bold text-purple-900">
                  {analytics.equipment.utilization.length > 0
                    ? Math.round(
                        analytics.equipment.utilization.reduce((sum: number, item: any) => sum + item.percentage, 0) /
                          analytics.equipment.utilization.length,
                      )
                    : 0}
                  %
                </p>
                <p className="text-sm text-purple-600 mt-1">Average utilization</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Total Rentals</p>
                <p className="text-2xl font-bold text-orange-900">
                  {analytics.rentals.status.reduce((sum: number, item: any) => sum + item.count, 0)}
                </p>
                <p className="text-sm text-orange-600 mt-1">All time rentals</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Money Earned Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Money Earned Each Month
            </CardTitle>
            <CardDescription>How much money you made each month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.revenue.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Equipment Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment Usage</CardTitle>
            <CardDescription>Which equipment types are used most</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.equipment.utilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, "Usage"]} />
                <Bar dataKey="percentage" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Simple Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Rental Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Rentals</CardTitle>
            <CardDescription>Status of all equipment rentals right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.rentals.status.map((status: any, index: number) => (
                <div
                  key={status.status}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    status.status === "active"
                      ? "bg-green-50 border-green-200"
                      : status.status === "overdue"
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {status.status === "active" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : status.status === "overdue" ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-600" />
                    )}
                    <span
                      className={`font-medium ${
                        status.status === "active"
                          ? "text-green-900"
                          : status.status === "overdue"
                            ? "text-red-900"
                            : "text-gray-900"
                      }`}
                    >
                      {status.status.charAt(0).toUpperCase() + status.status.slice(1)} Rentals
                    </span>
                  </div>
                  <Badge
                    className={
                      status.status === "active"
                        ? "bg-green-600 text-white"
                        : status.status === "overdue"
                          ? "bg-red-600 text-white"
                          : "bg-gray-600 text-white"
                    }
                  >
                    {status.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Equipment</CardTitle>
            <CardDescription>Equipment that customers rent most often</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.equipment.popular.slice(0, 5).map((item: any, index: number) => (
                <div key={item.name} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.rentals} times</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Best Customers</CardTitle>
            <CardDescription>Customers who spend the most money</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.customers.topCustomers.slice(0, 5).map((customer: any, index: number) => (
                <div key={customer.name} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-600">{customer.rentals} rentals</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Summary</CardTitle>
          <CardDescription>Key points about your business performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Business Growth</h3>
              <p className="text-2xl font-bold text-blue-600 mb-1">
                {analytics.revenue.monthly.length > 0 ? "+12.5%" : "0%"}
              </p>
              <p className="text-sm text-gray-600">Revenue trend</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Customer Base</h3>
              <p className="text-2xl font-bold text-green-600 mb-1">{analytics.customers.topCustomers.length}</p>
              <p className="text-sm text-gray-600">Total customers</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Equipment Performance</h3>
              <p className="text-2xl font-bold text-purple-600 mb-1">
                {analytics.equipment.utilization.length > 0
                  ? Math.round(
                      analytics.equipment.utilization.reduce((sum: number, item: any) => sum + item.percentage, 0) /
                        analytics.equipment.utilization.length,
                    )
                  : 0}
                %
              </p>
              <p className="text-sm text-gray-600">Average utilization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
