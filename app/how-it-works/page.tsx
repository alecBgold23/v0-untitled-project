import Link from "next/link"
import Image from "next/image"
import ContentAnimation from "@/components/content-animation"

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="apple-section bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="page-header">How BluBerry Works</h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="apple-subheading mb-8">
              Our streamlined process makes selling your items efficient and hassle-free.
            </p>
          </ContentAnimation>
          <ContentAnimation delay={0.2}>
            <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] rounded-2xl overflow-hidden">
              <Image
                src="/placeholder.svg?key=tf4ku"
                alt="BluBerry Process Overview"
                fill
                className="object-cover"
                priority
              />
            </div>
          </ContentAnimation>
        </div>
      </section>

      {/* Process Steps - Updated with professional Roboto font */}
      <section className="py-16 md:py-24 bg-black text-white font-[var(--font-roboto)]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-24">
            <ContentAnimation>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                    <Image src="/placeholder.svg?key=exrom" alt="Submit Your Item" fill className="object-cover" />
                  </div>
                </div>
                <div className="md:w-1/2 text-center md:text-left">
                  <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center mb-6 mx-auto md:mx-0">
                    <span className="text-2xl font-normal text-white">1</span>
                  </div>
                  <h2 className="text-2xl font-medium mb-4 tracking-tight white-header">Submit Your Item</h2>
                  <p className="text-gray-300 mb-4 font-normal leading-relaxed">
                    Complete our straightforward form with basic information about your item. We've simplified this step
                    to eliminate the need for extensive photography or detailed descriptions.
                  </p>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-gray-400 italic text-center">
                      "The submission process was remarkably efficient. I completed the form in minutes without needing
                      to take photos." — Mary S.
                    </p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.1}>
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="md:w-1/2">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                    <Image src="/placeholder.svg?key=sho2m" alt="Receive a Fair Offer" fill className="object-cover" />
                  </div>
                </div>
                <div className="md:w-1/2 text-center md:text-left">
                  <div className="w-16 h-16 rounded-full bg-[#8A4FFF] flex items-center justify-center mb-6 mx-auto md:mx-0">
                    <span className="text-2xl font-normal text-white">2</span>
                  </div>
                  <h2 className="text-2xl font-medium mb-4 tracking-tight white-header">Receive a Fair Offer</h2>
                  <p className="text-gray-300 mb-4 font-normal leading-relaxed">
                    Within 24 hours, our team evaluates your submission and provides a competitive offer based on the
                    item's condition and current market value, eliminating the need for negotiation.
                  </p>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-gray-400 italic text-center">
                      "The offer for my dining set exceeded my expectations and reflected fair market value." — Robert
                      T.
                    </p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                    <Image src="/placeholder.svg?key=8tlz8" alt="Schedule a Pickup" fill className="object-cover" />
                  </div>
                </div>
                <div className="md:w-1/2 text-center md:text-left">
                  <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center mb-6 mx-auto md:mx-0">
                    <span className="text-2xl font-normal text-white">3</span>
                  </div>
                  <h2 className="text-2xl font-medium mb-4 tracking-tight white-header">Schedule a Pickup</h2>
                  <p className="text-gray-300 mb-4 font-normal leading-relaxed">
                    Upon accepting our offer, we arrange a convenient pickup time. Our professional team comes to your
                    location, eliminating transportation concerns on your part.
                  </p>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-gray-400 italic text-center">
                      "The pickup team arrived precisely on schedule and handled the collection process with
                      professionalism and care." — Linda M.
                    </p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.1}>
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="md:w-1/2">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                    <Image src="/placeholder.svg?key=l53g2" alt="Immediate Payment" fill className="object-cover" />
                  </div>
                </div>
                <div className="md:w-1/2 text-center md:text-left">
                  <div className="w-16 h-16 rounded-full bg-[#8A4FFF] flex items-center justify-center mb-6 mx-auto md:mx-0">
                    <span className="text-2xl font-normal text-white">4</span>
                  </div>
                  <h2 className="text-2xl font-medium mb-4 tracking-tight white-header">Immediate Payment</h2>
                  <p className="text-gray-300 mb-4 font-normal leading-relaxed">
                    At the time of pickup, you receive immediate payment via your preferred method—cash, check, or
                    digital transfer—eliminating waiting periods for funds to clear.
                  </p>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-gray-400 italic text-center">
                      "I received payment immediately upon item collection, which was remarkably convenient." — James W.
                    </p>
                  </div>
                </div>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* Items We Accept - Updated to match black theme */}
      <section className="apple-section bg-black text-white">
        <div className="container mx-auto px-4">
          <h2 className="page-header white-header mb-8">Items We Accept</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-6">
                <Image src="/placeholder.svg?key=ufwrw" alt="Furniture" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Furniture</h3>
              <p className="text-gray-300">Sofas, tables, chairs, and more</p>
            </div>

            <div className="text-center">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-6">
                <Image src="/placeholder.svg?key=ilnnq" alt="Electronics" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Electronics</h3>
              <p className="text-gray-300">TVs, computers, tablets, and phones</p>
            </div>

            <div className="text-center">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-6">
                <Image src="/placeholder.svg?key=8ddum" alt="Appliances" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Appliances</h3>
              <p className="text-gray-300">Refrigerators, washers, and more</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="apple-section bg-white">
        <div className="container mx-auto px-4">
          <h2 className="page-header mb-4">Ready to Convert Items to Cash?</h2>
          <p className="apple-subheading mb-8">Begin our efficient process today and experience hassle-free selling.</p>
          <Link href="/sell-item" className="apple-button apple-button-primary">
            Sell Your Item Now
          </Link>
        </div>
      </section>
    </div>
  )
}
