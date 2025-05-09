"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"
import ContentAnimation from "@/components/content-animation"

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState("sell")

  return (
    <div className="container mx-auto py-12 px-4">
      <ContentAnimation>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
            How It Works
          </span>
        </h1>
        <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
          We've simplified the process of selling your used items to make it as easy and convenient as possible.
        </p>
      </ContentAnimation>

      {/* Process Steps */}
      <div className="max-w-6xl mx-auto mb-24">
        <ContentAnimation delay={0.1}>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Line connecting steps on desktop */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] opacity-20"></div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-8 z-10 border border-[#3B82F6]/20">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                  1
                </span>
              </div>
              <h3 className="text-xl font-medium mb-3">Submit Your Item</h3>
              <p className="text-gray-500 mb-6">
                Fill out our simple form with details about your item. No need for lengthy descriptions or professional
                photos.
              </p>
              <div className="w-full max-w-xs h-64 relative rounded-lg overflow-hidden shadow-md">
                <Image src="/person-filling-form.png" alt="Submit your item" fill className="object-cover" />
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-8 z-10 border border-[#3B82F6]/20">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                  2
                </span>
              </div>
              <h3 className="text-xl font-medium mb-3">We Pick It Up</h3>
              <p className="text-gray-500 mb-6">
                Schedule a convenient pickup time, and our professional team will come to your location to collect the
                item.
              </p>
              <div className="w-full max-w-xs h-64 relative rounded-lg overflow-hidden shadow-md">
                <Image src="/delivery-pickup.png" alt="We pick it up" fill className="object-cover" />
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mb-8 z-10 border border-[#3B82F6]/20">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] font-medium">
                  3
                </span>
              </div>
              <h3 className="text-xl font-medium mb-3">Get Paid Instantly</h3>
              <p className="text-gray-500 mb-6">
                Receive your payment immediately upon pickup. No waiting for buyers or dealing with payment platforms.
              </p>
              <div className="w-full max-w-xs h-64 relative rounded-lg overflow-hidden shadow-md">
                <Image src="/smartphone-payment-received.png" alt="Get paid instantly" fill className="object-cover" />
              </div>
            </div>
          </div>
        </ContentAnimation>
      </div>

      {/* Our Approach Section */}
      <ContentAnimation delay={0.2}>
        <div className="max-w-6xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Our Approach</h2>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="w-full rounded-lg overflow-hidden shadow-lg">
                <img
                  src="https://q95jzuzo3cbj9etg.public.blob.vercel-storage.com/our-approach-image.png"
                  alt="Our Approach to Selling Used Items"
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="md:w-1/2">
              <h3 className="text-2xl font-medium mb-4">A Better Way to Sell</h3>
              <p className="text-gray-600 mb-4">
                At BluBerry, we've reimagined the selling process from the ground up. Our approach eliminates the common
                frustrations of selling used items online or through traditional channels.
              </p>
              <p className="text-gray-600 mb-4">
                Instead of dealing with multiple potential buyers, haggling over prices, or arranging meetups, we
                provide a streamlined service that handles everything for you.
              </p>
              <p className="text-gray-600">
                Our team of experts evaluates your items fairly, offers competitive prices, and handles all the
                logistics, so you can focus on what matters most to you.
              </p>
            </div>
          </div>
        </div>
      </ContentAnimation>

      {/* FAQ Section */}
      <ContentAnimation delay={0.3}>
        <div className="max-w-4xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium mb-3">What types of items do you accept?</h3>
              <p className="text-gray-600">
                We accept a wide range of items including electronics, furniture, clothing, and more. The items should
                be in working condition, though we do accept items with minor wear and tear. We don't accept items that
                are broken beyond repair, hazardous materials, or illegal items.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium mb-3">How do you determine the price?</h3>
              <p className="text-gray-600">
                Our pricing is based on current market value, the condition of the item, and demand. We aim to offer
                competitive prices that are fair for both parties. After reviewing your submission, we'll send you an
                offer within 24 hours.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium mb-3">What areas do you service?</h3>
              <p className="text-gray-600">
                We currently operate in major metropolitan areas including Chicago, New York, Los Angeles, and Boston.
                We're continuously expanding our service areas. If you're unsure if we service your area, please contact
                us.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium mb-3">What if I'm not satisfied with the offer?</h3>
              <p className="text-gray-600">
                You're under no obligation to accept our offer. If you decide not to proceed, simply decline the offer
                and there's no further commitment. We strive to provide the best possible value, but understand that
                sometimes our offer may not meet your expectations.
              </p>
            </div>
          </div>
        </div>
      </ContentAnimation>

      {/* Benefits Section */}
      <ContentAnimation delay={0.4}>
        <div className="max-w-4xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits of Using BluBerry</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start mb-4">
                <div className="mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Save Time</h3>
                  <p className="text-gray-600">
                    No need to create listings, communicate with potential buyers, or arrange meetups. Our process is
                    designed to save you valuable time.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start mb-4">
                <div className="mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Guaranteed Payment</h3>
                  <p className="text-gray-600">
                    No worries about payment falling through or buyers backing out. Once we agree on a price, payment is
                    guaranteed upon pickup.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start mb-4">
                <div className="mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Professional Service</h3>
                  <p className="text-gray-600">
                    Our team is trained to handle your items with care and provide a professional, courteous service
                    from start to finish.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start mb-4">
                <div className="mr-4 mt-1">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Environmentally Friendly</h3>
                  <p className="text-gray-600">
                    By selling your used items instead of discarding them, you're contributing to a more sustainable
                    future and reducing waste.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentAnimation>

      {/* CTA Section */}
      <ContentAnimation delay={0.5}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Turn your used items into cash today with our simple, hassle-free process.
          </p>
          <Link
            href="/sell-item"
            className="inline-flex items-center bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all"
          >
            Sell Your Item Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </ContentAnimation>
    </div>
  )
}
