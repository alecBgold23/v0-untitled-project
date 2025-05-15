import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key, Bell, Shield, User, Mail } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/settings/api-key" passHref>
            <Card className="h-full cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <Key className="h-5 w-5 mb-2 text-primary" />
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Configure API keys for external services</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Set up your OpenAI API key to enable AI-powered features.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto">
                  Configure
                </Button>
              </CardFooter>
            </Card>
          </Link>

          <Card className="h-full">
            <CardHeader>
              <Bell className="h-5 w-5 mb-2 text-primary" />
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Control which notifications you receive and how they are delivered.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="ml-auto">
                Configure
              </Button>
            </CardFooter>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <Shield className="h-5 w-5 mb-2 text-primary" />
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Update your password, enable two-factor authentication, and more.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="ml-auto">
                Configure
              </Button>
            </CardFooter>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <User className="h-5 w-5 mb-2 text-primary" />
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Update your name, profile picture, and other personal information.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="ml-auto">
                Configure
              </Button>
            </CardFooter>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <Mail className="h-5 w-5 mb-2 text-primary" />
              <CardTitle>Email</CardTitle>
              <CardDescription>Manage your email settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Update your email address and email notification preferences.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="ml-auto">
                Configure
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
