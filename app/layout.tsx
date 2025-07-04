import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayout from "./client-layout"
import { AuthProvider } from "@/contexts/auth-context"
import SmoothTransitionProvider from "@/components/smooth-transition-provider"

export const metadata = {
  title: "BluBerry - Selling Made Simpler",
  description: "BluBerry makes selling your unused items simple and efficient.",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
          <AuthProvider>
            <ClientLayout>
              <SmoothTransitionProvider>{children}</SmoothTransitionProvider>
            </ClientLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
