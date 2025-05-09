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
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null)
  const [navWidth, setNavWidth] = useState(0)
  const [navLeft, setNavLeft] = useState(0)
  const [dropdownWidth, setDropdownWidth] = useState(0)
  const [homeContactDistance, setHomeContactDistance] = useState(0)

  // Use refs instead of state for positions to avoid re-renders
  const activeIndexRef = useRef<number | null>(null)
  const prevActiveIndexRef = useRef<number | null>(null)
  const isInitialRender = useRef(true)
  const homeRef = useRef<HTMLAnchorElement>(null)
  const contactRef = useRef<HTMLAnchorElement>(null)
  const navContainerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  const navLinks = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="text-blue-500" size={20} />,
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
      icon: <Info className="text-blue-500" size={20} />,
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
      icon: <HelpCircle className="text-blue-500" size={20} />,
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
      icon: <BookOpen className="text-blue-500" size={20} />,
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
      icon: <Star className="text-blue-500" size={20} />,
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
      icon: <ShoppingBag className="text-blue-500" size={20} />,
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
      icon: <Mail className="text-blue-500" size={20} />,
      description: "Get in touch with us",
      features: [
        { title: "Support Team", description: "Our friendly team is here to help" },
        { title: "Email Us", description: "Send us a message anytime" },
        { title: "Phone Numbers", description: "Call us during business hours" },
      ],
    },
  ]

  // Calculate the width between Home and Contact links
  useEffect(() => {
    const calculateNavDimensions = () => {
      if (homeRef.current && contactRef.current && navContainerRef.current) {
        const homeRect = homeRef.current.getBoundingClientRect()
        const contactRect = contactRef.current.getBoundingClientRect()
        const navContainerRect = navContainerRef.current.getBoundingClientRect()

        // Calculate the distance from the left edge of Home to the right edge of Contact
        const totalWidth = contactRect.right - homeRect.left

        // Calculate the distance between Home and Contact
        const distance = contactRect.left - homeRect.right

        // Calculate the left position relative to the container
        const leftPosition = homeRect.left - navContainerRect.left

        // Set the width and left position for the nav container
        setNavWidth(totalWidth)
        setNavLeft(leftPosition)
        setHomeContactDistance(distance)
        setDropdownWidth(distance)
      }
    }

    // Calculate on mount and when window resizes
    calculateNavDimensions()
    window.addEventListener("resize", calculateNavDimensions)

    return () => {
      window.removeEventListener("resize", calculateNavDimensions)
    }
  }, [])

  // Handle hover with delay
  const handleLinkHover = (href: string) => {
    if (href === activeDropdown) return

    const index = navLinks.findIndex((link) => link.href === href)
    const prevIndex = navLinks.findIndex((link) => link.href === activeDropdown)

    if (prevIndex !== -1 && index !== prevIndex) {
      setSlideDirection(index > prevIndex ? "right" : "left")
    } else {
      setSlideDirection(null)
    }

    // Small delay for smoother transitions
    setTimeout(() => {
      setActiveDropdown(href)
    }, 30)
  }

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

  // Handle resize
  useEffect(() => {
    // Skip first render to avoid layout issues
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
  }, [])

  // Handle dropdown hover effects
  useEffect(() => {
    if (!activeDropdown) return

    const index = navLinks.findIndex((link) => link.href === activeDropdown)
    const prevIndex = activeIndexRef.current

    // Determine slide direction
    if (prevIndex !== null && index !== prevIndex) {
      setSlideDirection(index > prevIndex ? "right" : "left")
    } else {
      setSlideDirection(null)
    }

    prevActiveIndexRef.current = activeIndexRef.current
    activeIndexRef.current = index
  }, [activeDropdown, navLinks])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  // Find the active link data
  const activeLink = activeDropdown ? navLinks.find((link) => link.href === activeDropdown) : null

  return (
    <>
      <style jsx global>{`
        @keyframes slideInFromRight {
          0% { transform: translateX(80px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInFromLeft {
          0% { transform: translateX(-80px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        .slide-in-right {
          animation: slideInFromRight 0.65s forwards cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        .slide-in-left {
          animation: slideInFromLeft 0.65s forwards cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        .fade-out {
          animation: fadeOut 0.3s forwards ease-out;
        }
        
        .nav-links-container {
          position: relative;
        }
        
        .dropdown-container {
          position: fixed;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          z-index: 40;
        }
      `}</style>
      <header
        ref={headerRef}
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
            <div className="hidden md:flex space-x-8 relative nav-links-container" ref={navContainerRef}>
              {navLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  ref={link.href === "/" ? homeRef : link.href === "/contact" ? contactRef : null}
                  className={`text-sm hover:text-[#3B82F6] transition-all duration-200 py-1 ${
                    pathname === link.href ? "text-[#3B82F6] font-medium" : "text-gray-600"
                  }`}
                  onMouseEnter={() => handleLinkHover(link.href)}
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
            <div className="md:hidden py-4 flex flex-col gap-6 items-center bg-white">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm hover:text-[#3B82F6] transition-all duration-200 ${
                    pathname === link.href ? "text-[#3B82F6] font-medium" : "text-gray-600"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Mega dropdown - positioned below the navbar */}
      {activeDropdown && (
        <div
          className="dropdown-container"
          style={{
            top: headerRef.current ? headerRef.current.offsetHeight : 48,
          }}
        >
          <div
            className="dropdown-content transition-all duration-300"
            style={{
              // Position the dropdown to be centered between Home and Contact
              position: "absolute",
              width: `${dropdownWidth}px`,
              left: `${homeRef.current ? homeRef.current.getBoundingClientRect().right : 0}px`,
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
            }}
          >
            <div className="p-4 relative overflow-hidden">
              <div
                className={`grid grid-cols-4 gap-4 ${
                  slideDirection === "right" ? "slide-in-right" : slideDirection === "left" ? "slide-in-left" : ""
                }`}
                key={activeDropdown} // Add key to force re-render on dropdown change
              >
                {/* Left column - Icon and description */}
                <div className="col-span-1">
                  <div className="flex items-center gap-2 mb-1">
                    {activeLink?.icon}
                    <h3 className="font-medium text-sm text-gray-900">{activeLink?.label}</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{activeLink?.description}</p>
                  <a
                    href={activeLink?.href}
                    className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    Learn more{" "}
                    <ArrowRight
                      size={12}
                      className="ml-1 transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </a>
                </div>

                {/* Right columns - Features */}
                <div className="col-span-3 grid grid-cols-3 gap-3">
                  {activeLink?.features.map((feature, index) => (
                    <div key={index} className="group transition-all duration-200 hover:translate-y-[-2px]">
                      <h4 className="font-medium text-xs text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors duration-200">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-gray-500">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
