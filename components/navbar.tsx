"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, Search, Info, Home, HelpCircle, BookOpen, Star, ShoppingBag, Mail, ArrowRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import SearchModal from "./search"

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, width: 0 })
  const [navDimensions, setNavDimensions] = useState({ left: 0, width: 0 })
  const navRef = useRef<HTMLDivElement>(null)
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())

  // Add scroll event listener to detect when page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    // Add event listener
    window.addEventListener("scroll", handleScroll)

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Calculate nav dimensions on mount and window resize
  useEffect(() => {
    const calculateNavDimensions = () => {
      if (navRef.current) {
        const navRect = navRef.current.getBoundingClientRect()
        setNavDimensions({
          left: navRect.left,
          width: navRect.width,
        })
      }
    }

    calculateNavDimensions()
    window.addEventListener("resize", calculateNavDimensions)

    return () => {
      window.removeEventListener("resize", calculateNavDimensions)
    }
  }, [])

  // Update dropdown position when active link changes
  useEffect(() => {
    if (activeDropdown && linkRefs.current.has(activeDropdown)) {
      const linkElement = linkRefs.current.get(activeDropdown)!
      const navElement = navRef.current

      if (linkElement && navElement) {
        const linkRect = linkElement.getBoundingClientRect()
        const navRect = navElement.getBoundingClientRect()

        setDropdownPosition({
          left: linkRect.left - navRect.left,
          width: linkRect.width,
        })
      }
    }
  }, [activeDropdown])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const navLinks = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="text-blue-500" size={24} />,
      description: "Return to our homepage",
      features: [
        { title: "Latest Updates", description: "See what's new on our platform" },
        { title: "Featured Items", description: "Browse our most popular listings" },
        { title: "Special Offers", description: "Limited-time deals you won't want to miss" },
      ],
    },
    {
      href: "/about",
      label: "About",
      icon: <Info className="text-blue-500" size={24} />,
      description: "Learn about our company",
      features: [
        { title: "Our Story", description: "How we started and where we're going" },
        { title: "Our Team", description: "Meet the people behind BluBerry" },
        { title: "Our Mission", description: "What drives us every day" },
      ],
    },
    {
      href: "/faq",
      label: "FAQ",
      icon: <HelpCircle className="text-blue-500" size={24} />,
      description: "Frequently asked questions",
      features: [
        { title: "Shipping Info", description: "How we handle pickups and deliveries" },
        { title: "Return Policy", description: "Our fair and transparent policies" },
        { title: "Payment Options", description: "Secure ways to get paid" },
      ],
    },
    {
      href: "/how-it-works",
      label: "How It Works",
      icon: <BookOpen className="text-blue-500" size={24} />,
      description: "Our simple 3-step process",
      features: [
        { title: "Submit Your Item", description: "Fill out our easy form with details" },
        { title: "We Pick It Up", description: "Schedule a convenient pickup time" },
        { title: "You Get Paid", description: "Receive payment through your preferred method" },
      ],
    },
    {
      href: "/reviews",
      label: "Reviews",
      icon: <Star className="text-blue-500" size={24} />,
      description: "What our customers say",
      features: [
        { title: "Testimonials", description: "Hear from our satisfied customers" },
        { title: "Success Stories", description: "Real results from real people" },
        { title: "Customer Feedback", description: "How we're constantly improving" },
      ],
    },
    {
      href: "/sell-item",
      label: "Sell Your Item",
      icon: <ShoppingBag className="text-blue-500" size={24} />,
      description: "Start selling today",
      features: [
        { title: "Easy Submission", description: "Our streamlined process takes minutes" },
        { title: "Free Pickup", description: "We come to you at no extra cost" },
        { title: "Fast Payment", description: "Get paid quickly after we receive your item" },
      ],
    },
    {
      href: "/contact",
      label: "Contact",
      icon: <Mail className="text-blue-500" size={24} />,
      description: "Get in touch with us",
      features: [
        { title: "Support Team", description: "Our friendly team is here to help" },
        { title: "Email Us", description: "Send us a message anytime" },
        { title: "Phone Numbers", description: "Call us during business hours" },
      ],
    },
  ]

  // Find the active link data
  const activeLink = activeDropdown ? navLinks.find((link) => link.href === activeDropdown) : null

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
        }`}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center h-12">
            {/* Logo - static link */}
            <a href="/" className="flex items-center">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/BluBerry_Logo_Transparent.png"
                  alt="BluBerry Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            </a>

            {/* Desktop navigation - static links */}
            <div className="hidden md:flex space-x-8 relative" ref={navRef}>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  ref={(el) => {
                    if (el) linkRefs.current.set(link.href, el)
                  }}
                  className={`text-sm hover:text-[#3B82F6] transition-all duration-200 py-1 ${
                    pathname === link.href ? "text-[#3B82F6]" : "text-gray-600"
                  }`}
                  onMouseEnter={() => setActiveDropdown(link.href)}
                >
                  {link.label}
                </a>
              ))}

              {/* Indicator line that moves with hover */}
              {activeDropdown && (
                <div
                  className="absolute h-0.5 bg-blue-500 bottom-0 transition-all duration-300 ease-in-out"
                  style={{
                    left: `${dropdownPosition.left}px`,
                    width: `${dropdownPosition.width}px`,
                  }}
                ></div>
              )}
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
            <div className="md:hidden py-4 flex flex-col gap-6 items-center bg-white">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm hover:text-[#3B82F6] transition-all duration-200 ${
                    pathname === link.href ? "text-[#3B82F6]" : "text-gray-600"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Mega dropdown - spans only the navigation width */}
        {activeDropdown && (
          <div className="relative">
            <div
              className="absolute bg-white border border-gray-200 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out z-50"
              style={{
                left: navDimensions.left,
                width: navDimensions.width,
                opacity: activeDropdown ? 1 : 0,
                transform: activeDropdown ? "translateY(0)" : "translateY(-8px)",
              }}
            >
              <div className="p-6">
                <div className="grid grid-cols-4 gap-8">
                  {/* Left column - Icon and description */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-3 mb-2">
                      {activeLink?.icon}
                      <h3 className="font-medium text-lg text-gray-900">{activeLink?.label}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{activeLink?.description}</p>
                    <a
                      href={activeLink?.href}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Learn more <ArrowRight size={14} className="ml-1" />
                    </a>
                  </div>

                  {/* Right columns - Features */}
                  <div className="col-span-3 grid grid-cols-3 gap-6">
                    {activeLink?.features.map((feature, index) => (
                      <div key={index} className="group">
                        <h4 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
