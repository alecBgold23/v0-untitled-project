"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, CheckCircle, Clock, DollarSign, Package, Truck, Users, MapPin } from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function HowItWorksPage() {
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    zipCode: "",
    city: "",
    state: "",
    serviceType: "",
    itemTypes: "",
    estimatedValue: "",
    timeframe: "",
    additionalInfo: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleServiceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/send-service-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          name: "",
          email: "",
          phone: "",
          zipCode: "",
          city: "",
          state: "",
          serviceType: "",
          itemTypes: "",
          estimatedValue: "",
          timeframe: "",
          additionalInfo: "",
        })
      }
    } catch (error) {
      console.error("Error submitting service request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-background via-background to-secondary/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center font-light tracking-tight">
              <span className="bg-gradient-to-r from-[#4361ee] via-[#7209b7] to-[#3a0ca3] bg-clip-text text-transparent">
                How BluBerry Works
              </span>
            </h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto text-muted-foreground mb-8">
              From submission to cash in hand - here's how our simple 3-step process works
            </p>
          </ContentAnimation>
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                Simple 3-Step Process
              </span>
            </h2>
          </ContentAnimation>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Line connecting steps on desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] opacity-20"></div>

            <ContentAnimation delay={0.1}>
              <div className="flex flex-col items-center relative">
                <div className="w-16 h-16 rounded-full bg-card shadow-lg flex items-center justify-center mb-6 z-10 border border-[#3B82F6]/20">
                  <Package className="h-8 w-8 text-[#3B82F6]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-foreground">1. Fill Out Form</h3>
                <p className="text-muted-foreground text-center leading-relaxed max-w-xs">
                  Complete our simple online form with your item details, photos, and contact information. Takes just
                  2-3 minutes.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="flex flex-col items-center relative">
                <div className="w-16 h-16 rounded-full bg-card shadow-lg flex items-center justify-center mb-6 z-10 border border-[#8c52ff]/20">
                  <Truck className="h-8 w-8 text-[#8c52ff]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-foreground">2. We Come To You</h3>
                <p className="text-muted-foreground text-center leading-relaxed max-w-xs">
                  Schedule a convenient pickup time. Our professional team comes to your location to collect and
                  evaluate your items.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="flex flex-col items-center relative">
                <div className="w-16 h-16 rounded-full bg-card shadow-lg flex items-center justify-center mb-6 z-10 border border-[#3B82F6]/20">
                  <DollarSign className="h-8 w-8 text-[#3B82F6]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-foreground">3. Get Paid Instantly</h3>
                <p className="text-muted-foreground text-center leading-relaxed max-w-xs">
                  Receive your payment immediately upon pickup. Cash, check, Venmo, or PayPal - your choice.
                </p>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Full Service Section */}
      <section className="py-8 md:py-12 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                Full-Service Experience
              </span>
            </h2>
          </ContentAnimation>

          <div className="grid md:grid-cols-2 gap-8">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h3 className="text-xl font-semibold mb-4 text-foreground">What We Handle</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">Professional item evaluation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">Market research and pricing</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">Photography and listings</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">Buyer communication</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">Shipping and delivery</span>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h3 className="text-xl font-semibold mb-4 text-foreground">What You Do</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-[#3B82F6]/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                    </div>
                    <span className="text-foreground">Fill out our simple form</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-[#3B82F6]/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                    </div>
                    <span className="text-foreground">Schedule a pickup time</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-[#3B82F6]/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                    </div>
                    <span className="text-foreground">Be available for pickup</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-[#3B82F6]/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                    </div>
                    <span className="text-foreground">Receive your payment</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-foreground font-medium">That's it!</span>
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* AI-Powered Pricing Section */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                Smart Pricing Technology
              </span>
            </h2>
          </ContentAnimation>

          <div className="grid md:grid-cols-3 gap-6">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Market Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  AI analyzes current market trends and comparable sales to determine optimal pricing
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <div className="w-12 h-12 rounded-full bg-[#8c52ff]/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-[#8c52ff]" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Real-Time Updates</h3>
                <p className="text-muted-foreground text-sm">
                  Pricing adjusts automatically based on demand, seasonality, and market conditions
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Maximum Value</h3>
                <p className="text-muted-foreground text-sm">
                  Our algorithms ensure you get the best possible price for your items
                </p>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="py-8 md:py-12 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                Service Areas
              </span>
            </h2>
          </ContentAnimation>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <ContentAnimation delay={0.1}>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">Currently Serving</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-[#3B82F6] mr-3 flex-shrink-0" />
                    <span className="text-foreground">Chicago Metropolitan Area</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-[#3B82F6] mr-3 flex-shrink-0" />
                    <span className="text-foreground">North Shore Suburbs</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-[#3B82F6] mr-3 flex-shrink-0" />
                    <span className="text-foreground">Northwest Suburbs</span>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">
                  Don't see your area? We're expanding rapidly. Request service in your area below!
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Request Service in Your Area</h3>
                <Button
                  onClick={() => setIsServiceFormOpen(true)}
                  className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white hover:opacity-90"
                >
                  Request Service
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* What We Accept Section */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8c52ff]">
                What We Accept
              </span>
            </h2>
          </ContentAnimation>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Electronics</h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>Smartphones & Tablets</li>
                  <li>Laptops & Computers</li>
                  <li>Gaming Consoles</li>
                  <li>Audio Equipment</li>
                </ul>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Furniture</h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>Living Room Sets</li>
                  <li>Bedroom Furniture</li>
                  <li>Office Furniture</li>
                  <li>Antiques</li>
                </ul>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Appliances</h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>Kitchen Appliances</li>
                  <li>Washers & Dryers</li>
                  <li>Small Appliances</li>
                  <li>HVAC Equipment</li>
                </ul>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.4}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
                <h3 className="text-lg font-semibold mb-3 text-foreground">More Items</h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>Sporting Equipment</li>
                  <li>Musical Instruments</li>
                  <li>Collectibles</li>
                  <li>Tools & Equipment</li>
                </ul>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-[#3B82F6]/5 to-[#8c52ff]/5">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <ContentAnimation>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Turn your unused items into cash today with our simple 3-step process
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sell-multiple-items">
                <Button size="lg" className="bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white hover:opacity-90">
                  Start Selling Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Have Questions?
                </Button>
              </Link>
            </div>
          </ContentAnimation>
        </div>
      </section>

      {/* Service Request Modal */}
      {isServiceFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-foreground">Request BluBerry Service in Your Area</h2>
                <button
                  onClick={() => setIsServiceFormOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleServiceFormSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="Enter your city"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State *</label>
                        <Select onValueChange={(value) => handleInputChange("state", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AL">Alabama</SelectItem>
                            <SelectItem value="AK">Alaska</SelectItem>
                            <SelectItem value="AZ">Arizona</SelectItem>
                            <SelectItem value="AR">Arkansas</SelectItem>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="CO">Colorado</SelectItem>
                            <SelectItem value="CT">Connecticut</SelectItem>
                            <SelectItem value="DE">Delaware</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                            <SelectItem value="GA">Georgia</SelectItem>
                            <SelectItem value="HI">Hawaii</SelectItem>
                            <SelectItem value="ID">Idaho</SelectItem>
                            <SelectItem value="IL">Illinois</SelectItem>
                            <SelectItem value="IN">Indiana</SelectItem>
                            <SelectItem value="IA">Iowa</SelectItem>
                            <SelectItem value="KS">Kansas</SelectItem>
                            <SelectItem value="KY">Kentucky</SelectItem>
                            <SelectItem value="LA">Louisiana</SelectItem>
                            <SelectItem value="ME">Maine</SelectItem>
                            <SelectItem value="MD">Maryland</SelectItem>
                            <SelectItem value="MA">Massachusetts</SelectItem>
                            <SelectItem value="MI">Michigan</SelectItem>
                            <SelectItem value="MN">Minnesota</SelectItem>
                            <SelectItem value="MS">Mississippi</SelectItem>
                            <SelectItem value="MO">Missouri</SelectItem>
                            <SelectItem value="MT">Montana</SelectItem>
                            <SelectItem value="NE">Nebraska</SelectItem>
                            <SelectItem value="NV">Nevada</SelectItem>
                            <SelectItem value="NH">New Hampshire</SelectItem>
                            <SelectItem value="NJ">New Jersey</SelectItem>
                            <SelectItem value="NM">New Mexico</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="NC">North Carolina</SelectItem>
                            <SelectItem value="ND">North Dakota</SelectItem>
                            <SelectItem value="OH">Ohio</SelectItem>
                            <SelectItem value="OK">Oklahoma</SelectItem>
                            <SelectItem value="OR">Oregon</SelectItem>
                            <SelectItem value="PA">Pennsylvania</SelectItem>
                            <SelectItem value="RI">Rhode Island</SelectItem>
                            <SelectItem value="SC">South Carolina</SelectItem>
                            <SelectItem value="SD">South Dakota</SelectItem>
                            <SelectItem value="TN">Tennessee</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="UT">Utah</SelectItem>
                            <SelectItem value="VT">Vermont</SelectItem>
                            <SelectItem value="VA">Virginia</SelectItem>
                            <SelectItem value="WA">Washington</SelectItem>
                            <SelectItem value="WV">West Virginia</SelectItem>
                            <SelectItem value="WI">Wisconsin</SelectItem>
                            <SelectItem value="WY">Wyoming</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                        <Input
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          placeholder="Enter ZIP code"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Service Type *</label>
                    <Select onValueChange={(value) => handleInputChange("serviceType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pickup">Item Pickup & Sale</SelectItem>
                        <SelectItem value="evaluation">Item Evaluation Only</SelectItem>
                        <SelectItem value="consultation">Selling Consultation</SelectItem>
                        <SelectItem value="bulk">Bulk Item Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Types of Items</label>
                    <Input
                      placeholder="e.g., furniture, electronics, appliances"
                      value={formData.itemTypes}
                      onChange={(e) => handleInputChange("itemTypes", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Estimated Total Value</label>
                    <Select onValueChange={(value) => handleInputChange("estimatedValue", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select estimated value range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-500">Under $500</SelectItem>
                        <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                        <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                        <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                        <SelectItem value="over-5000">Over $5,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Timeframe</label>
                    <Select onValueChange={(value) => handleInputChange("timeframe", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="When would you like service?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">As soon as possible</SelectItem>
                        <SelectItem value="week">Within a week</SelectItem>
                        <SelectItem value="month">Within a month</SelectItem>
                        <SelectItem value="flexible">I'm flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Additional Information</label>
                    <Textarea
                      placeholder="Tell us more about your items, special requirements, or questions..."
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsServiceFormOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white"
                    >
                      {isSubmitting ? "Submitting..." : "Request Service"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Thank you for your request!</h3>
                  <Button
                    onClick={() => {
                      setIsSubmitted(false)
                      setIsServiceFormOpen(false)
                    }}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
