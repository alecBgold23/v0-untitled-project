"use client"

import type React from "react"
import { extractImageUrls, getFirstImageUrl } from "@/lib/image-url-utils"
import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@supabase/supabase-js"

// Icons
import {
  Package,
  Users,
  DollarSign,
  CheckCircle,
  Loader2,
  AlertCircle,
  X,
  LogOut,
  Eye,
  Edit3,
  MoreHorizontal,
  ShoppingCart,
  XCircle,
  Search,
  Download,
  RefreshCw,
  TrendingUp,
  Activity,
} from "lucide-react"

// UI Components
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Types
interface ItemSubmission {
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
  status: "pending" | "approved" | "rejected" | "listed"
  submission_date: string
  image_path: string | null
  image_url: string[] | null
  image_urls: string[] | null
  estimated_price: number | null
  item_condition: "Like New" | "Excellent" | "Good" | "Fair" | "Poor"
  ebay_listing_id: string | null
  ebay_offer_id: string | null
  ebay_sku: string | null
  ebay_status: string | null
  listed_on_ebay: boolean | null
}

interface AdminStats {
  total: number
  pending: number
  approved: number
  rejected: number
  listedOnEbay: number
  notListed: number
  totalValue: number
  avgValue: number
}

export default function AdminDashboard() {
  // Authentication State
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordError, setPasswordError] = useState(false)

  // Data State
  const [submissions, setSubmissions] = useState<ItemSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<ItemSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Filter and Search State
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [conditionFilter, setConditionFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("overview")

  // Action States
  const [listingLoading, setListingLoading] = useState<string | null>(null)
  const [unlistingLoading, setUnlistingLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // UI States
  const [selectedItem, setSelectedItem] = useState<ItemSubmission | null>(null)
  const [itemImages, setItemImages] = useState<string[]>([])
  const [editingDescription, setEditingDescription] = useState<string | null>(null)
  const [editedDescription, setEditedDescription] = useState("")

  // Initialize authentication
  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuthenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  // Authentication handlers
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

  // Utility Functions
  const formatImageUrl = (url: string): string => {
    if (!url || url.startsWith("http")) return url

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

    if (!projectId) return url

    const cleanPath = url.replace(/^\/?(item_images\/)?/, "")
    return `https://${projectId}.supabase.co/storage/v1/object/public/item_images/${cleanPath}`
  }

  const isListedOnEbay = (item: ItemSubmission): boolean => {
    return ["listed", "active", "processing"].includes(item.ebay_status?.toLowerCase() || "")
  }

  const getEbayStatusDisplay = (ebayStatus: string | null): string => {
    if (!ebayStatus) return "Not Listed"
    return ebayStatus.charAt(0).toUpperCase() + ebayStatus.slice(1)
  }

  const getEbayStatusVariant = (ebayStatus: string | null) => {
    const status = ebayStatus?.toLowerCase()
    switch (status) {
      case "listed":
      case "active":
        return "default"
      case "processing":
        return "secondary"
      case "unlisted":
      case "failed":
        return "destructive"
      case "ended":
        return "outline"
      case "sold":
        return "default"
      default:
        return "secondary"
    }
  }

  const getConditionColor = (condition: string) => {
    const colors = {
      "Like New": "text-emerald-600 bg-emerald-50 border-emerald-200",
      Excellent: "text-blue-600 bg-blue-50 border-blue-200",
      Good: "text-amber-600 bg-amber-50 border-amber-200",
      Fair: "text-orange-600 bg-orange-50 border-orange-200",
      Poor: "text-red-600 bg-red-50 border-red-200",
    }
    return colors[condition as keyof typeof colors] || "text-gray-600 bg-gray-50 border-gray-200"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "text-amber-700 bg-amber-50 border-amber-200",
      approved: "text-emerald-700 bg-emerald-50 border-emerald-200",
      rejected: "text-red-700 bg-red-50 border-red-200",
      listed: "text-blue-700 bg-blue-50 border-blue-200",
    }
    return colors[status as keyof typeof colors] || "text-gray-700 bg-gray-50 border-gray-200"
  }

  // Data fetching
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchSubmissions = async () => {
      setLoading(true)
      setFetchError(null)

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        const { data, error } = await supabase
          .from("sell_items")
          .select("*")
          .order("submission_date", { ascending: false })

        if (error) throw error

        const processedData = data?.map((item) => {
          const allImages = extractImageUrls(item.image_urls || item.image_url)
          const formattedImages = allImages.map(formatImageUrl)

          return {
            ...item,
            image_url: formattedImages.length > 0 ? formattedImages : null,
            image_urls: formattedImages,
          }
        })

        setSubmissions(processedData || [])
      } catch (error) {
        console.error("Failed to fetch submissions:", error)
        setFetchError(error instanceof Error ? error.message : "Failed to fetch submissions")
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [isAuthenticated])

  // Filter submissions
  useEffect(() => {
    let filtered = submissions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.item_description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    // Condition filter
    if (conditionFilter !== "all") {
      filtered = filtered.filter((item) => item.item_condition === conditionFilter)
    }

    setFilteredSubmissions(filtered)
  }, [submissions, searchTerm, statusFilter, conditionFilter])

  // Action handlers
  const listItemOnEbay = async (id: string) => {
    setListingLoading(id)
    setActionError(null)
    setActionSuccess(null)

    try {
      const response = await fetch("/api/list-item-on-ebay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      // Update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "listed",
                ebay_status: "listed",
                ebay_listing_id: result.listingId,
                ebay_offer_id: result.ebay_offer_id,
                listed_on_ebay: true,
              }
            : item,
        ),
      )

      setActionSuccess("Item successfully listed on eBay!")
      console.log(`✅ Successfully listed item ${id} on eBay`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error(`❌ Failed to list item ${id}:`, errorMessage)
      setActionError(`Failed to list item: ${errorMessage}`)
    } finally {
      setListingLoading(null)
    }
  }

  const unlistItemFromEbay = async (id: string) => {
    setUnlistingLoading(id)
    setActionError(null)
    setActionSuccess(null)

    try {
      const response = await fetch("/api/unlist-ebay-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      // Update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "approved",
                ebay_status: "unlisted",
                listed_on_ebay: false,
              }
            : item,
        ),
      )

      setActionSuccess("Item successfully unlisted from eBay!")
      console.log(`✅ Successfully unlisted item ${id} from eBay`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error(`❌ Failed to unlist item ${id}:`, errorMessage)
      setActionError(`Failed to unlist item: ${errorMessage}`)
    } finally {
      setUnlistingLoading(null)
    }
  }

  const updateSubmissionStatus = async (id: string, newStatus: "pending" | "approved" | "rejected" | "listed") => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { error } = await supabase.from("sell_items").update({ status: newStatus }).eq("id", id)

      if (error) throw error

      setSubmissions((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)))
      setActionSuccess(`Item status updated to ${newStatus}!`)
    } catch (error) {
      console.error("Failed to update status:", error)
      setActionError("Failed to update item status")
    }
  }

  const updateItemDescription = async (id: string, newDescription: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { error } = await supabase.from("sell_items").update({ item_description: newDescription }).eq("id", id)

      if (error) throw error

      setSubmissions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, item_description: newDescription } : item)),
      )

      setEditingDescription(null)
      setEditedDescription("")
      setActionSuccess("Description updated successfully!")
    } catch (error) {
      console.error("Failed to update description:", error)
      setActionError("Failed to update description")
    }
  }

  // UI handlers
  const viewItemDetails = (item: ItemSubmission) => {
    setSelectedItem(item)
    const allImages = extractImageUrls(item.image_urls || item.image_url)
    const formattedImages = allImages.map(formatImageUrl)
    setItemImages(
      formattedImages.length > 0 ? formattedImages : ["/placeholder.svg?height=400&width=400&text=No+Image"],
    )
  }

  const startEditingDescription = (id: string, currentDescription: string) => {
    setEditingDescription(id)
    setEditedDescription(currentDescription)
  }

  const cancelEditingDescription = () => {
    setEditingDescription(null)
    setEditedDescription("")
  }

  // Calculate stats
  const stats: AdminStats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
    listedOnEbay: submissions.filter((s) => isListedOnEbay(s)).length,
    notListed: submissions.filter((s) => !isListedOnEbay(s)).length,
    totalValue: submissions.reduce((sum, item) => sum + (item.estimated_price || 0), 0),
    avgValue:
      submissions.length > 0
        ? submissions.reduce((sum, item) => sum + (item.estimated_price || 0), 0) / submissions.length
        : 0,
  }

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Admin Access</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Enter your password to access the admin dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 ${passwordError ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {passwordError && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Incorrect password. Please try again.
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Item Submissions Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Action Messages */}
        {actionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-grow">
                <h4 className="text-sm font-semibold text-red-800 mb-1">Action Failed</h4>
                <p className="text-red-700 text-sm">{actionError}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setActionError(null)} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {actionSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="flex-grow">
                <h4 className="text-sm font-semibold text-emerald-800 mb-1">Success</h4>
                <p className="text-emerald-700 text-sm">{actionSuccess}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setActionSuccess(null)} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <Package className="h-4 w-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900">Total Items</CardTitle>
                  <Package className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                  <p className="text-xs text-blue-700 mt-1">All submissions</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-900">Pending Review</CardTitle>
                  <Users className="h-5 w-5 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-900">{stats.pending}</div>
                  <p className="text-xs text-amber-700 mt-1">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-900">Listed on eBay</CardTitle>
                  <ShoppingCart className="h-5 w-5 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-900">{stats.listedOnEbay}</div>
                  <p className="text-xs text-emerald-700 mt-1">Active listings</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-900">Total Value</CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">${stats.totalValue.toLocaleString()}</div>
                  <p className="text-xs text-purple-700 mt-1">Estimated worth</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Submissions
                </CardTitle>
                <CardDescription>Latest item submissions requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((item) => {
                    const allImages = extractImageUrls(item.image_urls || item.image_url)
                    const firstImage = getFirstImageUrl(allImages.map(formatImageUrl))

                    return (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <Image
                          src={firstImage || "/placeholder.svg?height=48&width=48&text=No+Image"}
                          alt={item.item_name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-grow">
                          <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                          <p className="text-sm text-gray-600">{item.full_name}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(item.status)} border`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.submission_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            {/* Filters */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Filters & Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-grow">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search items, customers, or descriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="listed">Listed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={conditionFilter} onValueChange={setConditionFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filter by condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conditions</SelectItem>
                      <SelectItem value="Like New">Like New</SelectItem>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Main Table */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Item Submissions</CardTitle>
                    <CardDescription>
                      Showing {filteredSubmissions.length} of {submissions.length} submissions
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {fetchError ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 font-medium">Error loading submissions</p>
                    <p className="text-sm text-gray-500 mt-1">{fetchError}</p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mr-3" />
                    <span>Loading submissions...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200">
                          <TableHead className="w-[80px]">Image</TableHead>
                          <TableHead className="min-w-[200px]">Item Details</TableHead>
                          <TableHead className="min-w-[180px]">Customer</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>eBay Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.map((item) => {
                          const allImages = extractImageUrls(item.image_urls || item.image_url)
                          const firstImage = getFirstImageUrl(allImages.map(formatImageUrl))
                          const imageCount = allImages.length

                          return (
                            <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50">
                              <TableCell>
                                <div className="relative">
                                  <Image
                                    src={firstImage || "/placeholder.svg?height=60&width=60&text=No+Image"}
                                    alt={item.item_name}
                                    width={60}
                                    height={60}
                                    className="rounded-lg object-cover border border-slate-200"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.svg?height=60&width=60&text=No+Image"
                                    }}
                                  />
                                  {imageCount > 1 && (
                                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                      {imageCount}
                                    </div>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="space-y-2">
                                  <div className="font-semibold text-gray-900 text-sm line-clamp-2">
                                    {item.item_name}
                                  </div>
                                  {editingDescription === item.id ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        value={editedDescription}
                                        onChange={(e) => setEditedDescription(e.target.value)}
                                        className="text-xs resize-none"
                                        rows={2}
                                      />
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          onClick={() => updateItemDescription(item.id, editedDescription)}
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
                                      <div className="text-xs text-gray-600 line-clamp-2">
                                        {item.item_description || "No description"}
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="link"
                                          size="sm"
                                          onClick={() => startEditingDescription(item.id, item.item_description)}
                                          className="h-4 p-0 text-xs text-blue-600 hover:text-blue-800"
                                        >
                                          <Edit3 className="h-3 w-3 mr-1" />
                                          Edit
                                        </Button>
                                        <Button
                                          variant="link"
                                          size="sm"
                                          onClick={() => viewItemDetails(item)}
                                          className="h-4 p-0 text-xs text-blue-600 hover:text-blue-800"
                                        >
                                          <Eye className="h-3 w-3 mr-1" />
                                          View ({imageCount})
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  {item.item_issues && (
                                    <div className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                                      Issues: {item.item_issues}
                                    </div>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="text-xs bg-slate-100">
                                        {item.full_name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium text-sm text-gray-900">{item.full_name}</div>
                                      <div className="text-xs text-gray-600">{item.email}</div>
                                    </div>
                                  </div>
                                  {item.phone && <div className="text-xs text-gray-500 ml-10">{item.phone}</div>}
                                </div>
                              </TableCell>

                              <TableCell>
                                <Badge className={`${getConditionColor(item.item_condition)} border font-medium`}>
                                  {item.item_condition}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <div className="font-semibold text-gray-900">
                                  {item.estimated_price ? `$${item.estimated_price.toLocaleString()}` : "—"}
                                </div>
                              </TableCell>

                              <TableCell>
                                <Badge className={`${getStatusColor(item.status)} border font-medium`}>
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <Badge variant={getEbayStatusVariant(item.ebay_status)} className="font-medium">
                                  {getEbayStatusDisplay(item.ebay_status)}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <div className="text-sm text-gray-600">
                                  {new Date(item.submission_date).toLocaleDateString()}
                                </div>
                              </TableCell>

                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {!isListedOnEbay(item) && (
                                    <Button
                                      size="sm"
                                      onClick={() => listItemOnEbay(item.id)}
                                      disabled={listingLoading === item.id}
                                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                      {listingLoading === item.id ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                          Listing...
                                        </>
                                      ) : (
                                        "List on eBay"
                                      )}
                                    </Button>
                                  )}

                                  {isListedOnEbay(item) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => unlistItemFromEbay(item.id)}
                                      disabled={unlistingLoading === item.id}
                                      className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                                    >
                                      {unlistingLoading === item.id ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                          Unlisting...
                                        </>
                                      ) : (
                                        "Unlist"
                                      )}
                                    </Button>
                                  )}

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => viewItemDetails(item)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View details
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {item.status !== "approved" && (
                                        <DropdownMenuItem onClick={() => updateSubmissionStatus(item.id, "approved")}>
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve
                                        </DropdownMenuItem>
                                      )}
                                      {item.status !== "rejected" && (
                                        <DropdownMenuItem
                                          onClick={() => updateSubmissionStatus(item.id, "rejected")}
                                          className="text-red-600"
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject
                                        </DropdownMenuItem>
                                      )}
                                      {item.status === "rejected" && (
                                        <DropdownMenuItem onClick={() => updateSubmissionStatus(item.id, "pending")}>
                                          <RefreshCw className="h-4 w-4 mr-2" />
                                          Unreject
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="font-semibold">{stats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="font-semibold">{stats.approved}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rejected</span>
                      <span className="font-semibold">{stats.rejected}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Listed on eBay</span>
                      <span className="font-semibold">{stats.listedOnEbay}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Value Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Value</span>
                      <span className="font-semibold">${stats.totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Value</span>
                      <span className="font-semibold">${Math.round(stats.avgValue).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Listed Value</span>
                      <span className="font-semibold">
                        $
                        {submissions
                          .filter((s) => isListedOnEbay(s))
                          .reduce((sum, item) => sum + (item.estimated_price || 0), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Item Details Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedItem.item_name}
                <Badge variant={getEbayStatusVariant(selectedItem.ebay_status)} className="font-medium">
                  {getEbayStatusDisplay(selectedItem.ebay_status)}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Submitted by {selectedItem.full_name} on {new Date(selectedItem.submission_date).toLocaleDateString()} •{" "}
                {itemImages.length} photos
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4 flex-grow overflow-hidden">
              {/* Images Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Images ({itemImages.length})</h3>
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {itemImages.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                    >
                      <Image
                        src={url || "/placeholder.svg"}
                        alt={`${selectedItem.item_name} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=200&text=No+Image"
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {index + 1} of {itemImages.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Section */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Item Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Condition:</span>
                        <Badge className={`${getConditionColor(selectedItem.item_condition)} border`}>
                          {selectedItem.item_condition}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Price:</span>
                        <span className="font-semibold">
                          {selectedItem.estimated_price
                            ? `$${selectedItem.estimated_price.toLocaleString()}`
                            : "Not estimated"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={`${getStatusColor(selectedItem.status)} border`}>
                          {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">eBay Status:</span>
                        <Badge variant={getEbayStatusVariant(selectedItem.ebay_status)}>
                          {getEbayStatusDisplay(selectedItem.ebay_status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-slate-100">
                            {selectedItem.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedItem.full_name}</div>
                          <div className="text-gray-600">{selectedItem.email}</div>
                        </div>
                      </div>
                      {selectedItem.phone && (
                        <div className="text-gray-600">
                          <span className="font-medium">Phone:</span> {selectedItem.phone}
                        </div>
                      )}
                      {selectedItem.address && (
                        <div className="text-gray-600">
                          <span className="font-medium">Address:</span> {selectedItem.address}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Description</h3>
                    <div className="text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border">
                      {selectedItem.item_description || "No description provided"}
                    </div>
                  </div>

                  {selectedItem.item_issues && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-semibold text-red-600 mb-3">Known Issues</h3>
                        <div className="text-sm whitespace-pre-wrap bg-red-50 p-4 rounded-lg border border-red-200 text-red-800">
                          {selectedItem.item_issues}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="gap-3">
              {!isListedOnEbay(selectedItem) && (
                <Button
                  onClick={() => {
                    listItemOnEbay(selectedItem.id)
                    setSelectedItem(null)
                  }}
                  disabled={listingLoading === selectedItem.id}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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

              {isListedOnEbay(selectedItem) && (
                <Button
                  onClick={() => {
                    unlistItemFromEbay(selectedItem.id)
                    setSelectedItem(null)
                  }}
                  disabled={unlistingLoading === selectedItem.id}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                >
                  {unlistingLoading === selectedItem.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Unlisting...
                    </>
                  ) : (
                    "Unlist from eBay"
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
