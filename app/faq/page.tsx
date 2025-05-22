import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ContentAnimation from "@/components/content-animation"
import { ArrowRight } from "lucide-react"

export default function FAQPage() {
  return (
    <div className="bg-background">
      {/* Hero Section with elegant gradient */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-background via-background to-secondary/30">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center font-[var(--font-roboto)] font-light tracking-tight">
              <span className="bg-gradient-to-r from-[#4361ee] via-[#7209b7] to-[#3a0ca3] bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="text-lg md:text-xl text-center max-w-2xl mx-auto text-muted-foreground">
              Find answers to common questions about BluBerry's services.
            </p>
          </ContentAnimation>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <ContentAnimation delay={0.2}>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg p-2 shadow-sm bg-card">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  What is BluBerry?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">
                  BlueBerry is a convenient service that picks up your used items, prices them, lists them online, and
                  sells them for you. You don't have to lift a finger — we handle everything from pickup to payment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg p-2 shadow-sm bg-card">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  How do I submit my items?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">
                  Just fill out our quick online form (linked on our website), and we'll schedule a free pickup or give
                  you instructions on how to drop off your item.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg p-2 shadow-sm bg-card">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  What types of items can I send?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">
                  We accept clothing, electronics, small furniture, accessories, collectibles, and much more! If you're
                  unsure, you can check our submission guidelines or contact us.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg p-2 shadow-sm bg-card">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  Is there anything BluBerry doesn't accept?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">
                  Yes, we cannot accept broken items, recalled products, or anything prohibited by resale platforms
                  (like hazardous materials or heavily damaged goods).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg p-2 shadow-sm bg-card">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  How do I get paid?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">
                  You get paid as soon as we pick up your item, and after we verify that it is exactly the same as
                  described online.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-lg p-2 shadow-sm bg-card">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  What does it cost to use BluBerry?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">
                  BlueBerry operates on a commission basis. We deduct a small percentage from the final sale price — no
                  upfront costs for you!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-lg p-2 shadow-sm bg-card">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  How is pricing decided?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">
                  Our AI software automatically researches real-time market data to set competitive prices. You can also
                  request a custom pricing review if you prefer.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border rounded-lg p-2 shadow-sm bg-card">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  Can I cancel a submission?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">
                  You can cancel up to 24 hours before pickup. After pickup, cancellation may not be possible since your
                  items may already be listed.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="border rounded-lg p-2 shadow-sm bg-card">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  Is BluBerry available nationwide?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">
                  We're expanding! Currently, we operate in Chicago but plan to offer full nationwide service soon.
                  Check our service area map on the website.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="border rounded-lg p-2 shadow-sm bg-card">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  How is BluBerry different?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">
                  We make the listing process more manageable, come directly to you, and pay you regardless of whether
                  your item sells.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ContentAnimation>

          <ContentAnimation delay={0.3}>
            <div className="mt-10 text-center">
              <p className="text-muted-foreground mb-4">Still have questions? We're here to help!</p>
              <div className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] p-[2px] rounded-lg">
                <Link
                  href="/contact"
                  className="inline-flex items-center bg-card hover:bg-secondary transition-colors px-4 py-2 rounded-lg font-medium text-foreground group text-sm"
                >
                  Contact Us
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
