"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Package, Users, DollarSign, CheckCircle, Loader2, AlertCircle, X, LogOut, Eye } from "lucide-react"

// Simple interface for submissions
interface ItemSubmission {
  id: string
  item_name: string
  item_description: string
  item_issues?: string
  full_name: string
  email: string
  phone?: string
  address?: string
  status: "pending" | "approved" | "rejected" | "listed"
  submission_date: string
  image_url?: any
  image_urls?: any
  estimated_price?: number
  item_condition: string
  ebay_listing_id?: string
  ebay_offer_id?: string
  listed_on_ebay?: boolean
}

export default function AdminDashboard() {
  // State management
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<ItemSubmission[]>([])
  const [selectedItem, setSelectedItem] = useState<ItemSubmission | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authStatus = localStorage.getItem("adminAuthenticated")
        if (authStatus === "true") {
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.warn("localStorage not available:", err)
      }
    }
    checkAuth()
  }, [])

  // Load submissions when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadSubmissions()
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "2923939") {
      setIsAuthenticated(true)
      setPasswordError(false)
      try {
        localStorage.setItem("adminAuthenticated", "true")
      } catch (err) {
        console.warn("Could not save auth state:", err)
      }
    } else {
      setPasswordError(true)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    try {
      localStorage.removeItem("adminAuthenticated")
    } catch (err) {
      console.warn("Could not clear auth state:", err)
    }
  }

  const loadSubmissions = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if we have the required environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase configuration missing. Please check environment variables.")
      }

      // Import Supabase client dynamically to avoid SSR issues
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(supabaseUrl, supabaseKey)

      console.log("🔄 Loading submissions from database...")

      const { data, error: fetchError } = await supabase
        .from("sell_items")
        .select("*")
        .order("submission_date", { ascending: false })

      if (fetchError) {
        console.error("Database error:", fetchError)
        throw new Error(`Failed to load data: ${fetchError.message}`)
      }

      console.log(`✅ Loaded ${data?.length || 0} submissions`)

      // Process the data safely
      const processedData = (data || []).map((item: any) => ({
        id: item.id || "",
        item_name: item.item_name || "Unnamed Item",
        item_description: item.item_description || "",
        item_issues: item.item_issues || "",
        full_name: item.full_name || "Unknown",
        email: item.email || "",
        phone: item.phone || "",
        address: item.address || "",
        status: item.status || "pending",
        submission_date: item.submission_date || new Date().toISOString(),
        image_url: item.image_url || item.image_urls || null,
        image_urls: item.image_urls || item.image_url || null,
        estimated_price: item.estimated_price || 0,
        item_condition: item.item_condition || "Good",
        ebay_listing_id: item.ebay_listing_id || null,
        ebay_offer_id: item.ebay_offer_id || null,
        listed_on_ebay: item.listed_on_ebay || false,
      }))

      setSubmissions(processedData)
    } catch (err) {
      console.error("Error loading submissions:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load submissions"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: "pending" | "approved" | "rejected" | "listed") => {
    setActionLoading(id)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase configuration missing")
      }

      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { error } = await supabase.from("sell_items").update({ status: newStatus }).eq("id", id)

      if (error) {
        throw new Error(`Failed to update status: ${error.message}`)
      }

      // Update local state
      setSubmissions((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)))

      console.log(`✅ Updated item ${id} status to ${newStatus}`)
    } catch (err) {
      console.error("Error updating status:", err)
      alert(`Failed to update status: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setActionLoading(null)
    }
  }

  const listOnEbay = async (id: string) => {
    setActionLoading(id)
    try {
      console.log(`🚀 Listing item ${id} on eBay...`)

      const response = await fetch("/api/list-item-on-ebay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      console.log("✅ Successfully listed on eBay:", result)

      // Update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "listed",
                ebay_listing_id: result.listingId,
                ebay_offer_id: result.ebay_offer_id,
                listed_on_ebay: true,
              }
            : item,
        ),
      )

      alert("Successfully listed on eBay!")
    } catch (err) {
      console.error("Error listing on eBay:", err)
      alert(`Failed to list on eBay: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setActionLoading(null)
    }
  }

  const unlistFromEbay = async (id: string) => {
    setActionLoading(id)
    try {
      console.log(`🗑️ Unlisting item ${id} from eBay...`)

      const response = await fetch("/api/unlist-ebay-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      console.log("✅ Successfully unlisted from eBay:", result)

      // Update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "approved",
                listed_on_ebay: false,
              }
            : item,
        ),
      )

      alert("Successfully unlisted from eBay!")
    } catch (err) {
      console.error("Error unlisting from eBay:", err)
      alert(`Failed to unlist from eBay: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Helper functions
  const getImageUrl = (item: ItemSubmission): string => {
    try {
      let imageData = item.image_urls || item.image_url

      if (!imageData) return "/placeholder.svg?height=80&width=80&text=No+Image"

      if (typeof imageData === "string") {
        try {
          imageData = JSON.parse(imageData)
        } catch {
          return imageData.startsWith("http") ? imageData : "/placeholder.svg?height=80&width=80&text=No+Image"
        }
      }

      if (Array.isArray(imageData) && imageData.length > 0) {
        return imageData[0].startsWith("http") ? imageData[0] : "/placeholder.svg?height=80&width=80&text=No+Image"
      }

      return "/placeholder.svg?height=80&width=80&text=No+Image"
    } catch {
      return "/placeholder.svg?height=80&width=80&text=No+Image"
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      listed: "bg-blue-100 text-blue-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
    listed: submissions.filter((s) => s.status === "listed").length,
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  passwordError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter admin password"
                required
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">Incorrect password</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">Item Management</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <X className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Listed</p>
                <p className="text-2xl font-bold">{stats.listed}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Item Submissions</h2>
              <button
                onClick={loadSubmissions}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 font-medium">Error Loading Data</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                    <button
                      onClick={loadSubmissions}
                      className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading submissions...</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                <p className="text-gray-500">There are no item submissions to display.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <Image
                                src={getImageUrl(item) || "/placeholder.svg"}
                                alt={item.item_name}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-lg object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg?height=48&width=48&text=No+Image"
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {item.item_name}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{item.item_condition}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.full_name}</div>
                          <div className="text-sm text-gray-500">{item.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.estimated_price ? `$${item.estimated_price.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.submission_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {item.status !== "listed" && (
                              <button
                                onClick={() => listOnEbay(item.id)}
                                disabled={actionLoading === item.id}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                              >
                                {actionLoading === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "List on eBay"
                                )}
                              </button>
                            )}

                            {item.status === "listed" && (
                              <button
                                onClick={() => unlistFromEbay(item.id)}
                                disabled={actionLoading === item.id}
                                className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                              >
                                {actionLoading === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlist"}
                              </button>
                            )}

                            {item.status === "pending" && (
                              <>
                                <button
                                  onClick={() => updateStatus(item.id, "approved")}
                                  disabled={actionLoading === item.id}
                                  className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateStatus(item.id, "rejected")}
                                  disabled={actionLoading === item.id}
                                  className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {item.status === "rejected" && (
                              <button
                                onClick={() => updateStatus(item.id, "pending")}
                                disabled={actionLoading === item.id}
                                className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 disabled:opacity-50"
                              >
                                Unreject
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedItem(item)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedItem.item_name}</h3>
                <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Image
                    src={getImageUrl(selectedItem) || "/placeholder.svg"}
                    alt={selectedItem.item_name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=300&width=300&text=No+Image"
                    }}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Customer Information</h4>
                    <p className="text-sm text-gray-600">Name: {selectedItem.full_name}</p>
                    <p className="text-sm text-gray-600">Email: {selectedItem.email}</p>
                    {selectedItem.phone && <p className="text-sm text-gray-600">Phone: {selectedItem.phone}</p>}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Item Details</h4>
                    <p className="text-sm text-gray-600">Condition: {selectedItem.item_condition}</p>
                    <p className="text-sm text-gray-600">
                      Price:{" "}
                      {selectedItem.estimated_price ? `$${selectedItem.estimated_price.toLocaleString()}` : "Not set"}
                    </p>
                    <p className="text-sm text-gray-600">Status: {selectedItem.status}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="text-sm text-gray-600">
                      {selectedItem.item_description || "No description provided"}
                    </p>
                  </div>
                  {selectedItem.item_issues && (
                    <div>
                      <h4 className="font-medium text-red-900">Issues</h4>
                      <p className="text-sm text-red-600">{selectedItem.item_issues}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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
