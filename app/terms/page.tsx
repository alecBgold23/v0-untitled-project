import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import AnimatedSection from "@/components/animated-section"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | BluBerry",
  description: "Terms and conditions for using BluBerry's services.",
}

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <AnimatedSection className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Terms of Service</h1>
        <p className="text-muted-foreground">Last Updated: May 10, 2025</p>

        <div className="space-y-8 mt-8">
          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Introduction</h2>
            <p>
              Welcome to BluBerry. These Terms of Service ("Terms") govern your use of the BluBerry website, mobile
              applications, and services (collectively, the "Service"). By accessing or using our Service, you agree to
              be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
            </p>
          </section>

          <Separator />

          {/* Acceptance of Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Acceptance of Terms</h2>
            <p>
              By creating an account, using our website, or engaging our services, you acknowledge that you have read,
              understood, and agree to be bound by these Terms. These Terms apply to all visitors, users, and others who
              access or use the Service.
            </p>
          </section>

          <Separator />

          {/* Description of Service */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Description of Service</h2>
            <p>
              BluBerry provides a service that facilitates the selling of second-hand items by handling various aspects
              of the selling process including but not limited to: item pickup, pricing, listing, and customer service.
              The specific services provided may vary based on the service tier selected and geographic location.
            </p>
          </section>

          <Separator />

          {/* User Accounts */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information. Failure
              to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for any
              activities or actions under your password. You agree not to disclose your password to any third party. You
              must notify us immediately upon becoming aware of any breach of security or unauthorized use of your
              account.
            </p>
          </section>

          <Separator />

          {/* User Responsibilities */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information about items you wish to sell</li>
              <li>Ensure that you have legal ownership and the right to sell any items you submit</li>
              <li>Make items available for pickup at agreed-upon times</li>
              <li>Not submit prohibited items (as defined in our policies)</li>
              <li>Communicate promptly regarding scheduling and other service-related matters</li>
              <li>Pay any applicable fees as outlined in our pricing structure</li>
            </ul>
          </section>

          <Separator />

          {/* Payment Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Payment Terms</h2>
            <p>
              BluBerry will pay you for items sold according to the agreed-upon terms at the time of service engagement.
              Payment methods, timing, and any applicable fees will be clearly communicated before you agree to use our
              services.
            </p>
            <p>
              You acknowledge that BluBerry may deduct service fees, commission, or other charges as outlined in our
              pricing structure from the final sale amount of your items.
            </p>
          </section>

          <Separator />

          {/* Intellectual Property */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive
              property of BluBerry and its licensors. The Service is protected by copyright, trademark, and other laws
              of both the United States and foreign countries. Our trademarks and trade dress may not be used in
              connection with any product or service without the prior written consent of BluBerry.
            </p>
            <p>
              By submitting items for sale through our Service, you grant us the right to photograph, list, and market
              these items on various platforms to facilitate their sale.
            </p>
          </section>

          <Separator />

          {/* Limitation of Liability */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Limitation of Liability</h2>
            <p>
              In no event shall BluBerry, nor its directors, employees, partners, agents, suppliers, or affiliates, be
              liable for any indirect, incidental, special, consequential or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
            <p>Our liability is limited to the maximum extent permitted by law.</p>
          </section>

          <Separator />

          {/* Indemnification */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless BluBerry and its licensee and licensors, and their
              employees, contractors, agents, officers, and directors, from and against any and all claims, damages,
              obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's
              fees), resulting from or arising out of:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use and access of the Service</li>
              <li>Your violation of any term of these Terms</li>
              <li>
                Your violation of any third-party right, including without limitation any copyright, property, or
                privacy right
              </li>
              <li>Any claim that items you submitted caused damage to a third party</li>
            </ul>
          </section>

          <Separator />

          {/* Governing Law */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States, without
              regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms
              will not be considered a waiver of those rights.
            </p>
          </section>

          <Separator />

          {/* Changes to Terms */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">11. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision
              is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What
              constitutes a material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our Service after those revisions become effective, you agree to be bound
              by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </section>

          <Separator />

          {/* Termination */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">12. Termination</h2>
            <p>
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any
              reason whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which
              by their nature should survive termination shall survive termination, including, without limitation,
              ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <Separator />

          {/* Contact Information */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">13. Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us through our website contact form.</p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </AnimatedSection>
    </div>
  )
}
