import Link from "next/link"
import Image from "next/image"
import ContentAnimation from "@/components/content-animation"

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="apple-section bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="page-header">About BluBerry</h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="apple-subheading mb-8">
              Our mission is to make selling your unused items simple and efficient.
            </p>
          </ContentAnimation>
          <ContentAnimation delay={0.2}>
            <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] rounded-2xl overflow-hidden">
              <Image src="/placeholder.svg?key=fa01e" alt="BluBerry Team" fill className="object-cover" priority />
            </div>
          </ContentAnimation>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-12 text-center">
            <ContentAnimation>
              <div>
                <h2 className="section-header mb-4">Our Mission</h2>
                <div className="relative w-full max-w-md mx-auto aspect-[16/9] rounded-xl overflow-hidden mb-6">
                  <Image src="/placeholder.svg?key=auush" alt="Our Mission" fill className="object-cover" />
                </div>
                <p className="text-gray-600">
                  At BluBerry, our mission is clear: <strong>Selling made simpler</strong>. We've created a service that
                  combines professional efficiency with a personal touch, making the selling process straightforward and
                  stress-free.
                </p>
                <p className="text-gray-600 mt-4">
                  We handle all aspects of the selling process—from valuation to collection—allowing you to declutter
                  your space and receive fair compensation without the typical complications of second-hand sales.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.1}>
              <div className="bg-gray-50 p-8 rounded-xl">
                <h2 className="section-header mb-4">Our Approach</h2>
                <div className="relative w-full max-w-md mx-auto aspect-[16/9] rounded-xl overflow-hidden mb-6">
                  <Image src="/placeholder.svg?key=2y8ug" alt="Our Approach" fill className="object-cover" />
                </div>
                <p className="text-gray-600">
                  Unlike traditional online marketplaces that require significant time investment in creating listings,
                  communicating with potential buyers, and arranging meetings, BluBerry offers a comprehensive service
                  that manages these tasks for you.
                </p>
                <p className="text-gray-600 mt-4">
                  We eliminate common concerns such as price negotiations, appointment no-shows, and security
                  considerations when meeting unknown buyers. Our process is designed to be efficient, secure, and
                  straightforward.
                </p>
              </div>
            </ContentAnimation>

            <ContentAnimation>
              <div>
                <h2 className="section-header mb-6">Our Core Values</h2>
                <div className="relative w-full max-w-md mx-auto aspect-[16/9] rounded-xl overflow-hidden mb-6">
                  <Image src="/placeholder.svg?key=dtqh3" alt="Our Core Values" fill className="object-cover" />
                </div>
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-[#3B82F6] w-8 h-8 rounded-full flex items-center justify-center mb-3">
                      <span className="text-sm font-bold text-white">1</span>
                    </div>
                    <p className="text-gray-600">
                      <strong>Efficiency</strong> - We streamline the selling process to save you time and effort.
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-[#8A4FFF] w-8 h-8 rounded-full flex items-center justify-center mb-3">
                      <span className="text-sm font-bold text-white">2</span>
                    </div>
                    <p className="text-gray-600">
                      <strong>Integrity</strong> - We offer fair market value and maintain transparency throughout the
                      process.
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-[#3B82F6] w-8 h-8 rounded-full flex items-center justify-center mb-3">
                      <span className="text-sm font-bold text-white">3</span>
                    </div>
                    <p className="text-gray-600">
                      <strong>Reliability</strong> - We honor our commitments and arrive at scheduled times.
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-[#8A4FFF] w-8 h-8 rounded-full flex items-center justify-center mb-3">
                      <span className="text-sm font-bold text-white">4</span>
                    </div>
                    <p className="text-gray-600">
                      <strong>Professionalism</strong> - We treat you and your items with respect and care.
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] w-8 h-8 rounded-full flex items-center justify-center mb-3">
                      <span className="text-sm font-bold text-white">5</span>
                    </div>
                    <p className="text-gray-600">
                      <strong>Transparency</strong> - We maintain clear communication and avoid hidden fees or
                      conditions.
                    </p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.1}>
              <div className="bg-gray-50 p-8 rounded-xl">
                <h2 className="section-header mb-4">Who We Serve</h2>
                <div className="relative w-full max-w-md mx-auto aspect-[16/9] rounded-xl overflow-hidden mb-6">
                  <Image src="/placeholder.svg?key=pmis4" alt="Who We Serve" fill className="object-cover" />
                </div>
                <p className="text-gray-600 mb-4">
                  BluBerry is designed for anyone seeking a convenient selling solution, with particular benefits for:
                </p>
                <ul className="space-y-2 text-gray-600 max-w-md mx-auto text-center">
                  <li>Individuals who value efficiency and convenience</li>
                  <li>Those who prefer personal service over digital marketplaces</li>
                  <li>People seeking prompt payment for their items</li>
                  <li>Anyone looking to simplify the decluttering process</li>
                </ul>
              </div>
            </ContentAnimation>

            <ContentAnimation>
              <div className="text-center mt-12">
                <h2 className="section-header mb-4">Begin Your Selling Experience</h2>
                <p className="text-xl mb-6">
                  Let us help you convert unused items into value with our professional service.
                </p>
                <Link href="/sell-item" className="apple-button apple-button-primary">
                  Start Selling Today
                </Link>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>
    </div>
  )
}
