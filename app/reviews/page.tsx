"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Star, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import Image from "next/image"
import ContentAnimation from "@/components/content-animation"
import { toast } from "@/hooks/use-toast"

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]) // Initialize with empty array
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [rating, setRating] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState("")

  const validateForm = () => {
    const errors = {}
    if (!name.trim()) errors.name = "Please enter your name"
    if (!email.trim()) errors.email = "Please enter your email"
    if (!rating) errors.rating = "Please select a rating"
    if (!comment.trim()) errors.comment = "Please enter your review"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Use the new API route for submission
      const response = await fetch("/api/send-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          rating,
          comment,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Add the review to the local state
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
        setSubmitSuccess(true)

        // Show success toast
        toast({
          title: "Review Submitted",
          description: "Thank you for sharing your experience!",
        })

        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 5000)
      } else {
        // Handle error
        const errorMsg = result.message || "Failed to submit review. Please try again."
        setErrorMessage(errorMsg)
        toast({
          title: "Submission Failed",
          description: errorMsg,
          variant: "destructive",
        })
        console.error("Submission error details:", result.error)
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      setErrorMessage("An error occurred while submitting your review. Please try again.")
      toast({
        title: "Submission Error",
        description: "An error occurred while submitting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
      <AlertCircle className="h-3 w-3" />
      <span>{message}</span>
    </div>
  )

  return (
    <div className="bg-background">
      {/* Hero Section with elegant gradient */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-background via-background to-secondary/30">
        <div className="container mx-auto px-4">
          <ContentAnimation>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center font-[var(--font-roboto)] font-light tracking-tight">
              <span className="bg-gradient-to-r from-[#4361ee] via-[#7209b7] to-[#3a0ca3] bg-clip-text text-transparent">
                Customer Reviews
              </span>
            </h1>
          </ContentAnimation>
          <ContentAnimation delay={0.1}>
            <p className="text-lg md:text-xl text-center max-w-2xl mx-auto text-muted-foreground">
              See what our customers are saying about their BluBerry experience.
            </p>
          </ContentAnimation>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Submit Review Form */}
            <ContentAnimation delay={0.2}>
              <div>
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <h2 className="text-2xl font-semibold mb-6 text-foreground">Share Your Experience</h2>

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
                      {errorMessage && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start mb-6">
                          <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-red-800 dark:text-red-300">Submission Error</p>
                            <p className="text-red-700 dark:text-red-400 text-sm">{errorMessage}</p>
                          </div>
                        </div>
                      )}

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

                      <div className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#8A4FFF] p-[2px] rounded-lg w-full">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex justify-center items-center bg-card hover:bg-secondary transition-colors px-4 py-2 rounded-lg font-medium text-foreground group text-sm"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit Review
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </ContentAnimation>

            {/* Reviews List */}
            <ContentAnimation delay={0.3}>
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Customer Feedback</h2>

                {reviews.length > 0 ? (
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
                ) : (
                  <div className="border border-border rounded-lg p-8 shadow-sm bg-card text-center">
                    <p className="text-muted-foreground mb-2">No reviews yet</p>
                    <p className="text-foreground font-medium">Be the first to share your experience!</p>
                  </div>
                )}
              </div>
            </ContentAnimation>
          </div>
        </div>
      </section>
    </div>
  )
}
