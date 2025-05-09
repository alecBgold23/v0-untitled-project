import Link from "next/link"
import AnimatedSection from "@/components/animated-section"

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="apple-section bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h1 className="page-header text-white dark:text-white font-[var(--font-roboto)] font-light tracking-tight">
              About BluBerry
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <p className="apple-subheading mb-8 text-muted-foreground">
              Our mission is to make selling your unused items simple and efficient.
            </p>
          </AnimatedSection>
          {/* Main image removed as requested */}
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-12 text-center">
            <AnimatedSection>
              <div>
                <h2 className="section-header mb-4 text-foreground font-[var(--font-roboto)] font-light tracking-tight">
                  Our Mission
                </h2>
                {/* Image removed as requested */}
                <p className="text-muted-foreground">
                  At BluBerry, our mission is clear: <strong>Selling made simpler</strong>. We've created a service that
                  combines professional efficiency with a personal touch, making the selling process straightforward and
                  stress-free.
                </p>
                <p className="text-muted-foreground mt-4">
                  We handle all aspects of the selling process—from valuation to collection—allowing you to declutter
                  your space and receive fair compensation without the typical complications of second-hand sales.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="bg-secondary p-8 rounded-xl">
                <h2 className="section-header mb-4 text-foreground font-[var(--font-roboto)] font-light tracking-tight">
                  Our Approach
                </h2>
                <p className="text-muted-foreground">
                  Unlike traditional online marketplaces that require significant time investment in creating listings,
                  communicating with potential buyers, and arranging meetings, BluBerry offers a comprehensive service
                  that manages these tasks for you.
                </p>
                <p className="text-muted-foreground mt-4">
                  We eliminate common concerns such as price negotiations, appointment no-shows, and security
                  considerations when meeting unknown buyers. Our process is designed to be efficient, secure, and
                  straightforward.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div>
                <h2 className="section-header mb-6 text-foreground font-[var(--font-roboto)] font-light tracking-tight">
                  Our Core Values
                </h2>
                {/* Core Values image removed as requested */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-[#3B82F6] w-8 h-8 rounded-full flex items-center justify-center mb-3">
                      <span className="text-sm font-bold text-white">1</span>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>Efficiency</strong> - We streamline the selling process to save you time and effort.
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-[#8A4FFF] w-8 h-8 rounded-full flex items-center justify-center mb-3">
                      <span className="text-sm font-bold text-white">2</span>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>Integrity</strong> - We offer fair market value and maintain transparency throughout the
                      process.
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-[#3B82F6] w-8 h-8 rounded-full flex items-center justify-center mb-3">
                      <span className="text-sm font-bold text-white">3</span>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>Reliability</strong> - We honor our commitments and arrive at scheduled times.
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-[#8A4FFF] w-8 h-8 rounded-full flex items-center justify-center mb-3">
                      <span className="text-sm font-bold text-white">4</span>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>Professionalism</strong> - We treat you and your items with respect and care.
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] w-8 h-8 rounded-full flex items-center justify-center mb-3">
                      <span className="text-sm font-bold text-white">5</span>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>Transparency</strong> - We maintain clear communication and avoid hidden fees or
                      conditions.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="bg-secondary p-8 rounded-xl">
                <h2 className="section-header mb-4 text-foreground font-[var(--font-roboto)] font-light tracking-tight">
                  Who We Serve
                </h2>
                {/* Who We Serve image removed as requested */}
                <p className="text-muted-foreground mb-4">
                  BluBerry is designed for anyone seeking a convenient selling solution, with particular benefits for:
                </p>
                <ul className="space-y-2 text-muted-foreground max-w-md mx-auto text-center">
                  <li>Individuals who value efficiency and convenience</li>
                  <li>Those who prefer personal service over digital marketplaces</li>
                  <li>People seeking prompt payment for their items</li>
                  <li>Anyone looking to simplify the decluttering process</li>
                </ul>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="text-center mt-12">
                <h2 className="section-header mb-4 text-foreground font-[var(--font-roboto)] font-light tracking-tight">
                  Begin Your Selling Experience
                </h2>
                <p className="text-xl mb-6 text-foreground">
                  Let us help you convert unused items into value with our professional service.
                </p>
                <Link href="/sell-item" className="apple-button apple-button-primary">
                  Start Selling Today
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}
