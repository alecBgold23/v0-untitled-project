import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import ContentAnimation from "@/components/content-animation"

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero Section with elegant gradient */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-background via-background to-secondary/30">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center font-[var(--font-roboto)] font-light tracking-tight">
              <span className="bg-gradient-to-r from-[#4361ee] via-[#7209b7] to-[#3a0ca3] bg-clip-text text-transparent">
                About BluBerry
              </span>
            </h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="text-lg md:text-xl text-center max-w-2xl mx-auto text-muted-foreground">
              Our mission is to make selling your unused items simple and efficient.
            </p>
          </ContentAnimation>
        </div>
      </section>

      {/* Main content section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="space-y-12">
            <ContentAnimation>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  At BluBerry, our mission is clear: <strong>Selling made simpler</strong>. We've created a service that
                  combines professional efficiency with a personal touch, making the selling process straightforward and
                  stress-free.
                </p>
                <p className="text-muted-foreground">
                  We handle all aspects of the selling process—from valuation to collection—allowing you to declutter
                  your space and receive fair compensation without the typical complications of second-hand sales.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.1}>
              <div className="bg-secondary/30 p-6 rounded-xl shadow-sm border border-border/50">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Approach</h2>
                <p className="text-muted-foreground mb-4">
                  Unlike traditional online marketplaces that require significant time investment in creating listings,
                  communicating with potential buyers, and arranging meetings, BluBerry offers a comprehensive service
                  that manages these tasks for you.
                </p>
                <p className="text-muted-foreground">
                  We eliminate common concerns such as price negotiations, appointment no-shows, and security
                  considerations when meeting unknown buyers. Our process is designed to be efficient, secure, and
                  straightforward.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50">
                <h2 className="text-2xl font-semibold mb-6 text-foreground text-center">Our Core Values</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#3B82F6] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold text-white">1</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1 text-foreground">Efficiency</h3>
                        <p className="text-sm text-muted-foreground">
                          We streamline the selling process to save you time and effort.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-[#8A4FFF] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold text-white">2</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1 text-foreground">Integrity</h3>
                        <p className="text-sm text-muted-foreground">
                          We offer fair market value and maintain transparency throughout the process.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-[#3B82F6] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold text-white">3</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1 text-foreground">Reliability</h3>
                        <p className="text-sm text-muted-foreground">
                          We honor our commitments and arrive at scheduled times.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#8A4FFF] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold text-white">4</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1 text-foreground">Professionalism</h3>
                        <p className="text-sm text-muted-foreground">
                          We treat you and your items with respect and care.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold text-white">5</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1 text-foreground">Transparency</h3>
                        <p className="text-sm text-muted-foreground">
                          We maintain clear communication and avoid hidden fees or conditions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.1}>
              <div className="bg-secondary/30 p-6 rounded-xl shadow-sm border border-border/50">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Who We Serve</h2>
                <p className="text-muted-foreground mb-4">
                  BluBerry is designed for anyone seeking a convenient selling solution, with particular benefits for:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-[#3B82F6] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">Individuals who value efficiency and convenience</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-[#3B82F6] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Those who prefer personal service over digital marketplaces
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-[#3B82F6] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">People seeking prompt payment for their items</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-[#3B82F6] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">Anyone looking to simplify the decluttering process</p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation>
              <div className="text-center mt-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Begin Your Selling Experience</h2>
                <p className="text-lg mb-6 text-muted-foreground max-w-2xl mx-auto">
                  Let us help you convert unused items into value with our professional service.
                </p>
                <Link
                  href="/sell-multiple-items"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Start Selling Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>
    </div>
  )
}
