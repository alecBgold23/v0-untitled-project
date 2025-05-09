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

  // Use refs instead of state for positions to avoid re-renders
  const activeIndexRef = useRef<number | null>(null)
  const prevActiveIndexRef = useRef<number | null>(null)

  const navRef = useRef<HTMLDivElement>(null)
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())
  const contentRef = useRef<HTMLDivElement>(null)
  const isInitialRender = useRef(true)

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

    // Add resize listener
    const handleResize = () => {
      // Only need to handle resize for dropdown positioning
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
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

  // Calculate dropdown position - centered between navbar links
  const getDropdownPosition = () => {
    if (!navRef.current) return { left: 0, width: 0 }

    const navRect = navRef.current.getBoundingClientRect()
    const containerRect = document.querySelector(".container")?.getBoundingClientRect() || { left: 0 }

    // Fixed width for the dropdown
    const dropdownWidth = 600 // Set a fixed width for the dropdown

    // Calculate center position
    const navCenter = navRect.left + navRect.width / 2
    const dropdownLeft = navCenter - dropdownWidth / 2

    // Adjust for container position
    const adjustedLeft = dropdownLeft - containerRect.left

    return {
      left: adjustedLeft,
      width: dropdownWidth,
    }
  }

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
      `}</style>
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

        {/* Mega dropdown - centered between navbar links */}
        {activeDropdown && (
          <div className="relative">
            <div
              className="absolute bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 transition-all duration-300"
              style={{
                left: getDropdownPosition().left,
                width: getDropdownPosition().width,
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div className="p-6 relative overflow-hidden" ref={contentRef}>
                <div
                  className={`grid grid-cols-4 gap-8 ${
                    slideDirection === "right" ? "slide-in-right" : slideDirection === "left" ? "slide-in-left" : ""
                  }`}
                  key={activeDropdown} // Add key to force re-render on dropdown change
                >
                  {/* Left column - Icon and description */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-3 mb-2">
                      {activeLink?.icon}
                      <h3 className="font-medium text-lg text-gray-900">{activeLink?.label}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{activeLink?.description}</p>
                    <a
                      href={activeLink?.href}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      Learn more{" "}
                      <ArrowRight
                        size={14}
                        className="ml-1 transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </a>
                  </div>

                  {/* Right columns - Features */}
                  <div className="col-span-3 grid grid-cols-3 gap-6">
                    {activeLink?.features.map((feature, index) => (
                      <div key={index} className="group transition-all duration-200 hover:translate-y-[-2px]">
                        <h4 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
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
