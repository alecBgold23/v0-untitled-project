import Link from "next/link"
import ContentAnimation from "@/components/content-animation"

export default function HowItWorksPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-foreground">How BluBerry Works</h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="text-xl text-center max-w-2xl mx-auto mb-8 text-muted-foreground">
              Our streamlined process makes selling your items efficient and hassle-free.
            </p>
          </ContentAnimation>
        </div>
      </section>

      {/* Process Steps - Updated with professional Roboto font */}
      <section className="py-16 md:py-24 bg-background text-foreground font-[var(--font-roboto)]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-24">
            <ContentAnimation>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 text-center md:text-left">
                  <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center mb-6 mx-auto md:mx-0">
                    <span className="text-2xl font-normal text-white">1</span>
                  </div>
                  <h2 className="text-2xl font-medium mb-4 tracking-tight text-foreground">Submit Your Item</h2>
                  <p className="text-muted-foreground mb-4 font-normal leading-relaxed">
                    Complete our straightforward form with basic information about your item. We've simplified this step
                    to eliminate the need for extensive photography or detailed descriptions.
                  </p>
                  <div className="bg-card p-4 rounded-lg">
                    <p className="text-muted-foreground italic text-center">
                      "The submission process was remarkably efficient. I completed the form in minutes without needing
                      to take photos." — Mary S.
                    </p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.1}>
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="md:w-1/2 text-center md:text-left">
                  <div className="w-16 h-16 rounded-full bg-[#8A4FFF] flex items-center justify-center mb-6 mx-auto md:mx-0">
                    <span className="text-2xl font-normal text-white">2</span>
                  </div>
                  <h2 className="text-2xl font-medium mb-4 tracking-tight text-foreground">Receive a Fair Offer</h2>
                  <p className="text-muted-foreground mb-4 font-normal leading-relaxed">
                    Within 24 hours, our team evaluates your submission and provides a competitive offer based on the
                    item's condition and current market value, eliminating the need for negotiation.
                  </p>
                  <div className="bg-card p-4 rounded-lg">
                    <p className="text-muted-foreground italic text-center">
                      "The offer for my dining set exceeded my expectations and reflected fair market value." — Robert
                      T.
                    </p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 text-center md:text-left">
                  <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center mb-6 mx-auto md:mx-0">
                    <span className="text-2xl font-normal text-white">3</span>
                  </div>
                  <h2 className="text-2xl font-medium mb-4 tracking-tight text-foreground">Schedule a Pickup</h2>
                  <p className="text-muted-foreground mb-4 font-normal leading-relaxed">
                    Upon accepting our offer, we arrange a convenient pickup time. Our professional team comes to your
                    location, eliminating transportation concerns on your part.
                  </p>
                  <div className="bg-card p-4 rounded-lg">
                    <p className="text-muted-foreground italic text-center">
                      "The pickup team arrived precisely on schedule and handled the collection process with
                      professionalism and care." — Linda M.
                    </p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.1}>
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="md:w-1/2 text-center md:text-left">
                  <div className="w-16 h-16 rounded-full bg-[#8A4FFF] flex items-center justify-center mb-6 mx-auto md:mx-0">
                    <span className="text-2xl font-normal text-white">4</span>
                  </div>
                  <h2 className="text-2xl font-medium mb-4 tracking-tight text-foreground">Immediate Payment</h2>
                  <p className="text-muted-foreground mb-4 font-normal leading-relaxed">
                    At the time of pickup, you receive immediate payment via your preferred method—cash, check, or
                    digital transfer—eliminating waiting periods for funds to clear.
                  </p>
                  <div className="bg-card p-4 rounded-lg">
                    <p className="text-muted-foreground italic text-center">
                      "I received payment immediately upon item collection, which was remarkably convenient." — James W.
                    </p>
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Full Service Section - Replacing Items We Accept */}
      <section className="py-16 md:py-24 bg-background text-foreground border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <ContentAnimation>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-foreground">
                We Handle Everything For You
              </h2>
              <div className="w-24 h-1 bg-[#3B82F6] mx-auto mb-6"></div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                BluBerry takes care of the entire resale process from start to finish, so you don't have to.
              </p>
            </div>
          </ContentAnimation>

          <div className="grid md:grid-cols-3 gap-8">
            <ContentAnimation delay={0.1}>
              <div className="bg-card p-6 rounded-lg text-center">
                <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center mb-4 mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">No Listings to Create</h3>
                <p className="text-muted-foreground">
                  Forget about taking photos, writing descriptions, or creating online listings. We handle all the
                  marketing.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.2}>
              <div className="bg-card p-6 rounded-lg text-center">
                <div className="w-16 h-16 rounded-full bg-[#8A4FFF] flex items-center justify-center mb-4 mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">No Buyer Negotiations</h3>
                <p className="text-muted-foreground">
                  We deal with potential buyers, handle all inquiries, and manage the negotiation process completely.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.3}>
              <div className="bg-card p-6 rounded-lg text-center">
                <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center mb-4 mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">No Logistics Hassle</h3>
                <p className="text-muted-foreground">
                  We manage all aspects of pickup, delivery, and transportation, saving you time and effort.
                </p>
              </div>
            </ContentAnimation>
          </div>

          <ContentAnimation delay={0.4}>
            <div className="mt-16 text-center">
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                From furniture and electronics to appliances and collectibles, we accept a wide range of items and
                handle every aspect of the selling process so you don't have to.
              </p>
              <div className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] p-[2px] rounded-lg">
                <Link
                  href="/sell-item"
                  className="block bg-card hover:bg-accent transition-colors px-8 py-3 rounded-lg text-foreground font-medium"
                >
                  Start Selling Today
                </Link>
              </div>
            </div>
          </ContentAnimation>
        </div>
      </section>
    </div>
  )
}
