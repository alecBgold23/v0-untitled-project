"use client"

import type React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAppNavigation } from "@/lib/navigation"

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
    <footer className="apple-footer py-4 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-2 flex justify-center w-full">
            <div className="inline-flex items-center">
              <div className="relative w-5 h-5 mr-1">
                <Image
                  src="/images/BluBerry_Logo_Transparent.png"
                  alt="BluBerry Logo"
                  width={20}
                  height={20}
                  className="object-contain bg-transparent"
                />
              </div>
              <span className="text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                BluBerry
              </span>
            </div>
          </div>

          <div className="space-y-0.5 mb-2">
            <p className="text-xs text-gray-500">847-510-3229</p>
            <p>
              <a
                href="mailto:alecgold808@gmail.com"
                className="text-xs text-gray-500 hover:text-[#3B82F6] transition-colors"
              >
                alecgold808@gmail.com
              </a>
            </p>
          </div>

          <div className="text-center text-xs text-gray-400">
            <p className="mb-0.5">Copyright © {new Date().getFullYear()} BluBerry. All rights reserved.</p>
            <a
              href="/privacy-policy"
              onClick={(e) => handleNavigation("/privacy-policy", e)}
              className="text-gray-500 hover:text-[#3B82F6] transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
