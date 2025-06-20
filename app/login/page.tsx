"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Shield, AlertCircle } from "lucide-react"
import { signInAdmin } from "@/lib/firebase-auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const adminUser = await signInAdmin(email, password)

      if (adminUser) {
        // Store admin info in localStorage for quick access
        localStorage.setItem("adminUser", JSON.stringify(adminUser))

        toast({
          title: "Login Successful",
          description: `Welcome back, ${adminUser.fullName}!`,
        })

        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Login error:", error)

      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials or unauthorized access",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-x-36 -translate-y-36 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-400/20 to-pink-400/20 rounded-full translate-x-48 translate-y-48 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full -translate-x-32 -translate-y-32 animate-pulse"></div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-xl relative overflow-hidden">
        {/* Card Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 rounded-full translate-y-12 -translate-x-12"></div>

        <CardHeader className="text-center space-y-6 relative">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-lg">
                <Image src="/logo.png" alt="Dickwella Construction" width={80} height={80} className="rounded-xl" />
              </div>
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Admin Portal
            </CardTitle>
            <p className="text-gray-600 font-medium">Dickwella Construction Management</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-500">Authorized Access Only</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your admin email"
                  disabled={isLoading}
                  className="pl-4 pr-4 py-3 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="pl-4 pr-12 py-3 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100/50 rounded-lg"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div></div>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-semibold text-amber-800">Authorized Personnel Only</p>
              </div>
              <p className="text-xs text-amber-700">
                Admin credentials are managed by system administrators. Contact IT support if you need access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
