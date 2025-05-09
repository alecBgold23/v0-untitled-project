"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Star, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import ContentAnimation from "@/components/content-animation"

// Sample reviews data (in a real app, this would come from a database)
const initialReviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    date: "April 15, 2025",
    comment:
      "BluBerry made selling my old furniture so easy! The team was professional and I got paid immediately upon pickup.",
    avatar: "/placeholder.svg?key=tcdlc",
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    rating: 4,
    date: "March 28, 2025",
    comment: "Great service overall. The pickup was scheduled quickly and everything went smoothly. Would use again!",
    avatar: "/placeholder.svg?key=46nna",
  },
  {
    id: 3,
    name: "Emily Chen",
    rating: 5,
    date: "March 10, 2025",
    comment:
      "I was amazed at how simple the process was. Submitted my items online, got an offer the next day, and had everything picked up within the week. Fantastic service!",
    avatar: "/placeholder.svg?key=walln",
  },
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(initialReviews)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [rating, setRating] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const validateForm = () => {
    const errors = {}
    if (!name.trim()) errors.name = "Please enter your name"
    if (!email.trim()) errors.email = "Please enter your email"
    if (!rating) errors.rating = "Please select a rating"
    if (!comment.trim()) errors.comment = "Please enter your review"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newReview = {
        id: reviews.length + 1,
        name,
        rating: Number.parseInt(rating),
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        comment,
        avatar: "/placeholder.svg?key=zmznp",
      }

      setReviews([newReview, ...reviews])
      setName("")
      setEmail("")
      setRating("")
      setComment("")
      setIsSubmitting(false)
      setSubmitSuccess(true)

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    }, 1500)
  }

  const StarRating = ({ value }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const ErrorMessage = ({ message }) => (
    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )

  return (
    <div className="bg-background">
      {/* Header Section */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="page-header text-center font-[var(--font-roboto)] font-light tracking-tight">
              <span className="bg-gradient-to-r from-[#4361ee] via-[#7209b7] to-[#3a0ca3] bg-clip-text text-transparent">
                Customer Reviews
              </span>
            </h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="text-muted-foreground text-center mt-2">
              See what our customers are saying about their BluBerry experience.
            </p>
          </ContentAnimation>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Submit Review Form */}
            <ContentAnimation delay={0.2}>
              <div>
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <h2 className="section-header mb-6 font-[var(--font-roboto)] font-light tracking-tight text-foreground">
                    Share Your Experience
                  </h2>

                  {submitSuccess ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start mb-6">
                      <CheckCircle className="text-green-500 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-300">Thank you for your review!</p>
                        <p className="text-green-700 dark:text-green-400 text-sm">
                          Your feedback helps us improve our service.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-foreground">
                          Your Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`mt-1 ${formErrors.name ? "border-red-500" : ""}`}
                          placeholder="Enter your name"
                        />
                        {formErrors.name && <ErrorMessage message={formErrors.name} />}
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`mt-1 ${formErrors.email ? "border-red-500" : ""}`}
                          placeholder="Enter your email"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Your email will not be published</p>
                        {formErrors.email && <ErrorMessage message={formErrors.email} />}
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-foreground">
                          Rating <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup value={rating} onValueChange={setRating} className="flex space-x-4 mt-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <div key={value} className="flex items-center space-x-1">
                              <RadioGroupItem
                                value={value.toString()}
                                id={`rating-${value}`}
                                className="text-[#3B82F6]"
                              />
                              <Label htmlFor={`rating-${value}`} className="flex text-foreground">
                                {value}
                                <Star className="w-4 h-4 ml-1 text-yellow-400" />
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        {formErrors.rating && <ErrorMessage message={formErrors.rating} />}
                      </div>

                      <div>
                        <Label htmlFor="comment" className="text-sm font-medium text-foreground">
                          Your Review <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className={`mt-1 min-h-[120px] ${formErrors.comment ? "border-red-500" : ""}`}
                          placeholder="Share your experience with BluBerry..."
                        />
                        {formErrors.comment && <ErrorMessage message={formErrors.comment} />}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] hover:from-[#3574e2] hover:to-[#7a47e6] text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Review"
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </ContentAnimation>

            {/* Reviews List */}
            <ContentAnimation delay={0.3}>
              <div>
                <h2 className="section-header mb-6 font-[var(--font-roboto)] font-light tracking-tight text-foreground">
                  Customer Feedback
                </h2>

                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-border rounded-lg p-5 shadow-sm bg-card">
                      <div className="flex items-center mb-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                          <Image
                            src={review.avatar || "/placeholder.svg"}
                            alt={review.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{review.name}</h3>
                          <p className="text-sm text-muted-foreground">{review.date}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <StarRating value={review.rating} />
                      </div>

                      <p className="text-foreground/80">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>
    </div>
  )
}
