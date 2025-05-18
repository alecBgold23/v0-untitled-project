"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export function OpenAIAPIStatus() {
  return (
    <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
      <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-800 dark:text-blue-300">OpenAI API Setup</AlertTitle>
      <AlertDescription className="text-blue-700 dark:text-blue-400">
        The OpenAI API key setup will be configured later.
      </AlertDescription>
    </Alert>
  )
}
