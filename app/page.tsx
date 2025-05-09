"use client"

import Link from "next/link"

import { ArrowRight, Star, Leaf, Clock, Shield, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import ContentAnimation from "@/components/content-animation"

export default function Home() {
  const router = useRouter()
  const [showInitialLine, setShowInitialLine] = useState(false)

  // Function to navigate to sell item page
  const navigateToSellItem = () => {
    router.push("/sell-item")
  }

  // Effect to show and hide the line on initial load
  useEffect(() => {
    const hideTimer = setTimeout(() => {
      setShowInitialLine(false)
    }, 100)
    return () => clearTimeout(hideTimer)
  }, [])

  return (
    <div className="bg-background">
      {/* Hero Section - White Background */}
      <section className="bg-background pt-6 pb-12 md:pt-8 md:pb-16">
        <div className="container mx-auto px-4">
          {/* Clickable hero content */}
          <ContentAnimation duration={0.3} delay={0} animation="fadeIn">
            <div
              className="flex flex-col items-center text-center cursor-pointer group mb-4"
              onClick={navigateToSellItem}
            >
              <h1 className="text-3xl md:text-4xl font-medium mb-1 drop-shadow-sm pb-1 transition-transform duration-300 group-hover:scale-105 relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                  BluBerry
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent shimmer dark:via-black/70"></span>
              </h1>
              <p className="text-lg md:text-xl text-foreground mb-4 transition-all duration-300 group-hover:text-[#0066ff]">
                Selling made simpler.
              </p>
              <div
                className={`w-full max-w-md h-1 bg-gradient-to-r from-transparent via-[#0066ff] to-transparent rounded-full ${
                  showInitialLine
                    ? "opacity-100 transition-opacity duration-50 animate-line-wipe"
                    : "opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                }`}
              ></div>
            </div>
          </ContentAnimation>

          {/* Buttons section */}
          <ContentAnimation delay={0.1}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/how-it-works"
                className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white px-4 py-1.5 rounded-full font-medium hover:shadow-md hover:translate-y-[-1px] transition-all w-[160px] sm:w-auto text-center text-sm"
              >
                <span className="block sm:hidden">How It Works</span>
                <span className="hidden sm:block">Learn How It Works</span>
              </Link>
              <Link
                href="/sell-item"
                className="inline-block border-2 border-[#6a5acd] text-[#6a5acd] px-4 py-1.5 rounded-full font-medium hover:bg-gradient-to-r hover:from-[#3B82F6] hover:to-[#8c52ff] hover:text-white hover:border-transparent hover:shadow-md hover:translate-y-[-1px] transition-all w-[160px] sm:w-auto text-center text-sm"
              >
                Sell Your Item
              </Link>
            </div>
          </ContentAnimation>
        </div>
      </section>

      {/* Combined How It Works & Why Choose BluBerry Section - Lighter Gray Background */}
      <section className="py-16 bg-gradient-to-b from-secondary to-background relative rounded-t-[30px] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] transform translate-y-[-1px] border-t border-border z-10 mb-8">
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
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                Why Choose BluBerry
              </span>
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

      {/* Combined Testimonials and Environmental Mission Section - Blending into background */}
      <section className="py-16 bg-gradient-to-b from-secondary to-background relative rounded-t-[30px] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.15)] border-t border-border z-20 mb-0">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-light mb-8 text-center tracking-wide">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                What Our Customers Say
              </span>
            </h2>
          </ContentAnimation>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]">
                <div className="flex items-center mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-foreground mb-3 text-xs leading-relaxed">
                  "I sold 5 items in minutes! The pickup was scheduled for the next day and payment was instant. The
                  entire process was seamless."
                </p>
                <div>
                  <p className="font-medium text-xs text-foreground">Sarah T.</p>
                  <p className="text-xs text-muted-foreground">Chicago, IL</p>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]">
                <div className="flex items-center mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-foreground mb-3 text-xs leading-relaxed">
                  "BluBerry made selling my old electronics so easy. No haggling, no meetups with strangers. Just simple
                  and efficient service."
                </p>
                <div>
                  <p className="font-medium text-xs text-foreground">Michael R.</p>
                  <p className="text-xs text-muted-foreground">Boston, MA</p>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]">
                <div className="flex items-center mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-foreground mb-3 text-xs leading-relaxed">
                  "As a senior, I appreciated how easy the whole process was. The team was respectful and professional
                  throughout the entire experience."
                </p>
                <div>
                  <p className="font-medium text-xs text-foreground">Patricia L.</p>
                  <p className="text-xs text-muted-foreground">Denver, CO</p>
                </div>
              </div>
            </ContentAnimation>
          </div>

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

      {/* CTA Section - Completely White with no 3D effects */}
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
                    href="/sell-item"
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
          }
          100% {
            transform: scaleX(1);
            transform-origin: left;
          }
        }
        
        .animate-line-wipe {
          animation: lineWipe 100ms ease-out forwards;
        }

        .content-animation-wrapper {
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  )
}
