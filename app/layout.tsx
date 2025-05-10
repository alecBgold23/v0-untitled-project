import type React from "react"
import "@/app/globals.css"
import { Inter, Poppins, Roboto } from "next/font/google"
import { validateEnv } from "@/lib/env"
import ClientLayout from "./client-layout"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"

// Validate environment variables during build/startup
validateEnv()

const inter = Inter({ subsets: ["latin"] })

// Properly load Poppins font with Next.js font system
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

// Add Roboto font
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
})

export const metadata = {
  title: "BluBerry - Selling Made Simpler",
  description:
    "BluBerry removes the hassle of selling second-hand items by doing all the work for you — from pricing to pickup — so you can make fast cash, effortlessly.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense>
            <ClientLayout>{children}</ClientLayout>
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
