"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BluberryLogoSVG } from "@/components/blueberry-logo-svg"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()

  // Essential links for both mobile and desktop
  const essentialLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/sell-multiple-items", label: "Sell Items" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ]

  return (
    <footer className="bg-background border-t border-border py-6">
      <div className="container mx-auto px-4">
        {/* Logo and Social Links */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <BluberryLogoSVG width={30} height={30} />
            <span className="ml-2 text-lg font-medium">BluBerry</span>
          </div>

          {/* Social Media Icons */}
          <div className="flex gap-4 mb-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#3B82F6] transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#8c52ff] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#3B82F6] transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {essentialLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs text-muted-foreground hover:text-primary transition-colors ${
                pathname === link.href ? "text-primary font-medium" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Legal Links */}
        <div className="flex justify-center gap-4 mb-4">
          <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Terms of Service
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">© {currentYear} BluBerry. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
