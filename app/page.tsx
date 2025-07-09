"use client"

import Link from "next/link"
import {
  ArrowRight,
  Star,
  Leaf,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Package,
  Truck,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import ContentAnimation from "@/components/content-animation"
import { useIsMobile } from "@/hooks/use-mobile"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Home() {
  const router = useRouter()
  const [showInitialLine, setShowInitialLine] = useState(true)
  const isMobile = useIsMobile()
  const [scrollY, setScrollY] = useState(0)

  // Function to navigate to sell item page with smooth transition
  const navigateToSellItem = () => {
    // Add a subtle animation before navigation
    document.body.style.opacity = "0.9"
    document.body.style.transition = "opacity 0.3s ease"

    setTimeout(() => {
      router.push("/sell-multiple-items")
    }, 200)
  }

  // Effect to show and hide the line on initial load
  useEffect(() => {
    const hideTimer = setTimeout(() => {
      setShowInitialLine(false)
    }, 100)
    return () => clearTimeout(hideTimer)
  }, [])

  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Add this useEffect after the existing useEffect
  useEffect(() => {
    // Reset body opacity when component mounts
    document.body.style.opacity = "1"
    document.body.style.transition = "opacity 0.5s ease"

    return () => {
      // Clean up
      document.body.style.transition = ""
    }
  }, [])

  return (
    <div className="bg-background relative overflow-hidden">
      {/* Background shimmer overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-shimmer-gradient animate-shimmer-bg opacity-30"></div>
      </div>

      {/* Hero Section - Gradient Background for both mobile and desktop */}
      <section className="bg-gradient-to-b from-background to-secondary pt-1 pb-12 md:pt-8 md:pb-16 min-h-screen md:min-h-0 flex items-start justify-center md:items-center md:block relative z-10">
        <div className="container mx-auto px-4">
          {/* Clickable hero content */}
          <ContentAnimation duration={0.3} delay={0} animation="fadeIn">
            <div
              className="flex flex-col items-center text-center cursor-pointer group mb-6 md:mb-8 mt-16 md:mt-0"
              onClick={navigateToSellItem}
            >
              <h1 className="text-6xl md:text-4xl font-medium mb-6 md:mb-1 drop-shadow-sm pb-1 transition-all duration-500 ease-out group-hover:scale-105 relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                  BluBerry
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent shimmer dark:via-black/70"></span>
              </h1>
              <p className="text-3xl md:text-xl text-foreground mb-10 md:mb-4 transition-all duration-500 ease-out group-hover:text-[#0066ff]">
                Selling made simpler.
              </p>
              <div
                className={`w-full max-w-md h-1 bg-gradient-to-r from-transparent via-[#0066ff] to-transparent rounded-full ${
                  showInitialLine
                    ? "opacity-100 animate-line-wipe"
                    : "opacity-0 transition-all duration-500 ease-out group-hover:opacity-100"
                }`}
              ></div>
            </div>
          </ContentAnimation>

          {/* Buttons section */}
          <ContentAnimation delay={0.1}>
            <div className="flex flex-row sm:flex-row items-center justify-center gap-2 md:gap-3">
              <Link
                href="/how-it-works"
                className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white px-12 py-[0.3125rem] md:px-8 md:py-1.5 rounded-full font-medium hover:shadow-md hover:translate-y-[-1px] transition-all text-center text-xs md:text-sm"
              >
                <span className="block sm:hidden">How It Works</span>
                <span className="hidden sm:block">Learn How It Works</span>
              </Link>
              <Link
                href="/sell-multiple-items"
                className="inline-block border-2 border-[#6a5acd] text-[#6a5acd] px-12 py-[0.3125rem] md:px-8 md:py-1.5 rounded-full font-medium hover:bg-gradient-to-r hover:from-[#3B82F6] hover:to-[#8c52ff] hover:text-white hover:border-transparent hover:shadow-md hover:translate-y-[-1px] transition-all text-center text-xs md:text-sm"
              >
                Sell Your Item
              </Link>
            </div>
          </ContentAnimation>

          {/* Professional Statement - Mobile Visual Element */}
          <ContentAnimation delay={0.2}>
            <div className="mt-12 md:hidden">
              <div className="flex flex-col items-center space-y-6">
                <div className="text-center max-w-sm">
                  <p className="text-lg font-light text-foreground mb-2">Your selling partner</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We're building a service to help you sell your items with less hassle and more convenience
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                      Simple
                    </div>
                    <div className="text-xs text-muted-foreground">Process</div>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#8c52ff] to-[#3B82F6]">
                      Fair
                    </div>
                    <div className="text-xs text-muted-foreground">Pricing</div>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                      Easy
                    </div>
                    <div className="text-xs text-muted-foreground">Experience</div>
                  </div>
                </div>
              </div>
            </div>
          </ContentAnimation>
        </div>
      </section>

      {/* Why Choose BluBerry Section */}
      <section className="py-8 bg-gradient-to-b from-secondary to-background relative rounded-t-[30px] transform translate-y-[-30px] border-t border-border z-10 mb-4 shadow-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-light mb-8 text-center tracking-wide">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                Why Choose BluBerry
              </span>
            </h2>
          </ContentAnimation>

          {/* The Service That Didn't Exist - Now at the top */}
          <ContentAnimation delay={0.1}>
            <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#8c52ff]/10 p-8 rounded-2xl border border-[#3B82F6]/20 mb-12">
              <h3 className="text-2xl font-bold mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                  The Service That Didn't Exist... Until Now
                </span>
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/50 dark:bg-black/20 p-6 rounded-xl">
                  <Package className="h-12 w-12 mx-auto mb-4 text-[#3B82F6]" />
                  <p className="text-lg font-semibold text-foreground mb-2">Fill Out a Form</p>
                  <p className="text-sm text-muted-foreground">
                    Simple online form - just describe your items and upload photos
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-black/20 p-6 rounded-xl">
                  <Truck className="h-12 w-12 mx-auto mb-4 text-[#8c52ff]" />
                  <p className="text-lg font-semibold text-foreground mb-2">We Come To You</p>
                  <p className="text-sm text-muted-foreground">
                    Professional pickup at your door - no other platform does this
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-black/20 p-6 rounded-xl">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-[#3B82F6]" />
                  <p className="text-lg font-semibold text-foreground mb-2">Instant Cash</p>
                  <p className="text-sm text-muted-foreground">Get paid immediately when we collect your items</p>
                </div>
              </div>
            </div>
          </ContentAnimation>

          {/* Simple Before/After Comparison */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Before BluBerry */}
            <ContentAnimation delay={0.2}>
              <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border-2 border-red-200 dark:border-red-800">
                <div className="text-center mb-6">
                  <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                  <h3 className="text-2xl font-light tracking-wide text-red-600 dark:text-red-400">Before BluBerry</h3>
                  <p className="text-lg text-red-500 dark:text-red-300">The Old Way Was Hard</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <XCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                    <span
                      className="text-lg font-medium tracking-tight"
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      Hours per item to sell
                    </span>
                  </div>
                  <div className="flex items-center">
                    <XCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                    <span
                      className="text-lg font-medium tracking-tight"
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      Multiple websites needed
                    </span>
                  </div>
                  <div className="flex items-center">
                    <XCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                    <span
                      className="text-lg font-medium tracking-tight"
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      Dealing with strangers
                    </span>
                  </div>
                  <div className="flex items-center">
                    <XCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                    <span
                      className="text-lg font-medium tracking-tight"
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      Waiting weeks for payment
                    </span>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            {/* After BluBerry */}
            <ContentAnimation delay={0.3}>
              <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-2xl border-2 border-green-200 dark:border-green-800">
                <div className="text-center mb-6">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-2xl font-light tracking-wide text-green-600 dark:text-green-400">
                    With BluBerry
                  </h3>
                  <p className="text-lg text-green-500 dark:text-green-300">Selling Made Simple</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span
                      className="text-lg font-medium tracking-tight"
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      2-3 minutes per item
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span
                      className="text-lg font-medium tracking-tight"
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      One platform for everything
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span
                      className="text-lg font-medium tracking-tight"
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      Professional pickup team
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span
                      className="text-lg font-medium tracking-tight"
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      Get paid instantly
                    </span>
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Combined Testimonials and Environmental Mission Section */}
      <section className="py-16 bg-gradient-to-b from-secondary to-background relative rounded-t-[30px] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.15)] border-t border-border z-20 mb-0">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-light mb-4 text-center tracking-wide">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                What Our Customers Say
              </span>
            </h2>
          </ContentAnimation>

          {/* Placeholder Testimonials */}
          <Accordion type="single" collapsible className="w-full">
            <ContentAnimation delay={0.1}>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-gray-300" />
                      ))}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]">
                    <p className="text-muted-foreground mb-3 text-xs leading-relaxed italic">
                      "Reviews coming soon..."
                    </p>
                    <div>
                      <p className="font-medium text-xs text-muted-foreground">Your Name</p>
                      <p className="text-xs text-muted-foreground/70">Your Location</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <div className="flex items-center mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-gray-300" />
                      ))}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]">
                    <p className="text-muted-foreground mb-3 text-xs leading-relaxed italic">
                      "Be the first to leave a review..."
                    </p>
                    <div>
                      <p className="font-medium text-xs text-muted-foreground">Future Customer</p>
                      <p className="text-xs text-muted-foreground/70">Your City</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  <div className="flex items-center mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-gray-300" />
                      ))}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]">
                    <p className="text-muted-foreground mb-3 text-xs leading-relaxed italic">
                      "Share your experience with BluBerry..."
                    </p>
                    <div>
                      <p className="font-medium text-xs text-muted-foreground">Valued Customer</p>
                      <p className="text-xs text-muted-foreground/70">Anywhere, USA</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </ContentAnimation>
          </Accordion>

          {/* Environmental Mission */}
          <div className="bg-card p-6 rounded-lg shadow-md">
            <ContentAnimation delay={0.4}>
              <h3 className="text-xl font-medium mb-3 tracking-wide text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                  Reducing Waste,
                </span>{" "}
                <span className="text-foreground">Creating Value</span>
              </h3>
              <p className="text-foreground mb-3 text-xs leading-relaxed text-center max-w-2xl mx-auto">
                At BluBerry, we're committed to extending the lifecycle of quality items. By facilitating the resale of
                used goods, we help reduce waste and environmental impact.
              </p>
              <p className="text-foreground text-xs leading-relaxed text-center max-w-2xl mx-auto">
                Every item we help sell is one less item in a landfill and one more opportunity to create value for both
                sellers and future owners.
              </p>

              <div className="mt-4 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3 shadow-sm">
                  <Leaf className="h-4 w-4 text-[#3B82F6]" />
                </div>
                <p className="text-xs text-muted-foreground italic">
                  "Our mission is to create a more sustainable future through thoughtful commerce."
                </p>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Our Resale Process Section */}
      <section className="py-16 bg-gradient-to-b from-secondary to-background relative rounded-t-[30px] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.15)] border-t border-border z-20 mb-0">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-light mb-4 text-center tracking-wide">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                Our Resale Process
              </span>
            </h2>
            <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto text-sm">
              <span className="font-medium">You submit once.</span> We handle the rest.
            </p>
          </ContentAnimation>

          {/* Visual Process Comparison */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-6 rounded-xl shadow-md border border-border h-full">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6 text-white"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium ml-3 text-foreground">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                      BluBerry Handles
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-[#3B82F6]"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground">Professional Evaluation</p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-[#3B82F6]"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground">Price Optimization</p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-[#3B82F6]"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground">Marketplace Listings</p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-[#3B82F6]"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground">Buyer Communication</p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-[#3B82F6]"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground">Shipping & Delivery</p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-[#3B82F6]"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground">Payment Processing</p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-[#3B82F6]"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground">Customer Service</p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-[#3B82F6]"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground">Returns & Refunds</p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-xl shadow-md border border-border h-full">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#3B82F6]/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6 text-[#3B82F6]"
                    >
                      <path d="M9 12l2 2 4-4"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium ml-3 text-foreground">
                    <span className="text-[#3B82F6]">What You Do</span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-[#3B82F6]"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground">Submit Form</p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-[#3B82F6]"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground">Add Photos</p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-[#3B82F6]"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground">Write Description</p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-[#3B82F6]"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground">Schedule Pickup</p>
                  </div>

                  <div className="flex items-center col-span-2 justify-center mt-4">
                    <div className="w-6 h-6 rounded-full bg-red-400/20 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-red-400"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </div>
                    <p className="text-xs ml-2 text-foreground font-medium">Everything Else</p>
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Social Links Section */}
      <section className="py-12 bg-gradient-to-b from-secondary to-background relative rounded-t-[30px] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.15)] border-t border-border z-20 mb-0">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-xl md:text-2xl font-light mb-6 text-center tracking-wide">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                Connect With Us
              </span>
            </h2>
            <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto text-sm">
              Follow BluBerry on social media for updates, tips, and success stories
            </p>
          </ContentAnimation>

          <div className="text-center mb-6">
            <p className="text-xs text-muted-foreground/70 italic bg-card px-4 py-2 rounded-full inline-block border border-border">
              Social media accounts coming soon!
            </p>
          </div>

          <ContentAnimation delay={0.1}>
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card hover:bg-secondary transition-all duration-300 w-24 h-24 justify-center"
                aria-label="Facebook"
              >
                <Facebook className="h-8 w-8 text-[#3B82F6]" />
                <span className="text-xs text-muted-foreground">Facebook</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card hover:bg-secondary transition-all duration-300 w-24 h-24 justify-center"
                aria-label="Instagram"
              >
                <Instagram className="h-8 w-8 text-[#8c52ff]" />
                <span className="text-xs text-muted-foreground">Instagram</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card hover:bg-secondary transition-all duration-300 w-24 h-24 justify-center"
                aria-label="Twitter"
              >
                <Twitter className="h-8 w-8 text-[#3B82F6]" />
                <span className="text-xs text-muted-foreground">Twitter</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card hover:bg-secondary transition-all duration-300 w-24 h-24 justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-8 w-8 text-[#3B82F6]" />
                <span className="text-xs text-muted-foreground">LinkedIn</span>
              </a>
            </div>
          </ContentAnimation>

          <ContentAnimation delay={0.2}>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Have questions? We're here to help!</p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-block px-4 py-2 rounded-full border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white transition-all text-xs font-medium"
                >
                  Contact Us
                </Link>
                <Link
                  href="/faq"
                  className="inline-block px-4 py-2 rounded-full border border-[#8c52ff] text-[#8c52ff] hover:bg-[#8c52ff] hover:text-white transition-all text-xs font-medium"
                >
                  FAQ
                </Link>
              </div>
            </div>
          </ContentAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-background relative z-30">
        <div className="container mx-auto px-4 max-w-3xl pb-8">
          <ContentAnimation>
            <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] border border-border">
              <h2 className="text-2xl md:text-3xl font-light mb-2 tracking-wide text-center">
                <span className="text-foreground font-medium">Ready to Sell?</span>
              </h2>
              <p className="text-muted-foreground mb-4 max-w-xl mx-auto text-xs text-center">
                Start the simple process today and turn your used items into cash with our professional service.
              </p>
              <div className="flex justify-center">
                <div className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] p-[2px] rounded-lg">
                  <Link
                    href="/sell-multiple-items"
                    className="inline-flex items-center bg-card hover:bg-secondary transition-colors px-4 py-2 rounded-lg font-medium text-foreground group text-sm"
                  >
                    Sell Your Item Now
                    <ArrowRight className="ml-2 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </ContentAnimation>
        </div>
      </section>

      <style jsx global>{`
       @keyframes shimmer {
         0% {
           transform: translateX(-100%);
           opacity: 0;
         }
         10% {
           opacity: 0.5;
         }
         50% {
           opacity: 0.8;
         }
         90% {
           opacity: 0.5;
         }
         100% {
           transform: translateX(100%);
           opacity: 0;
         }
       }
       
       .shimmer {
         animation: shimmer 2.5s infinite;
       }

       @keyframes shimmer-bg {
         0% {
           background-position: -200% 0;
         }
         100% {
           background-position: 200% 0;
         }
       }

       .bg-shimmer-gradient {
         background: linear-gradient(
           90deg,
           transparent 0%,
           rgba(59, 130, 246, 0.03) 25%,
           rgba(140, 82, 255, 0.03) 50%,
           rgba(59, 130, 246, 0.03) 75%,
           transparent 100%
         );
         background-size: 200% 100%;
       }

       .animate-shimmer-bg {
         animation: shimmer-bg 8s ease-in-out infinite;
       }

       @keyframes lineWipe {
         0% {
           transform: scaleX(0);
           transform-origin: left;
           opacity: 0.7;
         }
         100% {
           transform: scaleX(1);
           transform-origin: left;
           opacity: 1;
         }
       }
       
       .animate-line-wipe {
         animation: lineWipe 800ms cubic-bezier(0.25, 0.1, 0.25, 1.0) forwards;
       }

       .content-animation-wrapper {
         will-change: transform, opacity;
       }
       
       .shadow-section {
         box-shadow: 
           0 -20px 25px -5px rgba(0, 0, 0, 0.1),
           0 -10px 10px -5px rgba(0, 0, 0, 0.05);
         transition: box-shadow 0.5s ease-out;
       }

       /* Add smooth transitions for all interactive elements */
       a, button, .cursor-pointer {
         transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0) !important;
       }

       /* Smooth page transitions */
       .page-transition-wrapper {
         transition: opacity 0.3s ease-out;
       }
     `}</style>
    </div>
  )
}
