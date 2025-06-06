"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MoreHorizontal, Package, Users, DollarSign, CheckCircle, Loader2, AlertCircle, X, LogOut } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

type SubmissionStatus = "pending" | "approved" | "rejected" | "listed"

export interface ItemSubmission {
  id: string
  item_name: string
  item_description: string
  item_issues: string | null
  full_name: string
  email: string
  phone: string | null
  address: string | null
  pickup_date: string | null
  photo_count: number | null
  status: SubmissionStatus
  submission_date: string
  image_path: string | null
  image_url: string | null
  image_urls?: string | null // For multiple images
  estimated_price: number | null
  item_condition: "Like New" | "Excellent" | "Good" | "Fair" | "Poor"
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<ItemSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [listingLoading, setListingLoading] = useState<string | null>(null)
  const [listingError, setListingError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ItemSubmission | null>(null)
  const [itemImages, setItemImages] = useState<string[]>([])
  const [editingDescription, setEditingDescription] = useState<string | null>(null)
  const [editedDescription, setEditedDescription] = useState<string>("")

  // Password protection
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordError, setPasswordError] = useState(false)

  // Check if already authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuthenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "2923939") {
      setIsAuthenticated(true)
      localStorage.setItem("adminAuthenticated", "true")
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("adminAuthenticated")
  }

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchItems = async () => {
      setLoading(true)
      setFetchError(null)

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Missing Supabase environment variables")
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data, error } = await supabase
          .from("sell_items")
          .select("*")
          .order("submission_date", { ascending: false })

        if (error) {
          console.error("Failed to fetch submissions:", error)
          setFetchError(error.message)
        } else {
          // Process image URLs to ensure they're correctly formatted
          const processedData = data?.map((item) => {
            console.log(
              "Processing item:",
              item.id,
              "Original image_url:",
              item.image_url,
              "Original image_urls:",
              item.image_urls,
            )

            let imageUrl = item.image_url
            let imageUrls = item.image_urls

            // Process main image URL
            if (imageUrl) {
              imageUrl = imageUrl.trim()

              // If it's already a full Supabase URL, keep it as is
              if (imageUrl.startsWith("https://") && imageUrl.includes("supabase.co")) {
                // Ensure it has the correct storage path format
                if (!imageUrl.includes("/storage/v1/object/public/")) {
                  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
                  if (projectId) {
                    const fileName = imageUrl.split("/").pop()
                    imageUrl = `https://${projectId}.supabase.co/storage/v1/object/public/item_images/${fileName}`
                  }
                }
              } else if (!imageUrl.startsWith("http")) {
                // If it's just a filename or path, construct full URL
                const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
                if (projectId) {
                  const cleanPath = imageUrl.replace(/^\/?(item_images\/)?/, "")
                  imageUrl = `https://${projectId}.supabase.co/storage/v1/object/public/item_images/${cleanPath}`
                }
              }
            }

            // Process multiple image URLs
            if (imageUrls) {
              try {
                let parsedUrls: string[] = []

                // Try to parse as JSON array first
                if (imageUrls.startsWith("[")) {
                  parsedUrls = JSON.parse(imageUrls)
                } else {
                  // Try comma-separated format
                  parsedUrls = imageUrls
                    .split(",")
                    .map((url) => url.trim())
                    .filter((url) => url.length > 0)
                }

                // Process each URL
                parsedUrls = parsedUrls.map((url) => {
                  if (url.startsWith("https://") && url.includes("supabase.co")) {
                    // Ensure it has the correct storage path format
                    if (!url.includes("/storage/v1/object/public/")) {
                      const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
                      if (projectId) {
                        const fileName = url.split("/").pop()
                        return `https://${projectId}.supabase.co/storage/v1/object/public/item_images/${fileName}`
                      }
                    }
                    return url
                  } else if (!url.startsWith("http")) {
                    // If it's just a filename or path, construct full URL
                    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
                    if (projectId) {
                      const cleanPath = url.replace(/^\/?(item_images\/)?/, "")
                      return `https://${projectId}.supabase.co/storage/v1/object/public/item_images/${cleanPath}`
                    }
                  }
                  return url
                })

                imageUrls = JSON.stringify(parsedUrls)
              } catch (error) {
                console.error("Error processing image_urls for item", item.id, error)
              }
            }

            console.log("Processed image_url:", imageUrl)
            console.log("Processed image_urls:", imageUrls)

            return {
              ...item,
              image_url: imageUrl,
              image_urls: imageUrls,
            }
          })

          setSubmissions(processedData || [])
        }
      } catch (error) {
        console.error("Unexpected error fetching submissions:", error)
        setFetchError("An unexpected error occurred while fetching submissions.")
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [isAuthenticated])

  const updateSubmissionStatus = (id: string, newStatus: SubmissionStatus) => {
    setSubmissions((prev) =>
      prev.map((submission) => (submission.id === id ? { ...submission, status: newStatus } : submission)),
    )
  }

  const listItemOnEbay = async (id: string) => {
    setListingLoading(id)
    setListingError(null)

    try {
      console.log(`🚀 Starting eBay listing process for item ID: ${id}`)

      const response = await fetch("/api/list-item-on-ebay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      console.log(`📡 API Response Status: ${response.status}`)
      console.log(`📡 API Response Data:`, result)

      if (!response.ok) {
        const errorMessage = result.error || `HTTP ${response.status}: ${response.statusText}`
        console.error(`❌ eBay listing failed for item ${id}:`, errorMessage)
        throw new Error(errorMessage)
      }

      // Success case
      console.log(`✅ Successfully listed item ${id} on eBay:`, {
        offerId: result.ebay_offer_id,
        listingId: result.ebay_listing_id,
        listingUrl: result.ebay_listing_url,
      })

      // Update local state only after successful API call
      updateSubmissionStatus(id, "listed")

      // Show success message (optional)
      if (result.ebay_listing_url) {
        console.log(`🔗 eBay listing URL: ${result.ebay_listing_url}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      console.error(`❌ Error listing item ${id} on eBay:`, {
        error: errorMessage,
        timestamp: new Date().toISOString(),
        itemId: id,
      })

      // Set user-friendly error message
      let userErrorMessage = "Failed to list item on eBay"

      if (errorMessage.includes("access token")) {
        userErrorMessage = "eBay authentication failed. Please check your eBay connection."
      } else if (errorMessage.includes("inventory item")) {
        userErrorMessage = "Failed to create item inventory on eBay. Check item details."
      } else if (errorMessage.includes("offer")) {
        userErrorMessage = "Failed to create eBay offer. Check pricing and policies."
      } else if (errorMessage.includes("publish")) {
        userErrorMessage = "Failed to publish listing on eBay. Item created but not live."
      } else if (errorMessage.includes("database")) {
        userErrorMessage = "Item listed on eBay but failed to update our records."
      } else {
        userErrorMessage = `eBay listing failed: ${errorMessage}`
      }

      setListingError(userErrorMessage)
    } finally {
      setListingLoading(null)
    }
  }

  const getStatusBadge = (status: SubmissionStatus) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      approved: { variant: "default" as const, label: "Approved" },
      rejected: { variant: "destructive" as const, label: "Rejected" },
      listed: { variant: "outline" as const, label: "Listed on eBay" },
    }

    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getConditionColor = (condition: string) => {
    const colors = {
      "Like New": "text-green-600",
      Excellent: "text-blue-600",
      Good: "text-yellow-600",
      Fair: "text-orange-600",
      Poor: "text-red-600",
    }
    return colors[condition as keyof typeof colors] || "text-gray-600"
  }

  const viewItemDetails = (item: ItemSubmission) => {
    setSelectedItem(item)

    // Parse multiple images if available
    let images: string[] = []

    if (item.image_urls) {
      try {
        // Try to parse as JSON array
        const parsed = JSON.parse(item.image_urls)
        if (Array.isArray(parsed)) {
          images = parsed.filter((url) => url && url.trim().length > 0)
        }
      } catch {
        // If not JSON, try comma-separated
        images = item.image_urls
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url.length > 0)
      }
    }

    // Add the main image if it exists and isn't already in the array
    if (item.image_url && !images.includes(item.image_url)) {
      images.unshift(item.image_url)
    }

    // Remove any empty or invalid URLs
    images = images.filter((url) => url && url.trim().length > 0)

    // If still no images, use a placeholder
    if (images.length === 0) {
      images = ["/placeholder.svg?height=400&width=400&text=No Image"]
    }

    console.log("Final images array for item", item.id, ":", images)
    setItemImages(images)
  }

  const debugImageUrl = (url: string, itemId: string) => {
    console.log(`🖼️ Image Debug for item ${itemId}:`, {
      originalUrl: url,
      isValid: url && url.startsWith("http"),
      containsBucket: url?.includes("item_images"),
      urlLength: url?.length,
    })
  }

  const updateItemDescription = async (id: string, newDescription: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { error } = await supabase.from("sell_items").update({ item_description: newDescription }).eq("id", id)

      if (error) throw error

      // Update local state
      setSubmissions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, item_description: newDescription } : item)),
      )

      setEditingDescription(null)
      setEditedDescription("")
    } catch (error) {
      console.error("Failed to update description:", error)
    }
  }

  const startEditingDescription = (id: string, currentDescription: string) => {
    setEditingDescription(id)
    setEditedDescription(currentDescription)
  }

  const cancelEditingDescription = () => {
    setEditingDescription(null)
    setEditedDescription("")
  }

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    listed: submissions.filter((s) => s.status === "listed").length,
  }

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
            <CardDescription className="text-center">Enter password to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={passwordError ? "border-red-500" : ""}
                />
                {passwordError && <p className="text-sm text-red-500">Incorrect password. Please try again.</p>}
              </div>
              <Button type="submit" className="w-full">
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">Item Submissions Management</div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Listed on eBay</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.listed}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Item Submissions</CardTitle>
            <CardDescription>Manage customer item submissions and their approval status</CardDescription>
          </CardHeader>
          <CardContent>
            {listingError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium text-red-800 mb-1">eBay Listing Failed</h4>
                    <p className="text-red-700 text-sm mb-2">{listingError}</p>
                    <p className="text-red-600 text-xs">
                      Check the browser console (F12) for detailed error logs. Contact support if the issue persists.
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setListingError(null)} className="h-6 w-6 p-0 ml-2">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {fetchError ? (
              <div className="text-red-500">Error: {fetchError}</div>
            ) : loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
                Loading submissions...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Image</TableHead>
                      <TableHead className="w-[150px] text-white">Item Name</TableHead>
                      <TableHead className="text-white">Description</TableHead>
                      <TableHead className="text-white">Customer</TableHead>
                      <TableHead className="text-white">Condition</TableHead>
                      <TableHead className="text-white">Price</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Submitted</TableHead>
                      <TableHead className="text-right text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <Image
                            src={submission.image_url || "/placeholder.svg?height=80&width=80&text=No Image"}
                            alt={submission.item_name}
                            width={80}
                            height={80}
                            className="rounded-lg object-cover"
                            onError={(e) => {
                              console.error(`❌ Failed to load image for item ${submission.id}:`, submission.image_url)
                              debugImageUrl(submission.image_url || "", submission.id)
                              e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=No Image"
                            }}
                            onLoad={() => {
                              console.log(`✅ Successfully loaded image for item ${submission.id}`)
                            }}
                          />
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <div className="space-y-1">
                            <div className="font-semibold text-white text-sm line-clamp-2">{submission.item_name}</div>
                            {submission.item_issues && (
                              <div className="text-xs text-red-400 font-medium max-w-[140px] truncate">
                                Issues: {submission.item_issues}
                              </div>
                            )}
                            <Button
                              variant="link"
                              className="text-xs p-0 h-auto text-blue-400 hover:text-blue-300"
                              onClick={() => viewItemDetails(submission)}
                            >
                              View Details
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          {editingDescription === submission.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                className="w-full p-2 border rounded-md text-sm resize-none"
                                rows={3}
                                placeholder="Enter item description..."
                              />
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => updateItemDescription(submission.id, editedDescription)}
                                  className="h-6 px-2 text-xs"
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditingDescription}
                                  className="h-6 px-2 text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="text-sm text-white line-clamp-3">
                                {submission.item_description || "No description"}
                              </div>
                              <Button
                                variant="link"
                                className="text-xs p-0 h-auto text-blue-400"
                                onClick={() => startEditingDescription(submission.id, submission.item_description)}
                              >
                                Edit Description
                              </Button>
                              {submission.item_issues && (
                                <div className="text-xs text-red-400 max-w-[200px] truncate">
                                  Issues: {submission.item_issues}
                                </div>
                              )}
                              <Button
                                variant="link"
                                className="text-xs p-0 h-auto"
                                onClick={() => viewItemDetails(submission)}
                              >
                                View Details
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-white">{submission.full_name}</div>
                            <div className="text-sm text-gray-400">{submission.email}</div>
                            {submission.phone && <div className="text-xs text-gray-400">{submission.phone}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getConditionColor(submission.item_condition)}`}>
                            {submission.item_condition}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          {submission.estimated_price !== null
                            ? `$${submission.estimated_price.toLocaleString()}`
                            : "—"}
                        </TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell className="text-sm text-gray-400">
                          {new Date(submission.submission_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {submission.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateSubmissionStatus(submission.id, "approved")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      Reject
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reject Submission</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to reject this item submission? This action cannot be
                                        undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => updateSubmissionStatus(submission.id, "rejected")}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Reject
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                            {submission.status === "approved" && (
                              <Button
                                size="sm"
                                onClick={() => listItemOnEbay(submission.id)}
                                disabled={listingLoading === submission.id}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {listingLoading === submission.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Listing...
                                  </>
                                ) : (
                                  "List on eBay"
                                )}
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => viewItemDetails(submission)}>
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem>Contact customer</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Edit submission</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete submission</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Item Details Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{selectedItem.item_name}</DialogTitle>
              <DialogDescription>
                Submitted by {selectedItem.full_name} on {new Date(selectedItem.submission_date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 flex-grow overflow-hidden">
              <div className="space-y-4 overflow-y-auto">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Images</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {itemImages.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                        <Image
                          src={url || "/placeholder.svg?height=200&width=200&text=No Image"}
                          alt={`${selectedItem.item_name} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            console.error(
                              `❌ Failed to load dialog image ${index + 1} for item ${selectedItem.id}:`,
                              url,
                            )
                            e.currentTarget.src = "/placeholder.svg?height=200&width=200&text=No Image"
                          }}
                          onLoad={() => {
                            console.log(`✅ Successfully loaded dialog image ${index + 1} for item ${selectedItem.id}`)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
                  <div className="mt-1 text-sm">
                    <p>
                      <span className="font-medium">Name:</span> {selectedItem.full_name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedItem.email}
                    </p>
                    {selectedItem.phone && (
                      <p>
                        <span className="font-medium">Phone:</span> {selectedItem.phone}
                      </p>
                    )}
                    {selectedItem.address && (
                      <p>
                        <span className="font-medium">Address:</span> {selectedItem.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Item Details</h3>
                    <div className="mt-1">
                      <p>
                        <span className="font-medium">Condition:</span> {selectedItem.item_condition}
                      </p>
                      <p>
                        <span className="font-medium">Estimated Price:</span>{" "}
                        {selectedItem.estimated_price
                          ? `$${selectedItem.estimated_price.toLocaleString()}`
                          : "Not estimated"}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span> {selectedItem.status}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <div className="mt-1 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md border">
                      {selectedItem.item_description}
                    </div>
                  </div>

                  {selectedItem.item_issues && (
                    <div>
                      <h3 className="text-sm font-medium text-red-500">Known Issues</h3>
                      <div className="mt-1 text-sm whitespace-pre-wrap bg-red-50 p-3 rounded-md border border-red-100 text-red-800">
                        {selectedItem.item_issues}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter>
              {selectedItem.status === "approved" && (
                <Button
                  onClick={() => {
                    listItemOnEbay(selectedItem.id)
                    setSelectedItem(null)
                  }}
                  disabled={listingLoading === selectedItem.id}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {listingLoading === selectedItem.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Listing on eBay...
                    </>
                  ) : (
                    "List on eBay"
                  )}
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
