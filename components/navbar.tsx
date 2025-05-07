"use client"
import type React from "react"

import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Search } from "lucide-react"
import { useState } from "react"
import SearchModal from "./search"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/reviews", label: "Reviews" },
    { href: "/sell-item", label: "Sell Your Item" },
    { href: "/contact", label: "Contact" },
  ]

  // Handle navigation for all links
  const handleNavigation = (href: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
    }
    setIsMenuOpen(false)
    router.push(href)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 apple-nav">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center h-12">
            {/* Logo - use router navigation instead of Link */}
            <a href="/" onClick={(e) => handleNavigation("/", e)} className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/images/blueberry-logo.png"
                  alt="BluBerry Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-medium sparkle-text">BluBerry</span>
            </a>

            {/* Desktop navigation - use router navigation instead of Link */}
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavigation(link.href, e)}
                  className={`text-sm hover:text-[#3B82F6] transition-all duration-200 ${
                    pathname === link.href ? "text-[#3B82F6]" : "text-gray-600"
                  } hover:translate-y-[-1px]`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center">
              <button
                className="text-gray-600 hover:text-[#3B82F6] transition-all duration-200 hover:scale-110"
                aria-label="Search"
                onClick={toggleSearch}
              >
                <Search size={18} />
              </button>

              {/* Mobile menu button */}
              <button
                className="md:hidden ml-4 text-gray-600 transition-all duration-200 hover:text-[#3B82F6] hover:scale-110"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>

          {/* Mobile navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 flex flex-col gap-6 items-center">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavigation(link.href, e)}
                  className={`text-sm hover:text-[#3B82F6] transition-all duration-200 ${
                    pathname === link.href ? "text-[#3B82F6]" : "text-gray-600"
                  } hover:translate-y-[-1px]`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Add a spacer to account for the fixed navbar */}
      <div className="h-12"></div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
