"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { BluberryLogoSVG } from "@/components/blueberry-logo-svg"

// Navigation items
const mainNavItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false)
  }, [pathname])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <BluberryLogoSVG />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm rounded-md transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary font-medium" : "text-foreground/80"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Tools Dropdown */}
            <Link
              href="/sell-item"
              className={`px-3 py-2 text-sm rounded-md transition-colors hover:text-primary ${
                pathname === "/sell-item" ? "text-primary font-medium" : "text-foreground/80"
              }`}
            >
              Sell Your Item
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              className="md:hidden text-foreground/80 transition-all duration-200 hover:text-primary"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 flex flex-col gap-3 items-start bg-background border-t border-border">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted w-full ${
                  pathname === item.href ? "text-primary font-medium" : "text-foreground/80"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/sell-item"
              className={`px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted w-full ${
                pathname === "/sell-item" ? "text-primary font-medium" : "text-foreground/80"
              }`}
            >
              Sell Your Item
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
