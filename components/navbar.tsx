"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, SearchIcon, Settings } from "lucide-react"
import { BluberryLogoSVG } from "@/components/blueberry-logo-svg"
import SearchModal from "@/components/search"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
// import { ThemeToggle } from "@/components/theme-toggle"

// Navigation items
const mainNavItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
  { href: "/sell-multiple-items", label: "Sell Your Item" },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-4 w-4" />,
  },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const { user, logout } = useAuth()

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

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-sm shadow-sm border-b border-border" : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <BluberryLogoSVG />
            </Link>
          </div>

          {/* Desktop navigation - centered in the middle */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm rounded-md transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary font-medium" : "text-foreground/80"
                }`}
              >
                {item.label || item.name}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {/* Search button */}
            <button
              className="p-2 text-foreground/80 transition-all duration-200 hover:text-primary hover:bg-accent rounded-md"
              onClick={toggleSearch}
              aria-label="Search"
            >
              <SearchIcon size={18} />
            </button>

            {/* Theme toggle */}
            {/* <ThemeToggle /> */}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>Sign out</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Tools</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/tools/item-identifier">Item Identifier</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tools/description-generator">Description Generator</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-foreground/80 transition-all duration-200 hover:text-primary hover:bg-accent rounded-md"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 flex flex-col gap-3 items-center bg-background border-t border-border">
            {/* Theme toggle for mobile */}
            {/* <div className="flex items-center justify-center py-2">
              <ThemeToggle />
            </div> */}
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted text-center w-full ${
                  pathname === item.href ? "text-primary font-medium" : "text-foreground/80"
                }`}
              >
                {item.label || item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}
