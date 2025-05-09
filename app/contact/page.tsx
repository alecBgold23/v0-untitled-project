"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Mail, Phone, Clock, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import ConfettiEffect from "@/components/confetti-effect"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [inquiryType, setInquiryType] = useState("")
  const [message, setMessage] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    setIsFormValid(name.trim() !== "" && email.trim() !== "" && inquiryType !== "" && message.trim() !== "")
  }, [name, email, inquiryType, message])

  const validateForm = () => {
    const errors = {}

    if (!name.trim()) errors.name = "Please enter your name"
    if (!email.trim()) errors.email = "Please enter your email address"
    if (!inquiryType) errors.inquiryType = "Please select an inquiry type"
    if (!message.trim()) errors.message = "Please enter your message"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

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
            inquiryType,
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
          setInquiryType("")
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
            <h1 className="page-header text-white dark:text-white">Contact Us</h1>
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
            <ContentAnimation>
              <div className="text-center">
                <h2 className="section-header text-foreground mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <Phone className="w-5 h-5 text-[#3B82F6] mb-2" />
                    <h3 className="font-medium text-foreground">Phone</h3>
                    <p className="text-foreground/80">847-510-3229</p>
                    <p className="text-sm text-muted-foreground mt-1">Monday-Friday, 9am-5pm EST</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <Mail className="w-5 h-5 text-[#8A4FFF] mb-2" />
                    <h3 className="font-medium text-foreground">Email</h3>
                    <p className="text-foreground/80">alecgold808@gmail.com</p>
                    <p className="text-sm text-muted-foreground mt-1">Response within 24 hours</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <Clock className="w-5 h-5 text-[#3B82F6] mb-2" />
                    <h3 className="font-medium text-foreground">Hours</h3>
                    <p className="text-foreground/80">Monday-Friday: 9am-5pm EST</p>
                    <p className="text-foreground/80">Saturday: 10am-2pm EST</p>
                    <p className="text-foreground/80">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.1}>
              <div className="text-center">
                {!isSubmitted ? (
                  <>
                    <h2 className="section-header text-foreground mb-6">Send a Message</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-foreground">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`mt-1 rounded-lg ${formErrors.name ? "border-red-500" : "border-input"}`}
                          required
                        />
                        {formErrors.name && <ErrorMessage message={formErrors.name} />}
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`mt-1 rounded-lg ${formErrors.email ? "border-red-500" : "border-input"}`}
                          required
                        />
                        {formErrors.email && <ErrorMessage message={formErrors.email} />}
                      </div>

                      <div>
                        <Label htmlFor="inquiry-type" className="text-sm font-medium text-foreground">
                          Type of Inquiry <span className="text-red-500">*</span>
                        </Label>
                        <Select value={inquiryType} onValueChange={setInquiryType} name="inquiryType" required>
                          <SelectTrigger
                            id="inquiry-type"
                            className={`mt-1 rounded-lg ${formErrors.inquiryType ? "border-red-500" : "border-input"}`}
                          >
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="selling">Question about selling</SelectItem>
                            <SelectItem value="pickup">Question about pickup</SelectItem>
                            <SelectItem value="payment">Question about payment</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.inquiryType && <ErrorMessage message={formErrors.inquiryType} />}
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-sm font-medium text-foreground">
                          Message <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="How can we help you?"
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className={`mt-1 rounded-lg ${formErrors.message ? "border-red-500" : "border-input"}`}
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
                        className="apple-button apple-button-primary w-full gradient-button hover:bg-white hover:text-[#0071e3] hover:border hover:border-[#0071e3] transition-all duration-300"
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
                  <div className="text-center py-12 bg-card rounded-xl shadow-sm border border-border p-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-all duration-500 hover:scale-105">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-light mb-4 text-foreground tracking-wider">
                      Message Sent!
                    </h2>
                    <div className="w-32 h-1 mx-auto mb-6 bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#2563eb] rounded-full shadow-sm"></div>
                    <p className="text-lg mb-8 text-foreground/80">
                      Thank you for contacting BluBerry. Your message has been received and we'll respond within 24
                      hours.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 rounded-lg px-6 py-2"
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
            <h2 className="page-header text-white dark:text-white mb-12">Frequently Asked Questions</h2>
          </ContentAnimation>
          <div className="space-y-8">
            <ContentAnimation delay={0.1}>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-foreground">What types of items do you accept?</h3>
                <p className="text-foreground/80">
                  We accept a wide variety of quality used items in good condition, including furniture, electronics,
                  appliances, sporting equipment, musical instruments, tools, and collectibles.
                </p>
              </div>
            </ContentAnimation>
            <ContentAnimation delay={0.2}>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-foreground">
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
                <h3 className="text-xl font-semibold mb-2 text-foreground">How soon can you pick up my item?</h3>
                <p className="text-foreground/80">
                  Upon acceptance of our offer, we typically schedule pickup within 2-3 business days, depending on your
                  location and availability.
                </p>
              </div>
            </ContentAnimation>
            <ContentAnimation delay={0.4}>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-foreground">What payment methods do you offer?</h3>
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
