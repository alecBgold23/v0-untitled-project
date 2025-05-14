"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, CheckCircle2, Loader2 } from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import ErrorMessage from "@/components/error-message"

// This is a partial component that contains the ending part of the sell-multiple-items page
// It should be imported and used in the main page.tsx file

export default function SellMultipleItemsEnding({
  items,
  email,
  termsAccepted,
  setTermsAccepted,
  formErrors,
  step2Valid,
  isSubmitting,
  formStep,
  setFormStep,
  scrollToTop,
  formSubmitted,
}) {
  return (
    <>
      {!formSubmitted ? (
        <>
          <ContentAnimation>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-8">
                {formStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-[#e2e8f0] dark:border-gray-700 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#0ea5e9]/30 via-[#6366f1]/30 to-[#8b5cf6]/30 p-6 border-b border-[#e2e8f0] dark:border-gray-700">
                        <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">Review Your Items</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          Please review your items before submitting.
                        </p>
                      </div>

                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="bg-[#f8fafc] dark:bg-gray-900 rounded-lg p-4 border border-[#e2e8f0] dark:border-gray-700">
                            <div className="space-y-4">
                              <Accordion type="single" collapsible className="w-full">
                                {items.map((item, index) => (
                                  <AccordionItem key={item.id} value={`item-${index}`}>
                                    <AccordionTrigger className="hover:bg-[#f8fafc] dark:hover:bg-gray-800 px-4 py-3 rounded-lg">
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center space-x-3">
                                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#0ea5e9]/10 via-[#6366f1]/10 to-[#8b5cf6]/10 flex items-center justify-center">
                                            <span className="text-sm font-medium text-[#6366f1]">{index + 1}</span>
                                          </div>
                                          <div className="text-left">
                                            <h3 className="font-medium">{item.name || `Item ${index + 1}`}</h3>
                                            <p className="text-xs text-muted-foreground">
                                              {item.condition
                                                ? item.condition
                                                    .split("-")
                                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(" ")
                                                : "No condition specified"}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <div className="text-xs bg-[#6366f1]/10 text-[#6366f1] px-2 py-0.5 rounded-full">
                                            {item.photos.length} photo{item.photos.length !== 1 ? "s" : ""}
                                          </div>
                                        </div>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="text-sm font-medium mb-1">Description</h4>
                                          <p className="text-sm text-muted-foreground">
                                            {item.description || "No description provided"}
                                          </p>
                                        </div>

                                        {item.photos.length > 0 && (
                                          <div>
                                            <h4 className="text-sm font-medium mb-2">Photos</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                              {item.photos.map((photo, photoIndex) => (
                                                <div
                                                  key={photo.id}
                                                  className="relative aspect-square rounded-md overflow-hidden border border-[#e2e8f0] dark:border-gray-700"
                                                >
                                                  {photo.previewUrl && (
                                                    <img
                                                      src={photo.previewUrl || "/placeholder.svg"}
                                                      alt={`Item ${index + 1} photo ${photoIndex + 1}`}
                                                      className="w-full h-full object-cover"
                                                    />
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 transition-all duration-300">
                        <div className="p-6 rounded-lg bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="consent"
                              name="consent"
                              checked={termsAccepted}
                              onCheckedChange={setTermsAccepted}
                              className={`mt-1 border-[#6366f1] text-[#6366f1] focus-visible:ring-[#6366f1] ${
                                formErrors.terms ? "border-red-300" : ""
                              }`}
                              required
                            />
                            <div>
                              <Label htmlFor="consent" className="font-medium">
                                I consent to being contacted by BluBerry <span className="text-red-500">*</span>
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                By submitting this form, you agree to our{" "}
                                <Link
                                  href="/privacy-policy"
                                  className="text-[#6366f1] underline hover:text-[#4f46e5] transition-colors"
                                >
                                  Privacy Policy
                                </Link>
                                . We'll use your information to process your request and contact you about your items.
                              </p>
                              {formErrors.terms && <ErrorMessage message={formErrors.terms} />}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between mt-8">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            scrollToTop()
                            // Change form step after scroll animation starts
                            setTimeout(() => {
                              setFormStep(1)
                            }, 100)
                          }}
                          className="px-6 py-2 rounded-lg border border-[#e2e8f0] dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground shadow-sm hover:bg-muted/50 transition-all duration-300 flex items-center gap-2 font-medium"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>

                        <Button
                          type="submit"
                          disabled={!step2Valid || isSubmitting}
                          className="bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] hover:from-[#0ea5e9]/90 hover:via-[#6366f1]/90 hover:to-[#8b5cf6]/90 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                        >
                          <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:opacity-0 transition-opacity duration-300"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <span>Submit</span>
                              </>
                            )}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </ContentAnimation>
        </>
      ) : (
        <ContentAnimation>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-[#e2e8f0] dark:border-gray-700 overflow-hidden transition-all duration-500">
            <div className="bg-gradient-to-r from-[#0ea5e9]/30 via-[#6366f1]/30 to-[#8b5cf6]/30 p-6 border-b border-[#e2e8f0] dark:border-gray-700">
              <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">Submission Received</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Thank you for your submission. We'll be in touch soon.
              </p>
            </div>

            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#0ea5e9]/10 via-[#6366f1]/10 to-[#8b5cf6]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#6366f1]" />
              </div>

              <h2 className="text-3xl font-light mb-4 bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                Thank You!
              </h2>

              <div className="w-24 h-1 mx-auto mb-6 bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#8b5cf6] rounded-full"></div>

              <p className="text-lg mb-8 text-muted-foreground max-w-xl mx-auto">
                We've received your submission for {items.length} item{items.length > 1 ? "s" : ""} and will review the
                details. You can expect to hear from us within 24 hours with a price offer.
              </p>

              {/* Show submitted photos in confirmation */}
              {items.length > 0 && (
                <div className="bg-[#f8fafc] dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-6 max-w-3xl mx-auto mb-8">
                  <h3 className="text-lg font-medium mb-4 text-[#6366f1]">Your Submitted Items</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-4 bg-white/50 dark:bg-gray-800/50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{item.name || `Item ${index + 1}`}</h4>
                          <span className="text-xs bg-[#6366f1]/10 text-[#6366f1] px-2 py-0.5 rounded-full">
                            {item.condition
                              ? item.condition
                                  .split("-")
                                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(" ")
                              : "No condition"}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium text-foreground">Description:</span> {item.description}
                        </p>

                        {item.photos.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-foreground mb-1">Photos:</p>
                            <div className="flex flex-wrap gap-2">
                              {item.photos.slice(0, 2).map((photo, photoIndex) => (
                                <div key={photo.id} className="w-16 h-16 relative">
                                  <div className="w-full h-full rounded-md border border-[#e2e8f0] dark:border-gray-700 shadow-sm overflow-hidden">
                                    {photo.previewUrl && (
                                      <img
                                        src={photo.previewUrl || "/placeholder.svg"}
                                        alt={`Submitted image ${photoIndex + 1}`}
                                        className="w-full h-full object-cover"
                                        style={{ display: "block" }}
                                      />
                                    )}
                                  </div>
                                </div>
                              ))}
                              {item.photos.length > 2 && (
                                <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-md border border-[#e2e8f0] dark:border-gray-700">
                                  <span className="text-xs font-medium">+{item.photos.length - 2}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#f8fafc] dark:bg-gray-900 p-6 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">
                  We've sent a confirmation email to <span className="font-medium text-foreground">{email}</span> with
                  the details of your submission.
                </p>
              </div>
            </div>
          </div>
        </ContentAnimation>
      )}
    </>
  )
}
