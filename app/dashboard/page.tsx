"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Dashboard() {
  const searchParams = useSearchParams()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const access = searchParams.get("access_token")
    const refresh = searchParams.get("refresh_token")
    const expires = searchParams.get("expires_in")

    setAccessToken(access)
    setRefreshToken(refresh)
    setExpiresIn(expires)

    // Auto-save tokens if they exist
    if (access && refresh && expires) {
      saveTokensToSupabase(access, refresh, Number.parseInt(expires))
    }
  }, [searchParams])

  const saveTokensToSupabase = async (accessToken: string, refreshToken: string, expiresIn: number) => {
    setSaveStatus("saving")
    setErrorMessage("")

    try {
      const expiresAt = Date.now() + expiresIn * 1000

      const upsertPayload = {
        id: "singleton",
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("ebay_tokens").upsert(upsertPayload, { onConflict: "id" })

      if (error) {
        console.error("❌ Supabase upsert error:", error.message)
        setSaveStatus("error")
        setErrorMessage(error.message)
      } else {
        console.log("✅ Tokens saved to Supabase successfully")
        setSaveStatus("success")
      }
    } catch (error) {
      console.error("❌ Unexpected error saving tokens:", error)
      setSaveStatus("error")
      setErrorMessage("Unexpected error occurred")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">🔐 eBay OAuth Dashboard</h1>

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

          {/* Save Status */}
          <div className="mt-4 p-3 rounded border">
            <h3 className="font-semibold mb-2">Supabase Save Status:</h3>
            {saveStatus === "idle" && <p className="text-gray-600">Ready to save...</p>}
            {saveStatus === "saving" && <p className="text-blue-600">💾 Saving tokens to Supabase...</p>}
            {saveStatus === "success" && <p className="text-green-600">✅ Tokens saved successfully!</p>}
            {saveStatus === "error" && (
              <div>
                <p className="text-red-600">❌ Error saving tokens:</p>
                <p className="text-red-500 text-sm">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Manual Save Button */}
          {accessToken && refreshToken && expiresIn && (
            <button
              onClick={() => saveTokensToSupabase(accessToken, refreshToken, Number.parseInt(expiresIn))}
              disabled={saveStatus === "saving"}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saveStatus === "saving" ? "Saving..." : "Save Tokens to Supabase"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
