import Link from "next/link"
import ContentAnimation from "@/components/content-animation"
import { ArrowRight, Check, MessageSquare, Package, Truck, Wallet } from "lucide-react"

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

          {/* Timeline Steps - Detailed */}
          <div className="space-y-12 mt-16">
            {/* Step 1 */}
            <ContentAnimation>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Package className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">Submit Your Item</h2>
                    <p className="text-muted-foreground mb-4">
                      Complete our straightforward form with basic information about your item. We've simplified this
                      step to eliminate the need for extensive photography or detailed descriptions.
                    </p>
                    <div className="bg-secondary/20 p-4 rounded-lg">
                      <p className="text-muted-foreground italic text-sm">
                        "The submission process was remarkably efficient. I completed the form in minutes without
                        needing to take photos." — Mary S.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            {/* Step 2 */}
            <ContentAnimation delay={0.1}>
              <div className="bg-secondary/30 p-6 rounded-xl shadow-sm border border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#8A4FFF]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageSquare className="h-6 w-6 text-[#8A4FFF]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">Receive a Fair Offer</h2>
                    <p className="text-muted-foreground mb-4">
                      Within 24 hours, our team evaluates your submission and provides a competitive offer based on the
                      item's condition and current market value, eliminating the need for negotiation.
                    </p>
                    <div className="bg-card p-4 rounded-lg">
                      <p className="text-muted-foreground italic text-sm">
                        "The offer for my dining set exceeded my expectations and reflected fair market value." — Robert
                        T.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            {/* Step 3 */}
            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Truck className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">Schedule a Pickup</h2>
                    <p className="text-muted-foreground mb-4">
                      Upon accepting our offer, we arrange a convenient pickup time. Our professional team comes to your
                      location, eliminating transportation concerns on your part.
                    </p>
                    <div className="bg-secondary/20 p-4 rounded-lg">
                      <p className="text-muted-foreground italic text-sm">
                        "The pickup team arrived precisely on schedule and handled the collection process with
                        professionalism and care." — Linda M.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            {/* Step 4 */}
            <ContentAnimation delay={0.3}>
              <div className="bg-secondary/30 p-6 rounded-xl shadow-sm border border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#8A4FFF]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Wallet className="h-6 w-6 text-[#8A4FFF]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-3 text-foreground">Immediate Payment</h2>
                    <p className="text-muted-foreground mb-4">
                      At the time of pickup, you receive immediate payment via your preferred method—cash, check, or
                      digital transfer—eliminating waiting periods for funds to clear.
                    </p>
                    <div className="bg-card p-4 rounded-lg">
                      <p className="text-muted-foreground italic text-sm">
                        "I received payment immediately upon item collection, which was remarkably convenient." — James
                        W.
                      </p>
                    </div>
                  </div>
                </div>
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
                <h3 className="text-lg font-medium mb-3 text-center text-foreground">No Listings to Create</h3>
                <p className="text-muted-foreground text-center text-sm flex-grow">
                  Forget about taking photos, writing descriptions, or creating online listings. We handle all the
                  marketing.
                </p>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-[#3B82F6] mr-2" />
                    <span>No photography needed</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Check className="h-4 w-4 text-[#3B82F6] mr-2" />
                    <span>No descriptions to write</span>
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
    </div>
  )
}
