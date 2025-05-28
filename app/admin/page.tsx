"use client"

import { useState, useEffect } from "react";
import Image from "next/image"
import { MoreHorizontal, Package, Users, DollarSign, CheckCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

type SubmissionStatus = "pending" | "approved" | "rejected" | "listed"

interface ItemSubmission {
  id: string
  customerName: string
  customerEmail: string
  itemName: string
  image: string
  condition: "New" | "Like New" | "Good" | "Fair" | "Poor"
  price: number
  status: SubmissionStatus
  submittedAt: string
  description: string
}

const mockSubmissions: ItemSubmission[] = []

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<ItemSubmission[]>(mockSubmissions)

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch('/api/admin/get-items');
      if (!res.ok) {
        console.error("Failed to fetch submissions");
        return;
      }
      const items = await res.json();
      setSubmissions(items);
    };
    fetchItems();
  }, []);

  const updateSubmissionStatus = (id: string, newStatus: SubmissionStatus) => {
    setSubmissions((prev) =>
      prev.map((submission) => (submission.id === id ? { ...submission, status: newStatus } : submission)),
    )
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
      New: "text-green-600",
      "Like New": "text-blue-600",
      Good: "text-yellow-600",
      Fair: "text-orange-600",
      Poor: "text-red-600",
    }
    return colors[condition as keyof typeof colors] || "text-gray-600"
  }

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    listed: submissions.filter((s) => s.status === "listed").length,
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="text-sm text-gray-500">Item Submissions Management</div>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Item Details</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <Image
                          src={submission.image || "/placeholder.svg"}
                          alt={submission.itemName}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{submission.itemName}</div>
                          <div className="text-sm text-gray-500 max-w-[200px] truncate">{submission.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{submission.customerName}</div>
                          <div className="text-sm text-gray-500">{submission.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getConditionColor(submission.condition)}`}>
                          {submission.condition}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">${submission.price.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleDateString()}
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
                              onClick={() => updateSubmissionStatus(submission.id, "listed")}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              List on eBay
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
                              <DropdownMenuItem>View details</DropdownMenuItem>
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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
