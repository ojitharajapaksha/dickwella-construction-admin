"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Building, Phone, Mail, Globe, MapPin } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()

  const [companyInfo, setCompanyInfo] = useState({
    name: "Dickwella Construction",
    slogan: "The pioneers of building material suppliers and government contractors",
    phone1: "+94777209227",
    phone2: "+94707209227",
    telephone: "+94412255897",
    email: "info@dickwellaconstruction.com",
    website: "www.dickwellaconstruction.com",
    address: "Tangalle Rd, Dickwella",
  })

  const handleSaveCompanyInfo = (formData: FormData) => {
    const updatedInfo = {
      name: formData.get("name") as string,
      slogan: formData.get("slogan") as string,
      phone1: formData.get("phone1") as string,
      phone2: formData.get("phone2") as string,
      telephone: formData.get("telephone") as string,
      email: formData.get("email") as string,
      website: formData.get("website") as string,
      address: formData.get("address") as string,
    }

    setCompanyInfo(updatedInfo)
    toast({
      title: "Settings Updated",
      description: "Company information has been updated successfully",
    })
  }

  const handleChangePassword = (formData: FormData) => {
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    // In real app, this would call your API
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your system settings and company information</p>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>Update your company details and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSaveCompanyInfo} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" name="name" defaultValue={companyInfo.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slogan">Slogan</Label>
                <Input id="slogan" name="slogan" defaultValue={companyInfo.slogan} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone1">Primary Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="phone1" name="phone1" defaultValue={companyInfo.phone1} className="pl-8" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone2">Secondary Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="phone2" name="phone2" defaultValue={companyInfo.phone2} className="pl-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="telephone" name="telephone" defaultValue={companyInfo.telephone} className="pl-8" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={companyInfo.email}
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="website" name="website" defaultValue={companyInfo.website} className="pl-8" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Textarea id="address" name="address" defaultValue={companyInfo.address} className="pl-8" required />
              </div>
            </div>

            <Button type="submit">Save Company Information</Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Change your password and manage security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" name="newPassword" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required />
              </div>
            </div>

            <Button type="submit">Change Password</Button>
          </form>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Current system status and information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">System Version:</span> v1.0.0
            </div>
            <div>
              <span className="font-medium">Last Backup:</span> 2024-01-24 10:30 AM
            </div>
            <div>
              <span className="font-medium">Database Status:</span>
              <span className="text-green-600 ml-1">Connected</span>
            </div>
            <div>
              <span className="font-medium">Total Records:</span> 1,247
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
