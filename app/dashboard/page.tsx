'use client'

import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [tokenData, setTokenData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (!code) {
      setError('Authorization code not found in URL.')
      setLoading(false)
      return
    }

    const getToken = async () => {
      try {
        const res = await fetch('/api/ebay/oauth-exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Token exchange failed')
        } else {
          setTokenData(data)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Something went wrong while fetching token.')
      } finally {
        setLoading(false)
      }
    }

    getToken()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">eBay Token Dashboard</h1>

      {loading && <p>Loading token...</p>}

      {error && (
        <div className="text-red-600">
          <p>Error: {error}</p>
        </div>
      )}

      {tokenData && (
        <div className="text-sm space-y-2">
          <p><strong>Access Token:</strong> {tokenData.access_token}</p>
          <p><strong>Token Type:</strong> {tokenData.token_type}</p>
          <p><strong>Expires In:</strong> {tokenData.expires_in} seconds</p>
          <p><strong>Success:</strong> {tokenData.success ? '✅' : '❌'}</p>
        </div>
      )}
    </div>
  )
}
