"use client"

import Link from "next/link"
import Image from "next/image"
import { AlertTriangle } from "lucide-react"
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

      {/* Hero Section */}
      <section className="bg-white pt-10 pb-24 md:pt-12 md:pb-32">
        <div className="container mx-auto px-4">
          {/* Clickable hero content */}
          <ContentAnimation>
            <div
              className="flex flex-col items-center text-center cursor-pointer group mb-8"
              onClick={navigateToSellItem}
            >
              <h1 className="text-4xl md:text-5xl font-medium mb-2 sparkle-text drop-shadow-sm pb-1 transition-transform duration-300 group-hover:scale-105 gradient-header">
                BluBerry
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
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/how-it-works"
                className="bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white px-5 py-2 rounded-full font-medium hover:shadow-md hover:translate-y-[-1px] transition-all"
              >
                Learn How It Works
              </Link>
              <Link
                href="/sell-item"
                className="border-2 border-[#6a5acd] text-[#6a5acd] px-5 py-2 rounded-full font-medium hover:bg-gradient-to-r hover:from-[#3B82F6] hover:to-[#8c52ff] hover:text-white hover:border-transparent hover:shadow-md hover:translate-y-[-1px] transition-all"
              >
                Sell Your Item
              </Link>
            </div>
          </ContentAnimation>
        </div>
      </section>

      {/* How It Works Section - Changed back to black with professional Roboto font */}
      <section className="bg-black text-white py-24 font-[var(--font-roboto)]">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h2 className="text-5xl font-normal mb-16 text-center tracking-tight white-header">How It Works</h2>
          </ContentAnimation>
          <div className="grid md:grid-cols-3 gap-16">
            <ContentAnimation delay={0.1}>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#0066ff] flex items-center justify-center mb-6">
                  <span className="text-2xl font-normal text-white">1</span>
                </div>
                <h3 className="text-xl font-medium mb-3 text-center">Submit Your Item</h3>
                <p className="text-gray-300 text-center mb-6 font-normal leading-relaxed">
                  Complete our simple form with your item details. No complex listings required.
                </p>
                <div className="relative w-full h-48 rounded-xl overflow-hidden">
                  <Image src="/placeholder.svg?key=2e143" alt="Submit your item" fill className="object-cover" />
                </div>
              </div>
            </ContentAnimation>
            <ContentAnimation delay={0.2}>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#8c52ff] flex items-center justify-center mb-6">
                  <span className="text-2xl font-normal text-white">2</span>
                </div>
                <h3 className="text-xl font-medium mb-3 text-center">We Pick It Up</h3>
                <p className="text-gray-300 text-center mb-6 font-normal leading-relaxed">
                  Schedule a convenient time, and our team will collect the item from your location.
                </p>
                <div className="relative w-full h-48 rounded-xl overflow-hidden">
                  <Image src="/placeholder.svg?key=fghw3" alt="We pick it up" fill className="object-cover" />
                </div>
              </div>
            </ContentAnimation>
            <ContentAnimation delay={0.3}>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0066ff] to-[#8c52ff] flex items-center justify-center mb-6">
                  <span className="text-2xl font-normal text-white">3</span>
                </div>
                <h3 className="text-xl font-medium mb-3 text-center">Get Paid Instantly</h3>
                <p className="text-gray-300 text-center mb-6 font-normal leading-relaxed">
                  Receive your payment immediately upon pickup. No waiting, no complications.
                </p>
                <div className="relative w-full h-48 rounded-xl overflow-hidden">
                  <Image src="/placeholder.svg?key=efy0w" alt="Get paid instantly" fill className="object-cover" />
                </div>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="page-header text-center">Why Choose BluBerry</h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-16 text-center">
            The simplest way to sell your unused items
          </p>

          <div className="grid md:grid-cols-2 gap-16 max-w-4xl mx-auto">
            <div className="text-center flex flex-col items-center">
              <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden">
                <Image src="/placeholder.svg?key=6ot0q" alt="Simplified Process" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#0066ff]">Simplified Process</h3>
              <p className="text-gray-600">
                Our streamlined form takes minutes to complete, eliminating the need for detailed descriptions or
                photos.
              </p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden">
                <Image src="/placeholder.svg?key=p10r0" alt="Professional Service" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#8c52ff]">Professional Service</h3>
              <p className="text-gray-600">
                Our vetted team handles pickup, ensuring security and peace of mind throughout the process.
              </p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden">
                <Image src="/placeholder.svg?key=8toch" alt="Market-Based Pricing" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#0066ff]">Market-Based Pricing</h3>
              <p className="text-gray-600">
                We offer competitive rates based on current market value and item condition.
              </p>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden">
                <Image src="/placeholder.svg?key=y08aa" alt="Immediate Payment" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#8c52ff]">Immediate Payment</h3>
              <p className="text-gray-600">
                Receive payment at the time of pickup, eliminating waiting periods for transactions to process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="page-header text-center">What Our Customers Say</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center text-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
                <Image src="/placeholder.svg?key=tzifh" alt="Sarah T." fill className="object-cover" />
              </div>
              <p className="text-gray-600 mb-4">
                "I sold 5 items in minutes! The pickup was scheduled for the next day and payment was instant."
              </p>
              <p className="font-medium">Sarah T.</p>
              <p className="text-sm text-gray-500">Chicago, IL</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center text-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
                <Image src="/placeholder.svg?key=td4qz" alt="Michael R." fill className="object-cover" />
              </div>
              <p className="text-gray-600 mb-4">
                "BluBerry made selling my old electronics so easy. No haggling, no meetups with strangers. Just simple
                and efficient."
              </p>
              <p className="font-medium">Michael R.</p>
              <p className="text-sm text-gray-500">Boston, MA</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center text-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
                <Image src="/placeholder.svg?key=p0c26" alt="Patricia L." fill className="object-cover" />
              </div>
              <p className="text-gray-600 mb-4">
                "As a senior, I appreciated how easy the whole process was. The team was respectful and professional."
              </p>
              <p className="font-medium">Patricia L.</p>
              <p className="text-sm text-gray-500">Denver, CO</p>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Mission Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="relative w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden">
                <Image src="/placeholder.svg?key=255yw" alt="Environmental Impact" fill className="object-cover" />
              </div>
            </div>
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="page-header md:text-left">Reducing Waste, Creating Value</h2>
              <p className="text-gray-600 mb-4">
                At BluBerry, we're committed to extending the lifecycle of quality items. By facilitating the resale of
                used goods, we help reduce waste and environmental impact.
              </p>
              <p className="text-gray-600">
                Every item we help sell is one less item in a landfill and one more opportunity to create value for both
                sellers and future owners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="page-header">Ready to Declutter and Get Paid?</h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Start the simple process today and turn your unused items into cash.
          </p>
          <Link
            href="/sell-item"
            className="bg-gradient-to-r from-[#0066ff] to-[#8c52ff] text-white px-6 py-3 rounded-full font-medium hover:shadow-md hover:translate-y-[-1px] transition-all"
          >
            Sell Your Item Now
          </Link>
        </div>
      </section>
    </div>
  )
}
