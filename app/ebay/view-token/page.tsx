"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function EbayViewTokenPage() {
  const searchParams = useSearchParams()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<string | null>(null)

  useEffect(() => {
    const access = searchParams.get("access_token")
    const refresh = searchParams.get("refresh_token")
    const expires = searchParams.get("expires_in")

    setAccessToken(access)
    setRefreshToken(refresh)
    setExpiresIn(expires)
  }, [searchParams])

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">🔐 eBay OAuth Tokens</h1>

      {!accessToken && (
        <p>No tokens found in URL. Please include access_token, refresh_token, and expires_in as query params.</p>
      )}

      {accessToken && (
        <div className="bg-gray-100 rounded p-4 text-left space-y-4">
          <div>
            <h2 className="font-semibold">Access Token</h2>
            <code className="block overflow-auto break-all bg-white p-2 border rounded">{accessToken}</code>
          </div>
          <div>
            <h2 className="font-semibold">Refresh Token</h2>
            <code className="block overflow-auto break-all bg-white p-2 border rounded">{refreshToken}</code>
          </div>
          <div>
            <h2 className="font-semibold">Expires In (seconds)</h2>
            <code className="block">{expiresIn}</code>
          </div>
        </div>
      )}
    </div>
  )
}
