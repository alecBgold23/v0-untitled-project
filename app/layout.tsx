import type React from "react"
import "@/app/globals.css"
import { Inter, Poppins, Roboto } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Footer from "@/components/footer"
import { validateEnv } from "@/lib/env"
import Navbar from "@/components/navbar"

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${poppins.variable} ${roboto.variable} min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="flex-grow pt-12">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
