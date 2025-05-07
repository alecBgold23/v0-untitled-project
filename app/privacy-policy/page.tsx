import Link from "next/link"
import ContentAnimation from "@/components/content-animation"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ContentAnimation>
          <h1 className="page-header mb-6">Privacy Policy</h1>
        </ContentAnimation>
        <ContentAnimation delay={0.1}>
          <p className="text-lg mb-8">Last Updated: May 4, 2025</p>
        </ContentAnimation>

        <div className="space-y-8">
          <ContentAnimation delay={0.2}>
            <section>
              <h2 className="section-header mb-4">1. Introduction</h2>
              <p>
                Welcome to BluBerry ("we," "our," or "us"). We are committed to protecting your privacy and handling
                your personal information with transparency and care. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our services, website, and mobile application.
              </p>
              <p className="mt-2">
                By using our services, you agree to the collection and use of information in accordance with this
                policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>
          </ContentAnimation>

          <ContentAnimation delay={0.25}>
            <section>
              <h2 className="section-header mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium mb-2 text-[#3B82F6]">2.1 Personal Information</h3>
              <p>We may collect personal information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Contact information (such as name, email address, phone number, and ZIP code)</li>
                <li>Information about items you wish to sell (including descriptions and photographs)</li>
                <li>Communication records when you contact our customer service</li>
                <li>Payment information (though we do not store complete credit card information)</li>
              </ul>

              <h3 className="text-xl font-medium mb-2 mt-4 text-[#3B82F6]">2.2 Automatically Collected Information</h3>
              <p>When you access or use our services, we may automatically collect information about you, including:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Device information (such as IP address, browser type, and operating system)</li>
                <li>Usage information (such as pages visited, time spent on pages, and links clicked)</li>
                <li>Location information (with your consent, if required by applicable law)</li>
              </ul>
            </section>
          </ContentAnimation>

          <ContentAnimation delay={0.3}>
            <section>
              <h2 className="section-header mb-4">3. How We Use Your Information</h2>
              <p>We use the information we collect for various purposes, including to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Communicate with you about our services, offers, and promotions</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>
          </ContentAnimation>

          <ContentAnimation delay={0.35}>
            <section>
              <h2 className="section-header mb-4">4. Sharing of Information</h2>
              <p>We may share your personal information in the following circumstances:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>With service providers who perform services on our behalf</li>
                <li>With professional advisors, such as lawyers, auditors, and insurers</li>
                <li>
                  In connection with, or during negotiations of, any merger, sale of company assets, financing, or
                  acquisition
                </li>
                <li>
                  If we believe disclosure is necessary to comply with any applicable law, regulation, legal process, or
                  governmental request
                </li>
                <li>To protect the rights, property, and safety of BluBerry, our customers, or others</li>
              </ul>
            </section>
          </ContentAnimation>

          <ContentAnimation delay={0.4}>
            <section>
              <h2 className="section-header mb-4">5. Your Choices</h2>
              <p>You have several choices regarding the information you provide to us:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>You can access, update, or delete your account information by contacting us</li>
                <li>
                  You can opt out of receiving promotional communications from us by following the instructions in those
                  communications
                </li>
                <li>
                  You can choose not to provide certain information, though this may limit your ability to use certain
                  features of our services
                </li>
              </ul>
            </section>
          </ContentAnimation>

          <ContentAnimation delay={0.45}>
            <section>
              <h2 className="section-header mb-4">6. Data Security</h2>
              <p>
                We take reasonable measures to help protect your personal information from loss, theft, misuse,
                unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over
                the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>
          </ContentAnimation>

          <ContentAnimation delay={0.5}>
            <section>
              <h2 className="section-header mb-4">7. Children's Privacy</h2>
              <p>
                Our services are not directed to children under 13, and we do not knowingly collect personal information
                from children under 13. If we learn we have collected personal information from a child under 13, we
                will delete that information.
              </p>
            </section>
          </ContentAnimation>

          <ContentAnimation delay={0.55}>
            <section>
              <h2 className="section-header mb-4">8. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. If we make material changes, we will notify you by
                email or through a notice on our website prior to the change becoming effective. We encourage you to
                review this Privacy Policy periodically.
              </p>
            </section>
          </ContentAnimation>

          <ContentAnimation delay={0.6}>
            <section>
              <h2 className="section-header mb-4">9. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <p className="mt-2">
                <strong>Email:</strong>{" "}
                <a href="mailto:alecgold808@gmail.com" className="text-[#3B82F6]">
                  alecgold808@gmail.com
                </a>
              </p>
              <p>
                <strong>Phone:</strong> 847-510-3229
              </p>
            </section>
          </ContentAnimation>
        </div>

        <ContentAnimation delay={0.65}>
          <div className="mt-12 text-center">
            <div className="inline-block">
              <Link href="/" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-md">
                Return to Home
              </Link>
            </div>
          </div>
        </ContentAnimation>
      </div>
    </div>
  )
}
