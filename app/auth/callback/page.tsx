"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  useEffect(() => {
    if (!code) return

    async function exchangeCode() {
      try {
        const res = await fetch("/api/ebay/oauth-exchange", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })
        const data = await res.json()

        if (res.ok) {
          router.push("/dashboard") // or your desired page
        } else {
          console.error(data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    exchangeCode()
  }, [code])

  if (error) {
    return <div>Error during authorization: {error}</div>
  }

  return <div>Processing authorization...</div>
}
