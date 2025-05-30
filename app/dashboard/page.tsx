"use client"

import { useSearchParams } from "next/navigation"

export default function Dashboard() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">Dashboard</h1>
        {token ? (
          <>
            <p className="mb-2 text-gray-700 font-medium">Access Token:</p>
            <textarea
              className="w-full rounded border border-gray-300 p-2 text-sm font-mono"
              rows={6}
              readOnly
              value={token}
            />
          </>
        ) : (
          <p className="text-gray-600">No token provided in URL.</p>
        )}
      </div>
    </div>
  )
}
