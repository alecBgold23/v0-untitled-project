"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("Processing authorization...")
  const [error, setError] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    const errorParam = searchParams.get("error")

    if (errorParam) {
      setStatus("Authorization failed")
      setError(errorParam)
      return
    }

    if (!code) {
      setStatus("Missing authorization code")
      return
    }

    const exchangeCode = async () => {
      try {
        setStatus("Exchanging authorization code for token...")

        const res = await fetch("/api/ebay/oauth-exchange", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        const data = await res.json()

        if (res.ok) {
          setStatus("Authorization successful! Redirecting...")

          const accessToken = data.access_token
          const refreshToken = data.refresh_token
          const expiresIn = data.expires_in

          // Redirect to dashboard passing all tokens as query parameters
          setTimeout(() => {
            router.push(
              `/dashboard?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(
                refreshToken
              )}&expires_in=${encodeURIComponent(expiresIn)}`
            )
          }, 1000)
        } else {
          setStatus("Authorization failed")
          setError(data.error || "Failed to exchange authorization code")
        }
      } catch (err) {
        setStatus("Authorization failed")
        setError("An unexpected error occurred")
        console.error("Fetch failed:", err)
      }
    }

    exchangeCode()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">eBay Authorization</h1>
        <p className="mb-4 text-gray-600">{status}</p>
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  )
}
