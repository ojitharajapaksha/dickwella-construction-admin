"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
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
} from "lucide-react"
import { useState } from "react"
import { getAnalytics } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("monthly")
  const analytics = getAnalytics()

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
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(3450000)}</p>
                <p className="text-sm text-blue-600 mt-1">↗ 12% more than last month</p>
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
                <p className="text-2xl font-bold text-green-900">87</p>
                <p className="text-sm text-green-600 mt-1">18 new customers this month</p>
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
                <p className="text-2xl font-bold text-purple-900">74%</p>
                <p className="text-sm text-purple-600 mt-1">Good utilization rate</p>
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
                <p className="text-2xl font-bold text-orange-900">184</p>
                <p className="text-sm text-orange-600 mt-1">23 rentals this month</p>
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
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Active Rentals</span>
                </div>
                <Badge className="bg-green-600 text-white">45</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Due for Return</span>
                </div>
                <Badge className="bg-yellow-600 text-white">12</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-900">Overdue</span>
                </div>
                <Badge className="bg-red-600 text-white">3</Badge>
              </div>
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
              {analytics.equipment.popular.slice(0, 5).map((item, index) => (
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
              {analytics.customers.topCustomers.slice(0, 5).map((customer, index) => (
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

      {/* Simple Money Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Money Breakdown</CardTitle>
          <CardDescription>Where your money comes from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Revenue by Equipment Type</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics.equipment.revenue}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.equipment.revenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Monthly Rental Count</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.rentals.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <p className="text-2xl font-bold text-blue-600 mb-1">+12.5%</p>
              <p className="text-sm text-gray-600">More money than last month</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Customer Happiness</h3>
              <p className="text-2xl font-bold text-green-600 mb-1">94%</p>
              <p className="text-sm text-gray-600">Customers are satisfied</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Equipment Performance</h3>
              <p className="text-2xl font-bold text-purple-600 mb-1">87%</p>
              <p className="text-sm text-gray-600">Equipment working well</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
