"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import ConfettiEffect from "@/components/confetti-effect"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    setIsFormValid(name.trim() !== "" && email.trim() !== "" && message.trim() !== "")
  }, [name, email, message])

  const validateForm = () => {
    const errors = {}
    if (!name.trim()) errors.name = "Name required"
    if (!email.trim()) errors.email = "Email required"
    if (!message.trim()) errors.message = "Message required"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError("")

    if (validateForm()) {
      setIsSubmitting(true)
      try {
        const response = await fetch("/api/send-contact-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message }),
        })

        const result = await response.json()

        if (response.ok) {
          setIsSubmitting(false)
          setIsSubmitted(true)
          setShowConfetti(true)
          setName("")
          setEmail("")
          setMessage("")
        } else {
          throw new Error(result.error || "Failed to send message")
        }
      } catch (error) {
        console.error("Error submitting form:", error)
        setIsSubmitting(false)
        setSubmitError("Error sending message. Please try again.")
      }
    }
  }

  const ErrorMessage = ({ message }) => (
    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
      <AlertCircle className="h-3 w-3" />
      <span>{message}</span>
    </div>
  )

  return (
    <div className="bg-background">
      {showConfetti && <ConfettiEffect duration={3000} onComplete={() => setShowConfetti(false)} />}

      {/* Condensed Header */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-[#4f7bff] via-[#a855f7] to-[#6366f1] bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
          </ContentAnimation>
        </div>
      </section>

      {/* Condensed Contact Section */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <ContentAnimation>
              <div>
                <h2 className="text-xl font-medium mb-4 text-foreground">Contact Info</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2">
                    <Mail className="w-4 h-4 text-[#4f7bff]" />
                    <p className="text-foreground/80">alecgold808@gmail.com</p>
                  </div>
                  <div className="flex items-center gap-3 p-2">
                    <Phone className="w-4 h-4 text-[#a855f7]" />
                    <p className="text-foreground/80">847-510-3229</p>
                  </div>
                </div>

                {/* FAQ Mini Section */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">FAQ</h3>
                  <div className="text-sm text-foreground/80">
                    <p className="mb-1">
                      <strong>What items do you accept?</strong> Furniture, electronics, appliances, sporting equipment,
                      and more.
                    </p>
                    <p>
                      <strong>Payment methods:</strong> Cash, check, Venmo, or PayPal.
                    </p>
                  </div>
                </div>
              </div>
            </ContentAnimation>

            {/* Form */}
            <ContentAnimation delay={0.1}>
              {!isSubmitted ? (
                <form
                  className="space-y-4 bg-white/80 dark:bg-slate-800/80 p-4 rounded-lg shadow-sm border border-[#a855f7]/20"
                  onSubmit={handleSubmit}
                >
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`${formErrors.name ? "border-red-500" : ""}`}
                      required
                    />
                    {formErrors.name && <ErrorMessage message={formErrors.name} />}
                  </div>

                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${formErrors.email ? "border-red-500" : ""}`}
                      required
                    />
                    {formErrors.email && <ErrorMessage message={formErrors.email} />}
                  </div>

                  <div className="relative">
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your message..."
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`${formErrors.message ? "border-red-500" : ""}`}
                      required
                    />
                    {formErrors.message && <ErrorMessage message={formErrors.message} />}
                  </div>

                  {submitError && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-lg text-sm">
                      {submitError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="w-full bg-gradient-to-r from-[#4f7bff] via-[#a855f7] to-[#6366f1]"
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
              ) : (
                <div className="text-center py-6 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-sm border border-[#a855f7]/20 p-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h2 className="text-xl font-medium mb-2 text-foreground">Message Sent!</h2>
                  <p className="text-foreground/80 mb-4">Thank you for contacting us. We'll respond within 24 hours.</p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    size="sm"
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    Send Another
                  </Button>
                </div>
              )}
            </ContentAnimation>
          </div>
        </div>
      </section>
    </div>
  )
}
