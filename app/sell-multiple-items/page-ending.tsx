"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, CheckCircle2, Loader2 } from "lucide-react"
import ContentAnimation from "@/components/content-animation"
import ErrorMessage from "@/components/error-message"
import { Card, CardContent } from "@/components/ui/card"

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
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#0066ff]/10 via-[#6a5acd]/10 to-[#8c52ff]/10 p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">Review Your Items</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          Please review your items before submitting.
                        </p>
                      </div>

                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="bg-[#f8fafc] dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="space-y-4">
                              <Accordion type="single" collapsible className="w-full">
                                {items.map((item, index) => (
                                  <AccordionItem key={item.id} value={`item-${index}`}>
                                    <AccordionTrigger className="hover:bg-[#f8fafc] dark:hover:bg-gray-800 px-4 py-3 rounded-lg">
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center space-x-3">
                                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#0066ff]/10 via-[#6a5acd]/10 to-[#8c52ff]/10 flex items-center justify-center">
                                            <span className="text-sm font-medium text-[#6a5acd]">{index + 1}</span>
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
                                          <div className="text-xs bg-[#6a5acd]/10 text-[#6a5acd] px-2 py-0.5 rounded-full">
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
                                                  className="relative aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700"
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
                        <div className="p-6 rounded-lg bg-[#f8fafc] dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="consent"
                              name="consent"
                              checked={termsAccepted}
                              onCheckedChange={setTermsAccepted}
                              className={`mt-1 border-[#6a5acd] text-[#6a5acd] focus-visible:ring-[#6a5acd] ${
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
                                  className="text-[#0066ff] underline hover:text-[#6a5acd] transition-colors"
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

                      <div className="flex justify-between mt-8 p-6">
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
                          className="px-6 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-medium text-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>

                        <Button
                          type="submit"
                          disabled={!step2Valid || isSubmitting}
                          className="bg-gradient-to-r from-[#6a5acd] to-[#8c52ff] hover:from-[#6a5acd]/90 hover:to-[#8c52ff]/90 text-white px-6 py-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow relative overflow-hidden"
                        >
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
          <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#f0f5ff] dark:from-gray-950 dark:to-[#0c1445]">
            <div className="container mx-auto py-16 px-4 max-w-3xl">
              <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden p-6 text-center">
                <CardContent>
                  <div className="w-16 h-16 bg-gradient-to-r from-[#0066ff]/10 via-[#6a5acd]/10 to-[#8c52ff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-[#6a5acd]" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#0066ff] via-[#6a5acd] to-[#8c52ff] bg-clip-text text-transparent">
                    Thank You!
                  </h2>
                  <div className="w-16 h-0.5 mx-auto mb-6 bg-gradient-to-r from-[#0066ff] via-[#6a5acd] to-[#8c52ff] rounded-full"></div>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    We've received your submission and will get back to you within 24 hours.
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-[#0066ff] to-[#6a5acd] hover:from-[#0066ff]/90 hover:to-[#6a5acd]/90"
                  >
                    <Link href="/">Back to Home</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </ContentAnimation>
      )}
    </>
  )
}
