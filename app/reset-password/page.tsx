"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Lock } from "lucide-react"
import { verifyPasswordReset, confirmPasswordResetWithCode } from "@/lib/firebase-auth"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [resetComplete, setResetComplete] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const oobCode = searchParams.get("oobCode")

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError("Invalid reset link. Please request a new password reset.")
        setIsVerifying(false)
        return
      }

      try {
        const verifiedEmail = await verifyPasswordReset(oobCode)
        setEmail(verifiedEmail)
        setIsVerifying(false)
      } catch (error: any) {
        setError(error.message || "Invalid or expired reset link.")
        setIsVerifying(false)
      }
    }

    verifyCode()
  }, [oobCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await confirmPasswordResetWithCode(oobCode!, password)
      setResetComplete(true)

      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully.",
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      console.error("Password reset error:", error)

      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verifying reset link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="space-y-2">
              <Link href="/forgot-password">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Request New Reset Link</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-x-36 -translate-y-36 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-400/20 to-pink-400/20 rounded-full translate-x-48 translate-y-48 animate-pulse"></div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-xl relative overflow-hidden">
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
              {resetComplete ? "Password Updated!" : "Create New Password"}
            </CardTitle>
            <p className="text-gray-600 font-medium">
              {resetComplete ? "You can now sign in with your new password" : `Reset password for ${email}`}
            </p>
          </div>
        </CardHeader>

        <CardContent className="relative">
          {!resetComplete ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="pl-4 pr-12 py-3 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100/50 rounded-lg"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                <p className="text-xs text-blue-700">
                  Password must be at least 6 characters long and contain a mix of letters and numbers for security.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-gray-700 font-medium">Your password has been successfully updated!</p>
                <p className="text-sm text-gray-600">Redirecting to login page in a few seconds...</p>
              </div>

              <Link href="/login">
                <Button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl">
                  Sign In Now
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
