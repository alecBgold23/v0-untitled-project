"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Mail, Phone, Clock, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import Image from "next/image"
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
        // Format the message with all form details
        const formattedMessage = `
Name: ${name}
Email: ${email}
Inquiry Type: ${inquiryType}
Message:
${message}

Submitted: ${new Date().toLocaleString()}
        `

        // Send to the recipient (BluBerry)
        const recipientResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "alecgold808@gmail.com", // Your email address
            subject: `New Contact Form: ${inquiryType} from ${name}`,
            message: formattedMessage,
          }),
        })

        // Send confirmation to the user
        const userResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email, // User's email address
            subject: "Thank you for contacting BluBerry",
            message: `
Dear ${name},

Thank you for contacting BluBerry. We have received your message and will get back to you within 24 hours.

Your inquiry details:
- Type: ${inquiryType}
- Message: ${message}

Best regards,
The BluBerry Team
            `,
          }),
        })

        if (recipientResponse.ok) {
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
          throw new Error("Form submission failed")
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
    <div>
      {showConfetti && <ConfettiEffect duration={3000} onComplete={() => setShowConfetti(false)} />}

      {/* Hero Section */}
      <section className="apple-section bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="page-header">Contact Us</h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="apple-subheading mb-8">
              Have questions about our services? Our team is available to assist you.
            </p>
          </ContentAnimation>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            <ContentAnimation>
              <div className="text-center">
                <h2 className="section-header mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <Phone className="w-5 h-5 text-[#3B82F6] mb-2" />
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-gray-600">847-510-3229</p>
                    <p className="text-sm text-gray-500 mt-1">Monday-Friday, 9am-5pm EST</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <Mail className="w-5 h-5 text-[#8A4FFF] mb-2" />
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">alecgold808@gmail.com</p>
                    <p className="text-sm text-gray-500 mt-1">Response within 24 hours</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <Clock className="w-5 h-5 text-[#3B82F6] mb-2" />
                    <h3 className="font-medium">Hours</h3>
                    <p className="text-gray-600">Monday-Friday: 9am-5pm EST</p>
                    <p className="text-gray-600">Saturday: 10am-2pm EST</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>

                  <div className="relative w-full h-48 rounded-xl overflow-hidden mt-4">
                    <Image src="/placeholder.svg?key=sbgcf" alt="Customer Support" fill className="object-cover" />
                  </div>
                </div>
              </div>
            </ContentAnimation>

            <ContentAnimation delay={0.1}>
              <div className="text-center">
                {!isSubmitted ? (
                  <>
                    <h2 className="section-header mb-6">Send a Message</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`mt-1 rounded-lg ${formErrors.name ? "border-red-500" : "border-gray-300"}`}
                          required
                        />
                        {formErrors.name && <ErrorMessage message={formErrors.name} />}
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`mt-1 rounded-lg ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
                          required
                        />
                        {formErrors.email && <ErrorMessage message={formErrors.email} />}
                      </div>

                      <div>
                        <Label htmlFor="inquiry-type" className="text-sm font-medium text-gray-700">
                          Type of Inquiry <span className="text-red-500">*</span>
                        </Label>
                        <Select value={inquiryType} onValueChange={setInquiryType} name="inquiryType" required>
                          <SelectTrigger
                            id="inquiry-type"
                            className={`mt-1 rounded-lg ${formErrors.inquiryType ? "border-red-500" : "border-gray-300"}`}
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
                        <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                          Message <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="How can we help you?"
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className={`mt-1 rounded-lg ${formErrors.message ? "border-red-500" : "border-gray-300"}`}
                          required
                        />
                        {formErrors.message && <ErrorMessage message={formErrors.message} />}
                      </div>

                      {submitError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
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
                  <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-100 p-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Message Sent!</h2>
                    <p className="text-gray-600 mb-6">
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
      <section className="apple-section bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <ContentAnimation>
            <h2 className="page-header mb-12">Frequently Asked Questions</h2>
          </ContentAnimation>
          <div className="space-y-8">
            <ContentAnimation delay={0.1}>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">What types of items do you accept?</h3>
                <p className="text-gray-600">
                  We accept a wide variety of quality used items in good condition, including furniture, electronics,
                  appliances, sporting equipment, musical instruments, tools, and collectibles.
                </p>
              </div>
            </ContentAnimation>
            <ContentAnimation delay={0.2}>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">How do you determine the price for my item?</h3>
                <p className="text-gray-600">
                  We evaluate factors such as the item's condition, age, brand, current market value, and demand to
                  offer you a competitive price.
                </p>
              </div>
            </ContentAnimation>
            <ContentAnimation delay={0.3}>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">How soon can you pick up my item?</h3>
                <p className="text-gray-600">
                  Upon acceptance of our offer, we typically schedule pickup within 2-3 business days, depending on your
                  location and availability.
                </p>
              </div>
            </ContentAnimation>
            <ContentAnimation delay={0.4}>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">What payment methods do you offer?</h3>
                <p className="text-gray-600">
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
