"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { useAppNavigation } from "@/lib/navigation"
import { BluberryLogoSVG } from "./blueberry-logo-svg"

export default function Footer() {
  const pathname = usePathname()
  const { navigateTo } = useAppNavigation()

  // Handle navigation for consistent transitions
  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault()

    // Only navigate if we're going to a different page
    if (href !== pathname) {
      navigateTo(href)
    }
  }

  // Navigation links from navbar
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/reviews", label: "Reviews" },
    { href: "/sell-item", label: "Sell Your Item" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info Column */}
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-4 flex">
              <div className="inline-flex items-center">
                <div className="relative w-5 h-5 mr-1">
                  <BluberryLogoSVG width={20} height={20} />
                </div>
                <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                  BluBerry
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">847-510-3229</p>
              <p>
                <a
                  href="mailto:alecgold808@gmail.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  alecgold808@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-sm font-semibold mb-4">Navigation</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavigation(link.href, e)}
                  className={`text-sm text-muted-foreground hover:text-primary transition-colors ${
                    pathname === link.href ? "text-primary font-medium" : ""
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Legal Column */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <a
              href="/privacy-policy"
              onClick={(e) => handleNavigation("/privacy-policy", e)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => handleNavigation("/terms", e)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 pt-4 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground">
            Copyright © {new Date().getFullYear()} BluBerry. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
