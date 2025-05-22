"use client"

import { useState } from "react"
import { getPhotoCount, updatePhotoCount } from "@/lib/supabase-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, RefreshCw, ImageIcon } from "lucide-react"

export default function PhotoCountManager() {
  const [itemId, setItemId] = useState("")
  const [photoCount, setPhotoCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPhotoCount = async () => {
    if (!itemId) {
      setError("Please enter an item ID")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const count = await getPhotoCount(itemId)
      setPhotoCount(count)
    } catch (err) {
      console.error("Error fetching photo count:", err)
      setError(err instanceof Error ? err.message : "Unknown error fetching photo count")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCount = async () => {
    if (!itemId) {
      setError("Please enter an item ID")
      return
    }

    setUpdating(true)
    setError(null)

    try {
      const success = await updatePhotoCount(itemId)
      if (success) {
        // Refresh the count after updating
        const count = await getPhotoCount(itemId)
        setPhotoCount(count)
      } else {
        setError("Failed to update photo count in database")
      }
    } catch (err) {
      console.error("Error updating photo count:", err)
      setError(err instanceof Error ? err.message : "Unknown error updating photo count")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Photo Count Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="itemId" className="text-sm font-medium">
            Item ID
          </label>
          <div className="flex space-x-2">
            <Input id="itemId" value={itemId} onChange={(e) => setItemId(e.target.value)} placeholder="Enter item ID" />
            <Button onClick={fetchPhotoCount} disabled={loading || !itemId}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
            </Button>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {photoCount !== null && (
          <div className="bg-gray-100 p-4 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium">Photo Count:</span>
            </div>
            <span className="text-xl font-bold">{photoCount}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdateCount} disabled={updating || !itemId} className="w-full" variant="outline">
          {updating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Count in Database
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
