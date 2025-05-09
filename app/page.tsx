"use client"

import Link from "next/link"
import Image from "next/image"
import { AlertTriangle, ArrowRight, Star, Leaf, Clock, Shield, CreditCard } from "lucide-react"
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
    // Show the line immediately
    setShowInitialLine(true)

    // Hide the line after just 200ms
    const hideTimer = setTimeout(() => {
      setShowInitialLine(false)
    }, 200) // 0ms delay + 200ms visibility = 200ms total

    // Clean up timer
    return () => {
      clearTimeout(hideTimer)
    }
  }, [])

  return (
    <div>
      {/* Announcement Bar - Sleek warning style */}
      <ContentAnimation>
        <div className="bg-gradient-to-r from-gray-900 to-red-900 py-3 px-4 text-center flex items-center justify-center shadow-md">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <span className="text-red-500 text-sm">
            Unfortunately, all services are currently unavailable. We'll notify you once they're back up and running.
          </span>
        </div>
      </ContentAnimation>

      {/* Hero Section - KEEPING EXACTLY THE SAME */}
      <section className="bg-white pt-10 pb-24 md:pt-12 md:pb-32">
        <div className="container mx-auto px-4">
          {/* Clickable hero content */}
          <ContentAnimation>
            <div
              className="flex flex-col items-center text-center cursor-pointer group mb-8"
              onClick={navigateToSellItem}
            >
              <h1 className="text-4xl md:text-5xl font-medium mb-2 drop-shadow-sm pb-1 transition-transform duration-300 group-hover:scale-105 relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                  BluBerry
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent shimmer"></span>
              </h1>
              <p className="text-xl md:text-2xl text-black mb-8 transition-all duration-300 group-hover:text-[#0066ff]">
                Selling made simpler.
              </p>
              <div
                className={`w-full max-w-md h-1 bg-gradient-to-r from-transparent via-[#0066ff] to-transparent rounded-full ${
                  showInitialLine
                    ? "opacity-100 transition-opacity duration-50"
                    : "opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                }`}
              ></div>
            </div>
          </ContentAnimation>

          {/* Separate buttons section */}
          <ContentAnimation delay={0.1}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/how-it-works"
                className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white px-5 py-2 rounded-full font-medium hover:shadow-md hover:translate-y-[-1px] transition-all w-[180px] sm:w-auto text-center"
              >
                <span className="block sm:hidden">How It Works</span>
                <span className="hidden sm:block">Learn How It Works</span>
              </Link>
              <Link
                href="/sell-item"
                className="inline-block border-2 border-[#6a5acd] text-[#6a5acd] px-5 py-2 rounded-full font-medium hover:bg-gradient-to-r hover:from-[#3B82F6] hover:to-[#8c52ff] hover:text-white hover:border-transparent hover:shadow-md hover:translate-y-[-1px] transition-all w-[180px] sm:w-auto text-center"
              >
                Sell Your Item
              </Link>
            </div>
          </ContentAnimation>
        </div>
      </section>

      {/* How It Works Section - REDESIGNED with 3D shadow effect */}
      <section className="py-32 bg-gradient-to-b from-gray-100 to-white relative rounded-t-[40px] shadow-[0_-15px_30px_-10px_rgba(0,0,0,0.1)] transform translate-y-[-1px] border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <ContentAnimation>
            <h2 className="text-3xl md:text-4xl font-light mb-16 text-center tracking-wide">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                How It Works
              </span>
            </h2>
          </ContentAnimation>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Line connecting steps on desktop */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] opacity-20"></div>

            <ContentAnimation delay={0.1}>
              <div className="flex flex-col items-center relative">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-8 z-10 border border-[#3B82F6]/20">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                    1
                  </span>
                </div>
                <h3 className="text-xl font-medium mb-3 text-center">Submit Your Item</h3>
                <p className="text-gray-500 text-center mb-6 text-sm leading-relaxed max-w-xs">
                  Complete our simple form with your item details. No complex listings required.
                </p>
                {/* Custom sized container that fits the image without white space */}
                <div className="w-full mb-8">
                  <div className="mx-auto" style={{ maxWidth: "450px" }}>
                    <img
                      src="https://q95jzuzo3cbj9etg.public.blob.vercel-storage.com/Untitled%20design-Sr5GOVnTsq2SswwH7Nr8MBJ5UGBe9f.jpg"
                      alt="Submit your item illustration"
                      style={{
                        width: "100%",
                        borderRadius: "12px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        display: "block",
                      }}
                      className="hover:shadow-lg transition-shadow duration-300"
                    />
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="flex flex-col items-center relative">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-8 z-10 border border-[#3B82F6]/20">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                    2
                  </span>
                </div>
                <h3 className="text-xl font-medium mb-3 text-center">We Pick It Up</h3>
                <p className="text-gray-500 text-center mb-6 text-sm leading-relaxed max-w-xs">
                  Schedule a convenient time, and our team will collect the item from your location.
                </p>
                {/* Custom sized container that fits the image without white space - same as first image */}
                <div className="w-full mb-8">
                  <div className="mx-auto" style={{ maxWidth: "450px" }}>
                    <img
                      src="https://q95jzuzo3cbj9etg.public.blob.vercel-storage.com/Untitled%20design-2-napdpIpt1LFqQJo7QvEbdtFWPfSGK6.jpg"
                      alt="We pick it up illustration"
                      style={{
                        width: "100%",
                        borderRadius: "12px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        display: "block",
                      }}
                      className="hover:shadow-lg transition-shadow duration-300"
                    />
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="flex flex-col items-center relative">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-8 z-10 border border-[#3B82F6]/20">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                    3
                  </span>
                </div>
                <h3 className="text-xl font-medium mb-3 text-center">Get Paid Instantly</h3>
                <p className="text-gray-500 text-center mb-6 text-sm leading-relaxed max-w-xs">
                  Receive your payment immediately upon pickup. No waiting, no complications.
                </p>
                {/* Custom sized container that fits the image without white space - same as other images */}
                <div className="w-full mb-8">
                  <div className="mx-auto" style={{ maxWidth: "450px" }}>
                    <img
                      src="https://q95jzuzo3cbj9etg.public.blob.vercel-storage.com/blob-2025-05-08%20at%208.43.21%20AM-Pt446d8azjRWhoq9FgtU43Hu3rCxBV.jpg"
                      alt="Get paid instantly illustration"
                      style={{
                        width: "100%",
                        borderRadius: "12px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        display: "block",
                      }}
                      className="hover:shadow-lg transition-shadow duration-300"
                    />
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Features Section - REDESIGNED */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <ContentAnimation>
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-center tracking-wide">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                Why Choose BluBerry
              </span>
            </h2>
            <p className="text-gray-500 mb-20 text-center max-w-2xl mx-auto text-sm">
              The simplest way to sell your unused items with a professional service
            </p>
          </ContentAnimation>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ContentAnimation delay={0.1}>
              <div className="p-6 rounded-lg hover:bg-gray-50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mb-4 group-hover:bg-[#3B82F6]/20 transition-all duration-300">
                  <Clock className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900">Simplified Process</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Our streamlined form takes minutes to complete, eliminating the need for detailed descriptions.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="p-6 rounded-lg hover:bg-gray-50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-[#8c52ff]/10 flex items-center justify-center mb-4 group-hover:bg-[#8c52ff]/20 transition-all duration-300">
                  <Shield className="h-5 w-5 text-[#8c52ff]" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900">Professional Service</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Our vetted team handles pickup, ensuring security and peace of mind throughout the process.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="p-6 rounded-lg hover:bg-gray-50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mb-4 group-hover:bg-[#3B82F6]/20 transition-all duration-300">
                  <CreditCard className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900">Market-Based Pricing</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We offer competitive rates based on current market value and item condition.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.4}>
              <div className="p-6 rounded-lg hover:bg-gray-50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-[#8c52ff]/10 flex items-center justify-center mb-4 group-hover:bg-[#8c52ff]/20 transition-all duration-300">
                  <Leaf className="h-5 w-5 text-[#8c52ff]" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900">Immediate Payment</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Receive payment at the time of pickup, eliminating waiting periods for transactions.
                </p>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Testimonials Section - REDESIGNED with 3D shadow effect */}
      <section className="py-32 bg-gradient-to-b from-gray-100 to-white relative rounded-t-[40px] shadow-[0_-15px_30px_-10px_rgba(0,0,0,0.1)] transform translate-y-[-1px] border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <ContentAnimation>
            <h2 className="text-3xl md:text-4xl font-light mb-20 text-center tracking-wide">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                What Our Customers Say
              </span>
            </h2>
          </ContentAnimation>

          <div className="grid md:grid-cols-3 gap-8">
            <ContentAnimation delay={0.1}>
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]">
                <div className="flex items-center mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  "I sold 5 items in minutes! The pickup was scheduled for the next day and payment was instant. The
                  entire process was seamless."
                </p>
                <div className="flex items-center">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                    <Image src="/professional-woman-headshot.png" alt="Sarah T." fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Sarah T.</p>
                    <p className="text-xs text-gray-500">Chicago, IL</p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]">
                <div className="flex items-center mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  "BluBerry made selling my old electronics so easy. No haggling, no meetups with strangers. Just simple
                  and efficient service."
                </p>
                <div className="flex items-center">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                    <Image src="/professional-man-headshot.png" alt="Michael R." fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Michael R.</p>
                    <p className="text-xs text-gray-500">Boston, MA</p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]">
                <div className="flex items-center mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  "As a senior, I appreciated how easy the whole process was. The team was respectful and professional
                  throughout the entire experience."
                </p>
                <div className="flex items-center">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                    <Image src="/senior-woman-headshot.png" alt="Patricia L." fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Patricia L.</p>
                    <p className="text-xs text-gray-500">Denver, CO</p>
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Environmental Mission Section - REDESIGNED */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center max-w-6xl mx-auto">
            <ContentAnimation delay={0.1} className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-16">
              {/* Updated image with the same styling as the other images */}
              <div className="w-full mb-8">
                <div className="mx-auto" style={{ maxWidth: "450px" }}>
                  <img
                    src="https://q95jzuzo3cbj9etg.public.blob.vercel-storage.com/blob-2025-05-08%20at%208.49.27%20AM-wqAMj7eH5TeKzwB2CqIPom264qUVJb.jpg"
                    alt="Environmental sustainability illustration"
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      display: "block",
                    }}
                    className="transform hover:scale-[1.02] transition-all duration-500"
                  />
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2} className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-light mb-6 tracking-wide">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                  Reducing Waste,
                </span>
                <br />
                Creating Value
              </h2>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                At BluBerry, we're committed to extending the lifecycle of quality items. By facilitating the resale of
                used goods, we help reduce waste and environmental impact.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every item we help sell is one less item in a landfill and one more opportunity to create value for both
                sellers and future owners.
              </p>

              <div className="mt-8 flex items-center">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mr-4">
                  <Leaf className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <p className="text-sm text-gray-500 italic">
                  "Our mission is to create a more sustainable future through thoughtful commerce."
                </p>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* CTA Section - REDESIGNED */}
      <section className="py-32 bg-gradient-to-b from-gray-100 to-white relative shadow-[0_-15px_15px_-15px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto px-4 max-w-4xl">
          <ContentAnimation>
            <div className="bg-white p-12 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]">
              <h2 className="text-3xl md:text-4xl font-light mb-4 tracking-wide">
                <span className="text-black font-medium">Ready to Declutter?</span>
              </h2>
              <p className="text-gray-500 mb-8 max-w-xl mx-auto text-sm">
                Start the simple process today and turn your unused items into cash with our professional service.
              </p>
              <div className="flex justify-center">
                <div className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] p-[2px] rounded-lg">
                  <Link
                    href="/sell-item"
                    className="inline-flex items-center bg-white hover:bg-gray-50 transition-colors px-6 py-3 rounded-lg font-medium text-gray-900 group"
                  >
                    Sell Your Item Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
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
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .shimmer {
          animation: shimmer 2.5s infinite;
        }
      `}</style>
    </div>
  )
}
