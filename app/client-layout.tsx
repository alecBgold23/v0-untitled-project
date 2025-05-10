"use client"

import type React from "react"
import "@/app/globals.css"
import { Inter, Poppins, Roboto } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Footer from "@/components/footer"
import { validateEnv } from "@/lib/env"
import Navbar from "@/components/navbar"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"

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

// Client component to handle scroll to top
function ScrollToTop() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // When the route changes, scroll to the top of the page
    window.scrollTo(0, 0)
  }, [pathname, searchParams])

  return null
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${poppins.variable} ${roboto.variable} min-h-screen overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Suspense fallback={<div>Loading...</div>}>
              {/* @ts-expect-error Server Component */}
              <ScrollToTop />
            </Suspense>
            <Navbar />
            <main className="flex-grow pt-12">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
