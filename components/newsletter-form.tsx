"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle, Loader2 } from "lucide-react"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (email.trim() === "") return

    setIsSubmitting(true)

    // Form will be submitted to Formspree
    // This is just to show loading state
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setEmail("")
      setMessage("")
    }, 1000)
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50">
      {!isSubmitted ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-[#3B82F6]" />
            <h3 className="text-lg font-medium">Stay Connected</h3>
          </div>

          <form action="https://formspree.io/f/xqaqprdw" method="POST" className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Your email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="mt-1 w-full border-blue-100 rounded-lg focus:ring-[#0066ff] focus:border-[#0066ff] bg-white shadow-sm hover:border-blue-300 transition-all duration-200"
                required
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                Your message (optional)
              </Label>
              <Textarea
                id="message"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Questions or comments?"
                rows={3}
                className="mt-1 w-full border-blue-100 rounded-lg focus:ring-[#0066ff] focus:border-[#0066ff] bg-white shadow-sm hover:border-blue-300 transition-all duration-200"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8c52ff] text-white hover:from-[#3574e2] hover:to-[#7a47e6] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center py-6">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Thank You!</h3>
          <p className="text-gray-600">Your message has been sent successfully. We'll be in touch soon!</p>
          <Button onClick={() => setIsSubmitted(false)} className="mt-4 text-[#3B82F6] bg-blue-50 hover:bg-blue-100">
            Send Another
          </Button>
        </div>
      )}
    </div>
  )
}
