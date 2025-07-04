"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ThemeTestPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Theme Test Page</h1>
          <p className="text-muted-foreground">
            Current theme: {theme} | Resolved theme: {resolvedTheme}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Light Theme Test</CardTitle>
              <CardDescription>This card should have light colors in light mode</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setTheme("light")} className="mr-2">
                Set Light Theme
              </Button>
              <Button variant="outline" onClick={() => setTheme("dark")}>
                Set Dark Theme
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dark Theme Test</CardTitle>
              <CardDescription>This card should have dark colors in dark mode</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setTheme("system")} className="mr-2">
                Use System Theme
              </Button>
              <Button variant="secondary">Secondary Button</Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Background Colors Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background border p-4 rounded">Background</div>
            <div className="bg-card border p-4 rounded">Card</div>
            <div className="bg-muted border p-4 rounded">Muted</div>
            <div className="bg-accent border p-4 rounded">Accent</div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            If the theme toggle is working, you should see different colors when switching themes.
          </p>
        </div>
      </div>
    </div>
  )
}
