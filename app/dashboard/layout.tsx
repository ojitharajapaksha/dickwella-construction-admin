"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  BarChart3,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Home,
  Shield,
} from "lucide-react"
import { getCurrentAdmin, signOutAdmin, hasPermission, type AdminUser } from "@/lib/firebase-auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const admin = await getCurrentAdmin()

        if (!admin) {
          router.push("/login")
          return
        }

        setAdminUser(admin)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await signOutAdmin()
      localStorage.removeItem("adminUser")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <div className="text-center">
                <p className="text-gray-700 font-semibold">Verifying Access...</p>
                <p className="text-gray-500 text-sm mt-1">Please wait while we authenticate your credentials</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !adminUser) {
    return null
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Overview & Key Metrics",
      gradient: "from-blue-500 to-cyan-500",
      helpText: "View business overview, key metrics, and quick actions",
      permission: "view_dashboard",
    },
    {
      name: "Equipment",
      href: "/dashboard/equipment",
      icon: Package,
      description: "Inventory Management",
      gradient: "from-green-500 to-emerald-500",
      helpText: "Manage equipment inventory, add new items, and track availability",
      permission: "manage_equipment",
    },
    {
      name: "Customers",
      href: "/dashboard/customers",
      icon: Users,
      description: "Customer Database",
      gradient: "from-purple-500 to-pink-500",
      helpText: "Manage customer information, contacts, and credit limits",
      permission: "manage_customers",
    },
    {
      name: "Rentals",
      href: "/dashboard/rentals",
      icon: FileText,
      description: "Rental Operations",
      gradient: "from-orange-500 to-red-500",
      helpText: "Create new rentals, track active rentals, and manage returns",
      permission: "manage_rentals",
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      description: "Business Insights",
      gradient: "from-indigo-500 to-purple-500",
      helpText: "View detailed analytics, reports, and business performance",
      permission: "view_analytics",
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      description: "System Configuration",
      gradient: "from-gray-500 to-slate-500",
      helpText: "Configure system settings, company info, and user preferences",
      permission: "manage_settings",
    },
  ].filter((item) => hasPermission(adminUser, item.permission))

  const isActivePath = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const getCurrentPageInfo = () => {
    const currentNav = navigation.find((nav) => isActivePath(nav.href))
    return currentNav || navigation[0]
  }

  const currentPage = getCurrentPageInfo()

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-gradient-to-r from-red-500 to-pink-500"
      case "admin":
        return "bg-gradient-to-r from-blue-500 to-purple-500"
      case "staff":
        return "bg-gradient-to-r from-green-500 to-emerald-500"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500"
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200/50">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-30"></div>
                <div className="relative bg-white p-2 rounded-xl shadow-lg">
                  <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Portal
                </h1>
                <p className="text-xs text-gray-500 font-medium">Dickwella Construction</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="hover:bg-gray-100/50">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Tooltip key={item.name} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-4 py-4 text-sm font-medium rounded-2xl transition-all duration-200 ${
                      isActivePath(item.href)
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                        : "text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-lg"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div
                      className={`mr-4 p-2 rounded-xl transition-colors ${
                        isActivePath(item.href) ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActivePath(item.href) ? "text-white" : "text-gray-600"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className={`text-xs ${isActivePath(item.href) ? "text-white/80" : "text-gray-500"}`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>{item.helpText}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>

          <div className="border-t border-gray-200/50 p-4">
            <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
              <div
                className={`w-10 h-10 ${getRoleBadgeColor(adminUser.role)} rounded-xl flex items-center justify-center`}
              >
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{adminUser.fullName}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{adminUser.role.replace("_", " ")}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full bg-white/50 hover:bg-white/80 border-gray-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
          <div className="flex flex-col flex-grow bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl">
            <div className="flex items-center h-20 px-6 border-b border-gray-200/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-30"></div>
                  <div className="relative bg-white p-2 rounded-xl shadow-lg">
                    <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-lg" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Admin Portal
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Dickwella Construction</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`group flex items-center px-4 py-4 text-sm font-medium rounded-2xl transition-all duration-200 ${
                        isActivePath(item.href)
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                          : "text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-lg"
                      }`}
                    >
                      <div
                        className={`mr-4 p-2 rounded-xl transition-colors ${
                          isActivePath(item.href) ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"
                        }`}
                      >
                        <item.icon className={`h-5 w-5 ${isActivePath(item.href) ? "text-white" : "text-gray-600"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{item.name}</div>
                        <div className={`text-xs ${isActivePath(item.href) ? "text-white/80" : "text-gray-500"}`}>
                          {item.description}
                        </div>
                      </div>
                      {isActivePath(item.href) && <Sparkles className="h-4 w-4 text-white/80" />}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>{item.helpText}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>

            <div className="border-t border-gray-200/50 p-4">
              <div className="flex items-center gap-3 mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                <div
                  className={`w-12 h-12 ${getRoleBadgeColor(adminUser.role)} rounded-xl flex items-center justify-center`}
                >
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{adminUser.fullName}</p>
                  <p className="text-xs text-gray-500 truncate capitalize">{adminUser.role.replace("_", " ")}</p>
                </div>
                <Badge className={`${getRoleBadgeColor(adminUser.role)} text-white text-xs px-2 py-1`}>
                  {adminUser.role === "super_admin" ? "Super" : adminUser.role === "admin" ? "Admin" : "Staff"}
                </Badge>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full bg-white/50 hover:bg-white/80 border-gray-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-80">
          {/* Enhanced top header with breadcrumbs */}
          <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-lg">
            <div className="flex h-20 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-white/50"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <div className="relative flex flex-1 items-center">
                  {/* Breadcrumb navigation */}
                  <div className="flex items-center space-x-2 text-sm">
                    <Home className="h-4 w-4 text-gray-400" />
                    <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
                    <span className="text-gray-600">Dashboard</span>
                    {pathname !== "/dashboard" && (
                      <>
                        <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
                        <span className="font-semibold text-gray-900">{currentPage.name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Help button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative hover:bg-white/50">
                        <HelpCircle className="h-5 w-5 text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Get help and support</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Notifications */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative hover:bg-white/50">
                        <Bell className="h-5 w-5 text-gray-600" />
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white">
                          3
                        </Badge>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>3 new notifications</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* User profile */}
                  <div className="hidden sm:flex items-center gap-3 bg-white/50 rounded-2xl px-4 py-2">
                    <div
                      className={`w-8 h-8 ${getRoleBadgeColor(adminUser.role)} rounded-xl flex items-center justify-center`}
                    >
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">{adminUser.fullName}</div>
                      <div className="text-xs text-gray-500 capitalize">{adminUser.role.replace("_", " ")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Page title and description */}
            <div className="px-4 sm:px-6 lg:px-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 bg-gradient-to-r ${currentPage.gradient} rounded-lg flex items-center justify-center`}
                    >
                      <currentPage.icon className="h-4 w-4 text-white" />
                    </div>
                    {currentPage.name}
                  </h1>
                  <p className="text-gray-600 mt-1">{currentPage.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="py-8">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
