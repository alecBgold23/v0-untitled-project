"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <Navbar />
      <main className="pt-12">{children}</main>
      <Footer />
    </>
  )
}
