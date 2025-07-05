"use client"

import Link from "next/link"
import {
  ArrowRight,
  Star,
  Leaf,
  Clock,
  Shield,
  CreditCard,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
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
    <div className="bg-background">
      {/* Hero Section - Gradient Background for both mobile and desktop */}
      <section className="bg-gradient-to-b from-background to-secondary pt-6 pb-12 md:pt-8 md:pb-16 min-h-screen md:min-h-0 flex items-center justify-center md:block">
        <div className="container mx-auto px-4">
          {/* Clickable hero content */}
          <ContentAnimation duration={0.3} delay={0} animation="fadeIn">
            <div
              className="flex flex-col items-center text-center cursor-pointer group mb-8"
              onClick={navigateToSellItem}
            >
              <h1 className="text-5xl md:text-4xl font-medium mb-4 md:mb-1 drop-shadow-sm pb-1 transition-all duration-500 ease-out group-hover:scale-105 relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                  BluBerry
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent shimmer dark:via-black/70"></span>
              </h1>
              <p className="text-2xl md:text-xl text-foreground mb-8 md:mb-4 transition-all duration-500 ease-out group-hover:text-[#0066ff]">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-3">
              <Link
                href="/how-it-works"
                className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white px-8 py-3 md:px-4 md:py-1.5 rounded-full font-medium hover:shadow-md hover:translate-y-[-1px] transition-all w-[200px] md:w-[160px] sm:w-auto text-center text-base md:text-sm"
              >
                <span className="block sm:hidden">How It Works</span>
                <span className="hidden sm:block">Learn How It Works</span>
              </Link>
              <Link
                href="/sell-multiple-items"
                className="inline-block border-2 border-[#6a5acd] text-[#6a5acd] px-8 py-3 md:px-4 md:py-1.5 rounded-full font-medium hover:bg-gradient-to-r hover:from-[#3B82F6] hover:to-[#8c52ff] hover:text-white hover:border-transparent hover:shadow-md hover:translate-y-[-1px] transition-all w-[200px] md:w-[160px] sm:w-auto text-center text-base md:text-sm"
              >
                Sell Your Item
              </Link>
            </div>
          </ContentAnimation>
        </div>
      </section>

      {/* Combined How It Works & Why Choose BluBerry Section */}
      <section className="py-16 bg-gradient-to-b from-secondary to-background relative rounded-t-[30px] transform translate-y-[-30px] border-t border-border z-10 mb-8 shadow-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-light mb-8 text-center tracking-wide">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                How BluBerry Works
              </span>
            </h2>
          </ContentAnimation>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-4 relative mb-12">
            {/* Line connecting steps on desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] opacity-20"></div>

            <ContentAnimation delay={0.1}>
              <div className="flex flex-col items-center relative">
                <div className="w-10 h-10 rounded-full bg-card shadow-md flex items-center justify-center mb-4 z-10 border border-[#3B82F6]/20">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                    1
                  </span>
                </div>
                <h3 className="text-lg font-medium mb-2 text-center text-foreground">Submit Your Item</h3>
                <p className="text-muted-foreground text-center text-xs leading-relaxed max-w-xs">
                  Complete our simple form with your item details. No complex listings required.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="flex flex-col items-center relative">
                <div className="w-10 h-10 rounded-full bg-card shadow-md flex items-center justify-center mb-4 z-10 border border-[#3B82F6]/20">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                    2
                  </span>
                </div>
                <h3 className="text-lg font-medium mb-2 text-center text-foreground">We Pick It Up</h3>
                <p className="text-muted-foreground text-center text-xs leading-relaxed max-w-xs">
                  Schedule a convenient time, and our team will collect the item from your location.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="flex flex-col items-center relative">
                <div className="w-10 h-10 rounded-full bg-card shadow-md flex items-center justify-center mb-4 z-10 border border-[#3B82F6]/20">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                    3
                  </span>
                </div>
                <h3 className="text-lg font-medium mb-2 text-center text-foreground">Get Paid Instantly</h3>
                <p className="text-muted-foreground text-center text-xs leading-relaxed max-w-xs">
                  Receive your payment immediately upon pickup. No waiting, no complications.
                </p>
              </div>
            </ContentAnimation>
          </div>

          {/* Why Choose BluBerry */}
          <ContentAnimation delay={0.4}>
            <h3 className="text-xl font-medium mb-6 text-center">
              <span className="text-foreground font-medium">Why Choose BluBerry</span>
            </h3>
            <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto text-xs">
              The simplest way to sell your used items with a professional service
            </p>
          </ContentAnimation>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ContentAnimation delay={0.5}>
              <div className="p-4 rounded-lg bg-card hover:bg-secondary transition-all duration-300 group shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mb-3 group-hover:bg-[#3B82F6]/20 transition-all duration-300">
                  <Clock className="h-4 w-4 text-[#3B82F6]" />
                </div>
                <h3 className="text-base font-medium mb-1 text-foreground">Simplified Process</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Our streamlined form takes minutes to complete, eliminating the need for detailed descriptions.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.6}>
              <div className="p-4 rounded-lg bg-card hover:bg-secondary transition-all duration-300 group shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#8c52ff]/10 flex items-center justify-center mb-3 group-hover:bg-[#8c52ff]/20 transition-all duration-300">
                  <Shield className="h-4 w-4 text-[#8c52ff]" />
                </div>
                <h3 className="text-base font-medium mb-1 text-foreground">Professional Service</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Our vetted team handles pickup, ensuring security and peace of mind throughout the process.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.7}>
              <div className="p-4 rounded-lg bg-card hover:bg-secondary transition-all duration-300 group shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mb-3 group-hover:bg-[#3B82F6]/20 transition-all duration-300">
                  <CreditCard className="h-4 w-4 text-[#3B82F6]" />
                </div>
                <h3 className="text-base font-medium mb-1 text-foreground">Market-Based Pricing</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  We offer competitive rates based on current market value and item condition.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.8}>
              <div className="p-4 rounded-lg bg-card hover:bg-secondary transition-all duration-300 group shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#8c52ff]/10 flex items-center justify-center mb-3 group-hover:bg-[#8c52ff]/20 transition-all duration-300">
                  <Leaf className="h-4 w-4 text-[#8c52ff]" />
                </div>
                <h3 className="text-base font-medium mb-1 text-foreground">Immediate Payment</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Receive payment at the time of pickup, eliminating waiting periods for transactions.
                </p>
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
              <span className="font-medium">We do everything.</span> You do nothing.
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
                    <p className="text-xs ml-2 text-foreground">Item Evaluation</p>
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
                    <p className="text-xs ml-2 text-foreground">Photography</p>
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
                    <p className="text-xs ml-2 text-foreground">Descriptions</p>
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
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-xl shadow-md border border-border h-full">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-400/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6 text-red-400"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium ml-3 text-foreground">
                    <span className="text-red-400">You Do Nothing</span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
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
                    <p className="text-xs ml-2 text-foreground">No Research</p>
                  </div>

                  <div className="flex items-center">
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
                    <p className="text-xs ml-2 text-foreground">No Photography</p>
                  </div>

                  <div className="flex items-center">
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
                    <p className="text-xs ml-2 text-foreground">No Descriptions</p>
                  </div>

                  <div className="flex items-center">
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
                    <p className="text-xs ml-2 text-foreground">No Listings</p>
                  </div>

                  <div className="flex items-center">
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
                    <p className="text-xs ml-2 text-foreground">No Buyer Contact</p>
                  </div>

                  <div className="flex items-center">
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
                    <p className="text-xs ml-2 text-foreground">No Shipping</p>
                  </div>

                  <div className="flex items-center">
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
                    <p className="text-xs ml-2 text-foreground">No Payment Hassles</p>
                  </div>

                  <div className="flex items-center">
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
                    <p className="text-xs ml-2 text-foreground">No Customer Service</p>
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>

          {/* Simple 3-Step Process */}
          <ContentAnimation delay={0.3}>
            <div className="bg-card p-6 rounded-xl shadow-md border border-border">
              <h3 className="text-lg font-medium mb-6 text-center text-foreground">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                  Your Simple 3-Step Journey
                </span>
              </h3>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center w-full md:w-1/3 relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="text-sm font-medium mt-2 text-foreground">Submit Form</h4>
                  <p className="text-xs text-muted-foreground">Takes 2 minutes</p>

                  {/* Arrow for desktop */}
                  <div className="hidden md:block absolute top-6 right-0 w-1/3 h-0.5 bg-gradient-to-r from-[#3B82F6] to-transparent"></div>
                </div>

                <div className="text-center w-full md:w-1/3 relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="text-sm font-medium mt-2 text-foreground">We Pick Up</h4>
                  <p className="text-xs text-muted-foreground">At your convenience</p>

                  {/* Arrow for desktop */}
                  <div className="hidden md:block absolute top-6 right-0 w-1/3 h-0.5 bg-gradient-to-r from-[#3B82F6] to-transparent"></div>
                </div>

                <div className="text-center w-full md:w-1/3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="text-sm font-medium mt-2 text-foreground">Get Paid</h4>
                  <p className="text-xs text-muted-foreground">Immediately on pickup</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/sell-multiple-items"
                  className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white px-6 py-2 rounded-full font-medium hover:shadow-md hover:translate-y-[-1px] transition-all text-sm"
                >
                  Start Selling Now
                </Link>
              </div>
            </div>
          </ContentAnimation>
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
              <a
                href="mailto:alecgold808@gmail.com"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card hover:bg-secondary transition-all duration-300 w-24 h-24 justify-center"
                aria-label="Email"
              >
                <Mail className="h-8 w-8 text-[#8c52ff]" />
                <span className="text-xs text-muted-foreground">Email</span>
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
