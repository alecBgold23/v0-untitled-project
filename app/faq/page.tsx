import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ContentAnimation from "@/components/content-animation"

export default function FAQPage() {
  return (
    <div>
      {/* Minimized Hero Section */}
      <section className="py-8 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="page-header text-center">Frequently Asked Questions</h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="text-gray-600 text-center mt-2 mb-0">
              Find answers to common questions about BluBerry's services.
            </p>
          </ContentAnimation>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <ContentAnimation delay={0.2}>
            <Accordion type="single" collapsible className="space-y-6">
              <AccordionItem value="item-1" className="border rounded-lg p-2 shadow-sm">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  What is BluBerry?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-gray-600">
                  BlueBerry is a convenient service that picks up your used items, prices them, lists them online, and
                  sells them for you. You don't have to lift a finger — we handle everything from pickup to payment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg p-2 shadow-sm">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  How do I submit my items?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-gray-600">
                  Just fill out our quick online form (linked on our website), and we'll schedule a free pickup or give
                  you instructions on how to drop off your item.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg p-2 shadow-sm">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  What types of items can I send?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-gray-600">
                  We accept clothing, electronics, small furniture, accessories, collectibles, and much more! If you're
                  unsure, you can check our submission guidelines or contact us.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg p-2 shadow-sm">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  Is there anything BluBerry doesn't accept?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-gray-600">
                  Yes, we cannot accept broken items, recalled products, or anything prohibited by resale platforms
                  (like hazardous materials or heavily damaged goods).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg p-2 shadow-sm">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  How do I get paid?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-gray-600">
                  You get paid as soon as we pick up your item, and after we verify that it is exactly the same as
                  described online.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-lg p-2 shadow-sm">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  What does it cost to use BluBerry?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-gray-600">
                  BlueBerry operates on a commission basis. We deduct a small percentage from the final sale price — no
                  upfront costs for you!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-lg p-2 shadow-sm">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  How is pricing decided?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-gray-600">
                  Our AI software automatically researches real-time market data to set competitive prices. You can also
                  request a custom pricing review if you prefer.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border rounded-lg p-2 shadow-sm">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  Can I cancel a submission?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-gray-600">
                  You can cancel up to 24 hours before pickup. After pickup, cancellation may not be possible since your
                  items may already be listed.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="border rounded-lg p-2 shadow-sm">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  Is BluBerry available nationwide?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-gray-600">
                  We're expanding! Currently, we operate in Chicago but plan to offer full nationwide service soon.
                  Check our service area map on the website.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="border rounded-lg p-2 shadow-sm">
                <AccordionTrigger className="text-lg font-medium text-[#3B82F6] hover:text-[#0066ff] px-4">
                  How is BluBerry different?
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-gray-600">
                  We make the listing process more manageable, come directly to you, and pay you regardless of whether
                  your item sells.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ContentAnimation>

          <ContentAnimation delay={0.3}>
            <div className="mt-10 text-center">
              <p className="text-gray-600 mb-4">Still have questions? We're here to help!</p>
              <Link href="/contact" className="apple-button apple-button-primary">
                Contact Us
              </Link>
            </div>
          </ContentAnimation>
        </div>
      </section>
    </div>
  )
}
