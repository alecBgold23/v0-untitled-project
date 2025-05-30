// app/dashboard/page.tsx
"use client"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")

    if (!code) {
      setError("Authorization code not found in URL.")
      setLoading(false)
      return
    }

    // Exchange the authorization code for an access token
    fetch("/api/ebay/oauth-exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setToken(data.access_token)
        }
      })
      .catch(() => {
        setError("Error exchanging authorization code.")
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">eBay Access Token</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-scroll">{token}</pre>
    </div>
  )
}
