"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react"

export function EnvDebug() {
  const [isOpen, setIsOpen] = useState(false)

  const envVars = [
    { name: "TWILIO_ACCOUNT_SID", value: process.env.TWILIO_ACCOUNT_SID },
    { name: "TWILIO_AUTH_TOKEN", value: process.env.TWILIO_AUTH_TOKEN },
    { name: "TWILIO_SERVICE_SID", value: process.env.TWILIO_SERVICE_SID },
    { name: "TWILIO_VERIFY_SERVICE_SID", value: process.env.TWILIO_VERIFY_SERVICE_SID },
    { name: "TWILIO_PHONE_NUMBER", value: process.env.TWILIO_PHONE_NUMBER },
    { name: "NEXT_PUBLIC_DEMO_MODE", value: process.env.NEXT_PUBLIC_DEMO_MODE },
    { name: "NEXT_PUBLIC_SKIP_SMS_VERIFICATION", value: process.env.NEXT_PUBLIC_SKIP_SMS_VERIFICATION },
  ]

  return (
    <div className="mb-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <div
        className="p-3 flex justify-between items-center cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Environment Variables Debug</span>
          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
            Developer Only
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </div>

      {isOpen && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            This panel shows the status of environment variables needed for phone verification.
          </p>

          <div className="space-y-2">
            {envVars.map((env) => (
              <div key={env.name} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs">{env.name}</span>
                <span className="flex items-center gap-1">
                  {env.value ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">Set</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">Missing</span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Demo mode is {process.env.NEXT_PUBLIC_DEMO_MODE === "true" ? "enabled" : "disabled"}.
              <br />
              SMS verification is {process.env.NEXT_PUBLIC_SKIP_SMS_VERIFICATION === "true" ? "skipped" : "required"}.
            </p>
          </div>

          <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={() => setIsOpen(false)}>
            Close Debug Panel
          </Button>
        </div>
      )}
    </div>
  )
}
