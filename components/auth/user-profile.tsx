"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UserProfile() {
  const { user, updateUserProfile, logout } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await updateUserProfile(displayName)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      })
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error: any) {
      setError(error.message || "Failed to log out")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Your Profile</CardTitle>
        <CardDescription>View and update your profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="flex items-center space-x-2">
              <Input id="phoneNumber" type="tel" value={user?.phoneNumber || "Not verified"} disabled />
              <Link href="/auth/phone-verification">
                <Button type="button" variant="outline" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              {user?.phoneNumber ? "Your phone number is verified" : "Verify your phone number for added security"}
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Sign Out
        </Button>
        <Button variant="outline" size="sm" asChild className="mt-2">
          <Link href="/verify-phone">
            <Phone className="h-4 w-4 mr-2" />
            Verify Phone Number
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
