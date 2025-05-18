"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BluberryLogoSVG } from "./blueberry-logo-svg"

export default function Footer() {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()

  // Reduced navigation links for mobile
  const essentialLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/sell-item", label: "Sell Your Item" },
    { href: "/contact", label: "Contact" },
  ]

  // Full navigation links for desktop
  const allLinks = [
    ...essentialLinks,
    { href: "/faq", label: "FAQ" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/reviews", label: "Reviews" },
  ]

  return (
    <footer className="bg-background border-t border-border py-6">
      <div className="container mx-auto px-4 text-center">
        {/* Mobile Footer */}
        <div className="md:hidden">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-center justify-center">
              <BluberryLogoSVG width={30} height={30} />
              <span className="ml-2 text-lg font-medium">BluBerry</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-4">
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

            <div className="flex gap-3 text-xs text-muted-foreground">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Footer */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info Column */}
            <div className="flex flex-col items-center md:items-start">
              <div className="mb-4 flex items-center justify-center">
                <BluberryLogoSVG width={30} height={30} />
                <span className="ml-2 text-lg font-medium">BluBerry</span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">(847) 510-3229</p>
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
                {allLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm text-muted-foreground hover:text-primary transition-colors ${
                      pathname === link.href ? "text-primary font-medium" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal Column */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-sm font-semibold mb-4">Legal</h3>
              <Link
                href="/privacy-policy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
              >
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-4 md:mt-8 pt-4 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground">© {currentYear} BluBerry. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
