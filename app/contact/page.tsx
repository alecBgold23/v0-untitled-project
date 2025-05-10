"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, AlertCircle, CheckCircle, Loader2, User, MessageSquare } from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import ConfettiEffect from "@/components/confetti-effect"

export default function ContactPage() {
  // Update the state variables to remove inquiryType
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Update the useEffect to remove inquiryType from validation
  useEffect(() => {
    setIsFormValid(name.trim() !== "" && email.trim() !== "" && message.trim() !== "")
  }, [name, email, message])

  // Update the validateForm function to remove inquiryType
  const validateForm = () => {
    const errors = {}

    if (!name.trim()) errors.name = "Please enter your name"
    if (!email.trim()) errors.email = "Please enter your email address"
    if (!message.trim()) errors.message = "Please enter your message"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Update the handleSubmit function to remove inquiryType
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError("")

    if (validateForm()) {
      setIsSubmitting(true)

      try {
        // Send email using the new API endpoint
        const response = await fetch("/api/send-contact-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            message,
          }),
        })

        const result = await response.json()

        if (response.ok) {
          // Show success state
          setIsSubmitting(false)
          setIsSubmitted(true)
          setShowConfetti(true)

          // Reset form
          setName("")
          setEmail("")
          setMessage("")
        } else {
          throw new Error(result.error || "Failed to send message")
        }
      } catch (error) {
        console.error("Error submitting form:", error)
        setIsSubmitting(false)
        setSubmitError("There was an error submitting your message. Please try again or contact us directly.")
      }
    }
  }

  const ErrorMessage = ({ message }) => (
    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )

  return (
    <div className="bg-background">
      {showConfetti && <ConfettiEffect duration={3000} onComplete={() => setShowConfetti(false)} />}

      {/* Hero Section */}
      <section className="apple-section bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="page-header font-[var(--font-roboto)] font-light tracking-tight">
              <span className="bg-gradient-to-r from-[#4f7bff] via-[#a855f7] to-[#6366f1] bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="apple-subheading text-muted-foreground mb-8">
              Have questions about our services? Our team is available to assist you.
            </p>
          </ContentAnimation>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact information section */}
            <ContentAnimation>
              <div className="text-center md:text-left">
                <h2 className="section-header mb-8 font-[var(--font-roboto)] font-light tracking-tight text-foreground">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-3 transition-all duration-300 p-4 rounded-xl hover:bg-muted/50">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#4f7bff] to-[#a855f7] text-white shadow-md">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Email</h3>
                      <p className="text-foreground/80">alecgold808@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-3 transition-all duration-300 p-4 rounded-xl hover:bg-muted/50">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#a855f7] to-[#6366f1] text-white shadow-md">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Phone</h3>
                      <p className="text-foreground/80">847-510-3229</p>
                    </div>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            {/* Stylish form section */}
            <ContentAnimation delay={0.1}>
              <div>
                {!isSubmitted ? (
                  <>
                    <h2 className="section-header mb-8 font-[var(--font-roboto)] font-light tracking-tight text-foreground text-center md:text-left">
                      Send a Message
                    </h2>
                    <form
                      className="space-y-5 bg-card/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-border/50"
                      onSubmit={handleSubmit}
                    >
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <User className="w-5 h-5" />
                        </div>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`pl-12 py-6 rounded-xl border-muted bg-background/50 backdrop-blur-sm ${
                            formErrors.name ? "border-red-500" : "border-input"
                          }`}
                          required
                        />
                        {formErrors.name && <ErrorMessage message={formErrors.name} />}
                      </div>

                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Mail className="w-5 h-5" />
                        </div>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Your Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`pl-12 py-6 rounded-xl border-muted bg-background/50 backdrop-blur-sm ${
                            formErrors.email ? "border-red-500" : "border-input"
                          }`}
                          required
                        />
                        {formErrors.email && <ErrorMessage message={formErrors.email} />}
                      </div>

                      <div className="relative">
                        <div className="absolute left-3 top-6 text-muted-foreground">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="How can we help you? Type your message here..."
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className={`pl-12 pt-6 rounded-xl border-muted bg-background/50 backdrop-blur-sm ${
                            formErrors.message ? "border-red-500" : "border-input"
                          }`}
                          required
                        />
                        {formErrors.message && <ErrorMessage message={formErrors.message} />}
                      </div>

                      {submitError && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                          <AlertCircle className="inline-block h-4 w-4 mr-2" />
                          {submitError}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className="w-full py-6 rounded-xl bg-gradient-to-r from-[#4f7bff] via-[#a855f7] to-[#6366f1] hover:opacity-95 transition-opacity"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Message"
                        )}
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-8 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm border border-border/50 p-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-medium mb-3 text-foreground">Message Sent!</h2>
                    <p className="text-foreground/80 mb-6">
                      Thank you for contacting BluBerry. We'll respond within 24 hours.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="rounded-xl px-6 py-2 border-primary/30 hover:bg-primary/10"
                    >
                      Send Another Message
                    </Button>
                  </div>
                )}
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="apple-section bg-muted/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <ContentAnimation>
            <h2 className="page-header mb-12 font-[var(--font-roboto)] font-light tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </ContentAnimation>
          <div className="space-y-8">
            <ContentAnimation delay={0.1}>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-foreground font-[var(--font-roboto)]">
                  What types of items do you accept?
                </h3>
                <p className="text-foreground/80">
                  We accept a wide variety of quality used items in good condition, including furniture, electronics,
                  appliances, sporting equipment, musical instruments, tools, and collectibles.
                </p>
              </div>
            </ContentAnimation>
            <ContentAnimation delay={0.2}>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-foreground font-[var(--font-roboto)]">
                  How do you determine the price for my item?
                </h3>
                <p className="text-foreground/80">
                  We evaluate factors such as the item's condition, age, brand, current market value, and demand to
                  offer you a competitive price.
                </p>
              </div>
            </ContentAnimation>
            <ContentAnimation delay={0.3}>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-foreground font-[var(--font-roboto)]">
                  How soon can you pick up my item?
                </h3>
                <p className="text-foreground/80">
                  Upon acceptance of our offer, we typically schedule pickup within 2-3 business days, depending on your
                  location and availability.
                </p>
              </div>
            </ContentAnimation>
            <ContentAnimation delay={0.4}>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-foreground font-[var(--font-roboto)]">
                  What payment methods do you offer?
                </h3>
                <p className="text-foreground/80">
                  We provide payment via cash, check, or digital payment methods such as Venmo or PayPal, according to
                  your preference.
                </p>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>
    </div>
  )
}
