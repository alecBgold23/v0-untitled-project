"use client"

import { usePathname } from "next/navigation"
import { Menu, X, Search } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import SearchModal from "./search"
import { ThemeToggle } from "./theme-toggle"
import { BluberryLogoSVG } from "./blueberry-logo-svg"
import { ThemeDebug } from "./theme-debug"
import Link from "next/link"

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  // Simplified navigation links
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/reviews", label: "Reviews" },
    { href: "/sell-item", label: "Sell Your Item" },
    { href: "/contact", label: "Contact" },
  ]

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background"
        }`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center h-12">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <BluberryLogoSVG />
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm hover:text-primary transition-all duration-200 py-1 ${
                    pathname === link.href ? "text-primary font-medium" : "text-foreground/80"
                  }`}
                  style={{ display: "inline-block", width: "auto" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                className="text-foreground/80 hover:text-primary transition-all duration-200"
                aria-label="Search"
                onClick={toggleSearch}
              >
                <Search size={18} />
              </button>

              {/* Mobile menu button */}
              <button
                className="md:hidden ml-4 text-foreground/80 transition-all duration-200 hover:text-primary"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>

          {/* Mobile navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 flex flex-col gap-6 items-center bg-background">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`text-sm hover:text-primary transition-all duration-200 ${
                    pathname === link.href ? "text-primary font-medium" : "text-foreground/80"
                  }`}
                  style={{ display: "inline-block", width: "auto" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Theme Debug */}
      <ThemeDebug />
    </>
  )
}
