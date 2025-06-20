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
import { ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { sendPasswordReset } from "@/lib/firebase-auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await sendPasswordReset(email)
      setEmailSent(true)

      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)

      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    try {
      await sendPasswordReset(email)
      toast({
        title: "Email Resent",
        description: "Password reset email has been sent again.",
      })
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend email.",
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
              {emailSent ? "Check Your Email" : "Reset Password"}
            </CardTitle>
            <p className="text-gray-600 font-medium">
              {emailSent ? "We've sent you reset instructions" : "Enter your admin email address"}
            </p>
          </div>
        </CardHeader>

        <CardContent className="relative">
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Admin Email Address
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

              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Reset Email...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Send Reset Email
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-700">We've sent password reset instructions to:</p>
                  <p className="font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">{email}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-left">
                  <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the reset link in the email</li>
                    <li>Create a new secure password</li>
                    <li>Sign in with your new password</li>
                  </ol>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full py-3 bg-white text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Email
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => router.push("/login")}
                  variant="ghost"
                  className="w-full py-3 text-gray-600 hover:text-gray-800 rounded-xl transition-all duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-semibold text-amber-800">Need Help?</p>
              </div>
              <p className="text-xs text-amber-700">
                If you don't receive the email within 5 minutes, contact your system administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
