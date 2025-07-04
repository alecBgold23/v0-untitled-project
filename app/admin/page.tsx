"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"

// Simple types
interface ItemSubmission {
  id: string
  item_name: string
  item_description: string
  item_issues: string | null
  full_name: string
  email: string
  phone: string | null
  address: string | null
  status: "pending" | "approved" | "rejected" | "listed"
  ebay_status: string | null // Primary field for eBay listing status
  submission_date: string
  image_url: string | string[] | null
  estimated_price: number | null
  item_condition: string
  ebay_listing_id: string | null
  listed_on_ebay: boolean | null
}

// Demo data for preview with multiple images
const DEMO_SUBMISSIONS: ItemSubmission[] = [
  {
    id: "1",
    item_name: "iPhone 14 Pro Max",
    item_description:
      "Excellent condition iPhone 14 Pro Max, 256GB, Space Black. Minor scratches on the back but screen is perfect.",
    item_issues: "Small scratch on back camera",
    full_name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    status: "approved",
    ebay_status: "listed",
    submission_date: "2024-01-15T10:30:00Z",
    image_url: [
      "/placeholder.svg?height=300&width=300&text=iPhone+Front",
      "/placeholder.svg?height=300&width=300&text=iPhone+Back",
      "/placeholder.svg?height=300&width=300&text=iPhone+Side",
    ],
    estimated_price: 899,
    item_condition: "Excellent",
    ebay_listing_id: "123456789",
    listed_on_ebay: true,
  },
  {
    id: "2",
    item_name: "MacBook Air M2",
    item_description: "2022 MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Used for light work, excellent performance.",
    item_issues: null,
    full_name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 987-6543",
    address: "456 Oak Ave, Los Angeles, CA 90210",
    status: "pending",
    ebay_status: null,
    submission_date: "2024-01-14T14:20:00Z",
    image_url: [
      "/placeholder.svg?height=300&width=300&text=MacBook+Closed",
      "/placeholder.svg?height=300&width=300&text=MacBook+Open",
      "/placeholder.svg?height=300&width=300&text=MacBook+Keyboard",
      "/placeholder.svg?height=300&width=300&text=MacBook+Ports",
    ],
    estimated_price: 1099,
    item_condition: "Like New",
    ebay_listing_id: null,
    listed_on_ebay: false,
  },
  {
    id: "3",
    item_name: "iPad Pro 12.9 inch",
    item_description: "iPad Pro with Apple Pencil and Magic Keyboard. Perfect for creative work and productivity.",
    item_issues: "Minor wear on corners",
    full_name: "Mike Davis",
    email: "mike.davis@email.com",
    phone: "+1 (555) 456-7890",
    address: "789 Pine St, Chicago, IL 60601",
    status: "approved",
    ebay_status: "processing",
    submission_date: "2024-01-13T09:15:00Z",
    image_url: [
      "/placeholder.svg?height=300&width=300&text=iPad+Front",
      "/placeholder.svg?height=300&width=300&text=iPad+Accessories",
    ],
    estimated_price: 799,
    item_condition: "Good",
    ebay_listing_id: null,
    listed_on_ebay: false,
  },
  {
    id: "4",
    item_name: "Sony WH-1000XM4 Headphones",
    item_description: "Premium noise-canceling headphones in excellent condition. Includes original case and cables.",
    item_issues: null,
    full_name: "Emily Chen",
    email: "emily.chen@email.com",
    phone: "+1 (555) 321-0987",
    address: "321 Elm St, Seattle, WA 98101",
    status: "rejected",
    ebay_status: null,
    submission_date: "2024-01-12T16:45:00Z",
    image_url: "/placeholder.svg?height=300&width=300&text=Sony+Headphones", // Single image
    estimated_price: 249,
    item_condition: "Excellent",
    ebay_listing_id: null,
    listed_on_ebay: false,
  },
  {
    id: "5",
    item_name: "Nintendo Switch OLED",
    item_description:
      "Nintendo Switch OLED model with Joy-Con controllers. Includes dock and all original accessories.",
    item_issues: "Joy-Con drift on left controller",
    full_name: "Alex Rodriguez",
    email: "alex.r@email.com",
    phone: "+1 (555) 654-3210",
    address: "654 Maple Dr, Austin, TX 73301",
    status: "approved",
    ebay_status: "unlisted",
    submission_date: "2024-01-11T11:30:00Z",
    image_url: [
      "/placeholder.svg?height=300&width=300&text=Switch+Console",
      "/placeholder.svg?height=300&width=300&text=Switch+Dock",
      "/placeholder.svg?height=300&width=300&text=Joy+Cons",
      "/placeholder.svg?height=300&width=300&text=Switch+Screen",
      "/placeholder.svg?height=300&width=300&text=Accessories",
    ],
    estimated_price: 299,
    item_condition: "Good",
    ebay_listing_id: "987654321",
    listed_on_ebay: false,
  },
]

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<ItemSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ItemSubmission | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Check if we're in preview mode (no environment variables)
  useEffect(() => {
    const hasSupabaseConfig =
      typeof process !== "undefined" &&
      process.env?.NEXT_PUBLIC_SUPABASE_URL &&
      process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!hasSupabaseConfig) {
      setIsPreviewMode(true)
      setIsAuthenticated(true) // Auto-authenticate in preview
      setSubmissions(DEMO_SUBMISSIONS)
      setLoading(false)
    }
  }, [])

  // Check authentication on mount (only in production)
  useEffect(() => {
    if (isPreviewMode) return

    if (typeof window !== "undefined") {
      const authStatus = localStorage.getItem("adminAuthenticated")
      if (authStatus === "true") {
        setIsAuthenticated(true)
      }
    }
  }, [isPreviewMode])

  // Handle password authentication
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "2923939") {
      setIsAuthenticated(true)
      if (typeof window !== "undefined") {
        localStorage.setItem("adminAuthenticated", "true")
      }
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false)
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminAuthenticated")
    }
  }

  // Helper function to check if item is listed on eBay
  const isListedOnEbay = (item: ItemSubmission): boolean => {
    return item.ebay_status === "listed" || item.ebay_status === "active" || item.ebay_status === "processing"
  }

  // Helper function to get eBay status display
  const getEbayStatusDisplay = (item: ItemSubmission): string => {
    if (!item.ebay_status) return "Not Listed"
    return item.ebay_status.charAt(0).toUpperCase() + item.ebay_status.slice(1)
  }

  // Fetch submissions (only in production)
  useEffect(() => {
    if (!isAuthenticated || isPreviewMode) return

    const fetchSubmissions = async () => {
      try {
        setLoading(true)
        setError(null)

        // Dynamic import to avoid build errors in preview
        const { createClient } = await import("@supabase/supabase-js")

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Missing Supabase configuration")
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data, error: fetchError } = await supabase
          .from("sell_items")
          .select("*")
          .order("submission_date", { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setSubmissions(data || [])
      } catch (err) {
        console.error("Error fetching submissions:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch submissions")
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [isAuthenticated, isPreviewMode])

  // Update submission status
  const updateStatus = async (id: string, newStatus: "pending" | "approved" | "rejected" | "listed") => {
    if (isPreviewMode) {
      // Demo mode - just update local state
      setSubmissions((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)))
      return
    }

    try {
      setActionLoading(id)

      const { createClient } = await import("@supabase/supabase-js")
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase configuration")
      }

      const supabase = createClient(supabaseUrl, supabaseKey)
      const { error } = await supabase.from("sell_items").update({ status: newStatus }).eq("id", id)

      if (error) {
        throw error
      }

      // Update local state
      setSubmissions((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)))
    } catch (err) {
      console.error("Error updating status:", err)
      alert("Failed to update status: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setActionLoading(null)
    }
  }

  // List item on eBay
  const listOnEbay = async (id: string) => {
    if (isPreviewMode) {
      // Demo mode - simulate listing
      setActionLoading(id)
      setTimeout(() => {
        setSubmissions((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ebay_status: "listed",
                  listed_on_ebay: true,
                  ebay_listing_id: "demo-" + Date.now(),
                }
              : item,
          ),
        )
        setActionLoading(null)
        alert("Successfully listed on eBay! (Demo Mode)")
      }, 2000)
      return
    }

    try {
      setActionLoading(id)

      const response = await fetch("/api/list-item-on-ebay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to list on eBay")
      }

      // Update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ebay_status: "listed",
                listed_on_ebay: true,
                ebay_listing_id: result.listingId,
              }
            : item,
        ),
      )

      alert("Successfully listed on eBay!")
    } catch (err) {
      console.error("Error listing on eBay:", err)
      alert("Failed to list on eBay: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setActionLoading(null)
    }
  }

  // Unlist item from eBay
  const unlistFromEbay = async (id: string) => {
    if (isPreviewMode) {
      // Demo mode - simulate unlisting
      setActionLoading(id)
      setTimeout(() => {
        setSubmissions((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ebay_status: "unlisted",
                  listed_on_ebay: false,
                  ebay_listing_id: null,
                }
              : item,
          ),
        )
        setActionLoading(null)
        alert("Successfully unlisted from eBay! (Demo Mode)")
      }, 2000)
      return
    }

    try {
      setActionLoading(id)

      const response = await fetch("/api/unlist-ebay-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to unlist from eBay")
      }

      // Update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ebay_status: "unlisted",
                listed_on_ebay: false,
                ebay_listing_id: null,
              }
            : item,
        ),
      )

      alert("Successfully unlisted from eBay!")
    } catch (err) {
      console.error("Error unlisting from eBay:", err)
      alert("Failed to unlist from eBay: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setActionLoading(null)
    }
  }

  // Parse image URLs from various formats
  const parseImageUrls = (imageData: string | string[] | null): string[] => {
    if (!imageData) return []

    if (Array.isArray(imageData)) {
      return imageData.filter((url) => url && url.trim())
    }

    if (typeof imageData === "string") {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(imageData)
        if (Array.isArray(parsed)) {
          return parsed.filter((url) => url && url.trim())
        }
        return [imageData].filter((url) => url && url.trim())
      } catch {
        // If not JSON, check if it's comma-separated
        if (imageData.includes(",")) {
          return imageData
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url)
        }
        return [imageData].filter((url) => url && url.trim())
      }
    }

    return []
  }

  // Get first image URL for table display
  const getFirstImageUrl = (imageData: string | string[] | null): string => {
    const urls = parseImageUrls(imageData)
    return urls.length > 0 ? urls[0] : "/placeholder.svg?height=80&width=80&text=No+Image"
  }

  // Get image count for display
  const getImageCount = (imageData: string | string[] | null): number => {
    return parseImageUrls(imageData).length
  }

  // Get status badge style
  const getStatusStyle = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      listed: "bg-blue-100 text-blue-800 border-blue-300",
    }
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  // Get eBay status badge style
  const getEbayStatusStyle = (ebayStatus: string | null) => {
    if (!ebayStatus) return "bg-gray-100 text-gray-800 border-gray-300"

    const styles = {
      listed: "bg-green-100 text-green-800 border-green-300",
      active: "bg-green-100 text-green-800 border-green-300",
      processing: "bg-orange-100 text-orange-800 border-orange-300",
      unlisted: "bg-red-100 text-red-800 border-red-300",
      ended: "bg-yellow-100 text-yellow-800 border-yellow-300",
      sold: "bg-blue-100 text-blue-800 border-blue-300",
    }
    return styles[ebayStatus.toLowerCase() as keyof typeof styles] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  // Password protection screen (skip in preview mode)
  if (!isAuthenticated && !isPreviewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-blue-600 opacity-20"></div>
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Access</h1>
            <p className="text-gray-600">Enter your password to access the dashboard</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 ${
                  passwordError ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                }`}
              />
            </div>
            {passwordError && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Incorrect password. Please try again.</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>Access Dashboard</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Secure admin portal • Protected access</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            {isPreviewMode && (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">Preview Mode</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">{submissions.length} total submissions</span>
            {!isPreviewMode && (
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Preview Mode Notice */}
        {isPreviewMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Preview Mode Active</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    You're viewing demo data with multiple images per listing. In production, this would connect to your
                    Supabase database and display all uploaded photos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total", count: submissions.length, color: "bg-blue-600" },
            {
              label: "Pending Review",
              count: submissions.filter((s) => s.status === "pending").length,
              color: "bg-yellow-600",
            },
            {
              label: "Approved",
              count: submissions.filter((s) => s.status === "approved").length,
              color: "bg-green-600",
            },
            {
              label: "Listed on eBay",
              count: submissions.filter((s) => isListedOnEbay(s)).length,
              color: "bg-purple-600",
            },
            {
              label: "Not Listed",
              count: submissions.filter((s) => !isListedOnEbay(s)).length,
              color: "bg-gray-600",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-full p-3 mr-4`}>
                  <div className="w-6 h-6 text-white font-bold flex items-center justify-center">{stat.count}</div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Item Submissions</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading submissions...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No submissions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      All Images
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      eBay Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((item) => {
                    const imageCount = getImageCount(item.image_url)
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2 overflow-x-auto max-w-xs">
                            {(() => {
                              const images = parseImageUrls(item.image_url)
                              if (images.length === 0) {
                                return (
                                  <Image
                                    src="/placeholder.svg?height=60&width=60&text=No+Image"
                                    alt="No image"
                                    width={60}
                                    height={60}
                                    className="rounded-lg object-cover flex-shrink-0"
                                  />
                                )
                              }

                              return images.map((imageUrl, index) => (
                                <div key={index} className="relative flex-shrink-0">
                                  <Image
                                    src={imageUrl || "/placeholder.svg"}
                                    alt={`${item.item_name} - Image ${index + 1}`}
                                    width={60}
                                    height={60}
                                    className="rounded-lg object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.svg?height=60&width=60&text=Error"
                                    }}
                                  />
                                  {index === 0 && images.length > 1 && (
                                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                      {images.length}
                                    </div>
                                  )}
                                </div>
                              ))
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="font-medium text-gray-900 truncate">{item.item_name}</p>
                            <p className="text-sm text-gray-500 truncate">{item.item_condition}</p>
                            {item.item_issues && (
                              <p className="text-xs text-red-600 truncate">Issues: {item.item_issues}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.full_name}</p>
                            <p className="text-sm text-gray-500">{item.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getEbayStatusStyle(item.ebay_status)}`}
                          >
                            {getEbayStatusDisplay(item)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.estimated_price ? `$${item.estimated_price.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.submission_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {isListedOnEbay(item) ? (
                              <div className="flex gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-300">
                                  Listed on eBay
                                </span>
                                <button
                                  onClick={() => unlistFromEbay(item.id)}
                                  disabled={actionLoading === item.id}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                                >
                                  {actionLoading === item.id ? "Unlisting..." : "Unlist"}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => listOnEbay(item.id)}
                                disabled={actionLoading === item.id}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                              >
                                {actionLoading === item.id ? "Listing..." : "List on eBay"}
                              </button>
                            )}

                            {item.status === "pending" && (
                              <>
                                <button
                                  onClick={() => updateStatus(item.id, "approved")}
                                  disabled={actionLoading === item.id}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateStatus(item.id, "rejected")}
                                  disabled={actionLoading === item.id}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => setSelectedItem(item)}
                              className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Item Details Modal with Image Gallery */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{selectedItem.item_name}</h3>
                <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Gallery */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {(() => {
                    const images = parseImageUrls(selectedItem.image_url)
                    if (images.length === 0) {
                      return (
                        <Image
                          src="/placeholder.svg?height=400&width=400&text=No+Image"
                          alt={selectedItem.item_name}
                          width={400}
                          height={400}
                          className="rounded-lg object-cover w-full"
                        />
                      )
                    }

                    return (
                      <>
                        {/* Main Image */}
                        <div className="relative">
                          <Image
                            src={images[selectedImageIndex] || "/placeholder.svg"}
                            alt={`${selectedItem.item_name} - Image ${selectedImageIndex + 1}`}
                            width={400}
                            height={400}
                            className="rounded-lg object-cover w-full h-80"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=400&width=400&text=Image+Error"
                            }}
                          />
                          {images.length > 1 && (
                            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                              {selectedImageIndex + 1} / {images.length}
                            </div>
                          )}
                        </div>

                        {/* Image Thumbnails */}
                        {images.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {images.map((image, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedImageIndex === index
                                    ? "border-blue-500 ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <Image
                                  src={image || "/placeholder.svg"}
                                  alt={`${selectedItem.item_name} - Thumbnail ${index + 1}`}
                                  width={80}
                                  height={80}
                                  className="object-cover w-20 h-20"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Error"
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>

                {/* Item Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Name:</span> {selectedItem.full_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {selectedItem.email}
                      </p>
                      {selectedItem.phone && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phone:</span> {selectedItem.phone}
                        </p>
                      )}
                      {selectedItem.address && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Address:</span> {selectedItem.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Item Details</h4>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Condition:</span> {selectedItem.item_condition}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Price:</span>{" "}
                        {selectedItem.estimated_price
                          ? `$${selectedItem.estimated_price.toLocaleString()}`
                          : "Not estimated"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">eBay Status:</span> {getEbayStatusDisplay(selectedItem)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Images:</span> {getImageCount(selectedItem.image_url)} photo(s)
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Submitted:</span>{" "}
                        {new Date(selectedItem.submission_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedItem.ebay_listing_id && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">eBay Information</h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Listing ID:</span> {selectedItem.ebay_listing_id}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedItem.item_description}
                </p>
              </div>

              {/* Issues */}
              {selectedItem.item_issues && (
                <div>
                  <h4 className="font-medium text-red-900 mb-2">Known Issues</h4>
                  <p className="text-sm text-red-600 whitespace-pre-wrap bg-red-50 p-4 rounded-lg border border-red-200">
                    {selectedItem.item_issues}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {isListedOnEbay(selectedItem) ? (
                <div className="flex gap-3">
                  <span className="inline-flex px-4 py-2 text-sm font-semibold rounded-lg bg-green-100 text-green-800 border border-green-300">
                    Listed on eBay
                  </span>
                  <button
                    onClick={() => {
                      unlistFromEbay(selectedItem.id)
                      setSelectedItem(null)
                    }}
                    disabled={actionLoading === selectedItem.id}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === selectedItem.id ? "Unlisting..." : "Unlist from eBay"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    listOnEbay(selectedItem.id)
                    setSelectedItem(null)
                  }}
                  disabled={actionLoading === selectedItem.id}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === selectedItem.id ? "Listing..." : "List on eBay"}
                </button>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
