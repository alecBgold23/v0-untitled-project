"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const EBAY_OAUTH_URL = `https://auth.ebay.com/oauth2/authorize?` +
  new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_EBAY_CLIENT_ID!, // or your env var name here
    response_type: "code",
    redirect_uri: "https://www.bluberryhq.com/auth/callback", // Your actual redirect URL (must match eBay app)
    scope: [
      "https://api.ebay.com/oauth/api_scope",
      "https://api.ebay.com/oauth/api_scope/sell.inventory",
      "https://api.ebay.com/oauth/api_scope/sell.account",
      "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
      // add other scopes you need
    ].join(" "),
  })

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("Processing authorization...")
  const [error, setError] = useState("")

  const code = searchParams.get("code")
  const errorParam = searchParams.get("error")

  useEffect(() => {
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
          setTimeout(() => {
            router.push("/dashboard")
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
  }, [code, errorParam, router])

  // If missing code and no error, show the button to start authorization
  if (!code && !errorParam) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">eBay Authorization</h1>
          <p className="mb-6 text-gray-600">To continue, please authorize BluBerry with eBay.</p>
          <a
            href={EBAY_OAUTH_URL}
            className="inline-block rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Authorize with eBay
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">eBay Authorization</h1>
        <p className="mb-4 text-gray-600">{status}</p>
        {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Error: {error}</div>}
      </div>
    </div>
  )
}
