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

  return (
    <footer className="py-4 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-2 flex justify-center w-full">
            <div className="inline-flex items-center">
              <div className="relative w-5 h-5 mr-1">
                <BluberryLogoSVG width={20} height={20} />
              </div>
              <span className="text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                BluBerry
              </span>
            </div>
          </div>

          <div className="space-y-0.5 mb-2">
            <p className="text-xs text-muted-foreground">847-510-3229</p>
            <p>
              <a
                href="mailto:alecgold808@gmail.com"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                alecgold808@gmail.com
              </a>
            </p>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p className="mb-0.5">Copyright © {new Date().getFullYear()} BluBerry. All rights reserved.</p>
            <a
              href="/privacy-policy"
              onClick={(e) => handleNavigation("/privacy-policy", e)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
