import Link from "next/link"
import ContentAnimation from "@/components/content-animation"
import { ArrowRight, Check, MessageSquare, Package, Truck, Brain, Zap } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section with elegant gradient */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-background via-background to-secondary/30">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center font-[var(--font-roboto)] font-light tracking-tight">
              <span className="bg-gradient-to-r from-[#4361ee] via-[#7209b7] to-[#3a0ca3] bg-clip-text text-transparent">
                How BluBerry Works
              </span>
            </h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="text-lg md:text-xl text-center max-w-2xl mx-auto text-muted-foreground">
              Our streamlined process makes selling your items efficient and hassle-free.
            </p>
          </ContentAnimation>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-12 md:py-20 bg-background text-foreground">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <h2 className="text-2xl font-semibold mb-8 text-center text-foreground">
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
        </div>
      </section>

      {/* Full Service Section */}
      <section className="py-12 md:py-20 bg-secondary/10 text-foreground">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">We Handle Everything For You</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] mx-auto mb-6 rounded-full"></div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                BluBerry takes care of the entire resale process from start to finish, so you don't have to.
              </p>
            </div>
          </ContentAnimation>

          <div className="grid md:grid-cols-3 gap-6">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50 hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#3B82F6]/70 flex items-center justify-center mb-4 mx-auto">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-medium mb-3 text-center text-foreground">Minimal Photo Requirements</h3>
                <p className="text-muted-foreground text-center text-sm flex-grow">
                  Just take a few quick photos with your phone. No professional photography or detailed descriptions
                  needed.
                </p>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-[#3B82F6] mr-2" />
                    <span>Simple phone photos work</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Check className="h-4 w-4 text-[#3B82F6] mr-2" />
                    <span>No detailed descriptions needed</span>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50 hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#8A4FFF]/70 flex items-center justify-center mb-4 mx-auto">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-medium mb-3 text-center text-foreground">No Buyer Negotiations</h3>
                <p className="text-muted-foreground text-center text-sm flex-grow">
                  We deal with potential buyers, handle all inquiries, and manage the negotiation process completely.
                </p>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-[#8A4FFF] mr-2" />
                    <span>No haggling with buyers</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Check className="h-4 w-4 text-[#8A4FFF] mr-2" />
                    <span>No answering endless questions</span>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50 hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8A4FFF] flex items-center justify-center mb-4 mx-auto">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-medium mb-3 text-center text-foreground">No Logistics Hassle</h3>
                <p className="text-muted-foreground text-center text-sm flex-grow">
                  We manage all aspects of pickup, delivery, and transportation, saving you time and effort.
                </p>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-[#3B82F6] mr-2" />
                    <span>No arranging transportation</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Check className="h-4 w-4 text-[#3B82F6] mr-2" />
                    <span>No delivery coordination</span>
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>

          <ContentAnimation delay={0.4}>
            <div className="mt-12 text-center">
              <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
                From furniture and electronics to appliances and collectibles, we accept a wide range of items and
                handle every aspect of the selling process.
              </p>
              <div className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] p-[2px] rounded-lg">
                <Link
                  href="/sell-multiple-items"
                  className="inline-flex items-center bg-card hover:bg-secondary transition-colors px-4 py-2 rounded-lg font-medium text-foreground group text-sm"
                >
                  Start Selling Today
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </ContentAnimation>
        </div>
      </section>

      {/* AI-Powered Pricing Section */}
      <section className="py-12 md:py-20 bg-background text-foreground">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">AI-Powered Fair Pricing</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] mx-auto mb-6 rounded-full"></div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our advanced AI system analyzes market data to ensure you get the best possible price for your items.
              </p>
            </div>
          </ContentAnimation>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-8 rounded-xl shadow-sm border border-border/50">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#3B82F6]/70 flex items-center justify-center mb-6 mx-auto">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Smart Market Analysis</h3>
                  <p className="text-muted-foreground mb-6">
                    Our AI analyzes thousands of similar items across multiple platforms to determine the optimal
                    selling price for your item.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-[#3B82F6] mr-3" />
                      <span>Real-time market data analysis</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-[#3B82F6] mr-3" />
                      <span>Condition-based pricing adjustments</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-[#3B82F6] mr-3" />
                      <span>Local market considerations</span>
                    </div>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-secondary/30 p-8 rounded-xl shadow-sm border border-border/50">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#8A4FFF]/70 flex items-center justify-center mb-6 mx-auto">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Dynamic Pricing Strategy</h3>
                  <p className="text-muted-foreground mb-6">
                    We adjust our commission based on item value, demand, and market conditions to maximize your payout
                    while ensuring quick sales.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-[#8A4FFF] mr-3" />
                      <span>Flexible commission structure</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-[#8A4FFF] mr-3" />
                      <span>Higher payouts for premium items</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-[#8A4FFF] mr-3" />
                      <span>Transparent pricing breakdown</span>
                    </div>
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>

          <ContentAnimation delay={0.4}>
            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#8A4FFF]/10 p-6 rounded-xl border border-border/50">
                <h5 className="font-semibold text-foreground mb-2">No Hidden Fees, No Surprises</h5>
                <p className="text-muted-foreground text-sm">
                  You'll know exactly how much you'll receive before we pick up your item. Our AI ensures fair,
                  competitive pricing that benefits both you and the buyer.
                </p>
              </div>
            </div>
          </ContentAnimation>
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="py-12 md:py-20 bg-secondary/10 text-foreground">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Service Areas</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] mx-auto mb-6 rounded-full"></div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're just getting started in the Chicagoland area, with plans to expand nationwide as we grow.
              </p>
            </div>
          </ContentAnimation>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-8 rounded-xl shadow-sm border border-border/50">
                <h3 className="text-xl font-semibold mb-6 text-center text-foreground">Current Service Areas</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6] mr-4"></div>
                    <div>
                      <div className="font-medium text-foreground">Chicago Suburbs - North</div>
                      <div className="text-sm text-muted-foreground">Evanston, Skokie, Wilmette, Winnetka, Glencoe</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6] mr-4"></div>
                    <div>
                      <div className="font-medium text-foreground">Chicago Suburbs - West</div>
                      <div className="text-sm text-muted-foreground">
                        Oak Park, River Forest, Elmhurst, Hinsdale, Western Springs
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6] mr-4"></div>
                    <div>
                      <div className="font-medium text-foreground">Chicago Suburbs - Northwest</div>
                      <div className="text-sm text-muted-foreground">
                        Schaumburg, Arlington Heights, Des Plaines, Mount Prospect
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-secondary/30 p-8 rounded-xl shadow-sm border border-border/50">
                <h3 className="text-xl font-semibold mb-6 text-center text-foreground">Expanding Soon</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8A4FFF] mr-4"></div>
                    <div>
                      <div className="font-medium text-foreground">Chicago Suburbs - South</div>
                      <div className="text-sm text-muted-foreground">
                        Orland Park, Tinley Park, Oak Lawn, Palos Heights
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8A4FFF] mr-4"></div>
                    <div>
                      <div className="font-medium text-foreground">DuPage County</div>
                      <div className="text-sm text-muted-foreground">
                        Naperville, Wheaton, Downers Grove, Glen Ellyn
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8A4FFF] mr-4"></div>
                    <div>
                      <div className="font-medium text-foreground">Lake County</div>
                      <div className="text-sm text-muted-foreground">
                        Highland Park, Lake Forest, Libertyville, Vernon Hills
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>

          <ContentAnimation delay={0.3}>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 text-center">
              <h4 className="text-lg font-semibold mb-4 text-foreground">Our Vision: Nationwide Service</h4>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                BluBerry is just getting started! As we grow and prosper, our goal is to bring our hassle-free selling
                service to every major metropolitan area across the United States. Your success helps us expand to serve
                more communities.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#3B82F6]">Phase 1</div>
                  <div className="text-sm text-muted-foreground">Chicagoland Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#8A4FFF]">Phase 2</div>
                  <div className="text-sm text-muted-foreground">Midwest Expansion</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient-to-r from-[#3B82F6] to-[#8A4FFF]">Phase 3</div>
                  <div className="text-sm text-muted-foreground">National Coverage</div>
                </div>
              </div>
              <div className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] p-[2px] rounded-lg">
                <Link
                  href="/contact"
                  className="inline-flex items-center bg-card hover:bg-secondary transition-colors px-6 py-3 rounded-lg font-medium text-foreground group"
                >
                  Request Service in Your Area
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </ContentAnimation>
        </div>
      </section>

      {/* What We Accept Section */}
      <section className="py-12 md:py-20 bg-background text-foreground">
        <div className="container mx-auto px-4 max-w-5xl">
          <ContentAnimation>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">What We Accept</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] mx-auto mb-6 rounded-full"></div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We accept a wide variety of items in good condition. Here's what we can help you sell.
              </p>
            </div>
          </ContentAnimation>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-8 rounded-xl shadow-sm border border-border/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#3B82F6]/70 flex items-center justify-center mb-6">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-6 text-foreground">We Accept</h3>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium text-foreground mb-2">Furniture</div>
                    <div className="text-sm text-muted-foreground">
                      Sofas, chairs, tables, dressers, beds, cabinets, bookshelves
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-2">Electronics</div>
                    <div className="text-sm text-muted-foreground">
                      TVs, computers, gaming consoles, audio equipment, cameras
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-2">Appliances</div>
                    <div className="text-sm text-muted-foreground">
                      Refrigerators, washers, dryers, microwaves, small appliances
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-2">Home Decor</div>
                    <div className="text-sm text-muted-foreground">Artwork, mirrors, lamps, rugs, decorative items</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-2">Collectibles & Antiques</div>
                    <div className="text-sm text-muted-foreground">
                      Vintage items, collectibles, antique furniture, memorabilia
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-2">Exercise Equipment</div>
                    <div className="text-sm text-muted-foreground">Treadmills, weights, bikes, home gym equipment</div>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-secondary/30 p-8 rounded-xl shadow-sm border border-border/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-6">
                  <span className="text-white text-xl font-bold">×</span>
                </div>
                <h3 className="text-xl font-semibold mb-6 text-foreground">We Don't Accept</h3>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium text-foreground mb-2">Damaged Items</div>
                    <div className="text-sm text-muted-foreground">Broken, heavily worn, or non-functional items</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-2">Clothing & Textiles</div>
                    <div className="text-sm text-muted-foreground">Clothes, shoes, bedding, curtains, fabric items</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-2">Personal Items</div>
                    <div className="text-sm text-muted-foreground">
                      Documents, photos, personal memorabilia, jewelry
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-2">Hazardous Materials</div>
                    <div className="text-sm text-muted-foreground">Chemicals, paint, batteries, flammable items</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-2">Perishables</div>
                    <div className="text-sm text-muted-foreground">Food, plants, anything that can spoil or decay</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground mb-2">Items Under $50 Value</div>
                    <div className="text-sm text-muted-foreground">
                      Low-value items that don't meet our minimum threshold
                    </div>
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>

          <ContentAnimation delay={0.3}>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
              <h4 className="text-lg font-semibold mb-4 text-center text-foreground">Item Condition Requirements</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 mx-auto">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h5 className="font-semibold text-foreground mb-2">Excellent Condition</h5>
                  <p className="text-sm text-muted-foreground">Like new, minimal wear, fully functional</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4 mx-auto">
                    <Check className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h5 className="font-semibold text-foreground mb-2">Good Condition</h5>
                  <p className="text-sm text-muted-foreground">Light wear, fully functional, clean</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 mx-auto">
                    <Check className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h5 className="font-semibold text-foreground mb-2">Fair Condition</h5>
                  <p className="text-sm text-muted-foreground">
                    Noticeable wear but functional, may need minor repairs
                  </p>
                </div>
              </div>
            </div>
          </ContentAnimation>

          <ContentAnimation delay={0.4}>
            <div className="mt-12 text-center">
              <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
                Not sure if we'll accept your item? Submit it anyway! Our team will evaluate each submission and let you
                know if it meets our criteria.
              </p>
              <div className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] p-[2px] rounded-lg">
                <Link
                  href="/sell-multiple-items"
                  className="inline-flex items-center bg-card hover:bg-secondary transition-colors px-6 py-3 rounded-lg font-medium text-foreground group"
                >
                  Submit Your Item
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </ContentAnimation>
        </div>
      </section>
    </div>
  )
}
