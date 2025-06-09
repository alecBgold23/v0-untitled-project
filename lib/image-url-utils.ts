/**
 * Utility functions for handling image URLs consistently throughout the application
 */

/**
 * Validates if a string is a proper URL
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false

  try {
    // Basic validation - must start with http:// or https://
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return false
    }

    // Try creating a URL object - will throw if invalid
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Normalizes an image URL to ensure it has the correct format
 */
export function normalizeImageUrl(url: string): string | null {
  if (!url) return null

  // Trim whitespace
  const trimmedUrl = url.trim()

  // Validate URL
  if (!isValidUrl(trimmedUrl)) {
    return null
  }

  return trimmedUrl
}

/**
 * Extracts valid image URLs from various possible formats
 * This handles all the legacy formats and normalizes them
 */
export function extractImageUrls(input: unknown): string[] {
  // If null or undefined, return empty array
  if (input == null) return []

  let urls: string[] = []

  // Case 1: input is already an array
  if (Array.isArray(input)) {
    urls = input
      .filter((item) => typeof item === "string")
      .map((url) => normalizeImageUrl(url as string))
      .filter((url): url is string => url !== null)
    return urls
  }

  // Case 2: input is a string that might be JSON
  if (typeof input === "string") {
    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(input)
      if (Array.isArray(parsed)) {
        return extractImageUrls(parsed) // Recursively handle the parsed array
      }
    } catch {
      // Not JSON, treat as comma-separated or single URL
      if (input.includes(",")) {
        // Comma-separated list
        urls = input
          .split(",")
          .map((url) => normalizeImageUrl(url))
          .filter((url): url is string => url !== null)
      } else {
        // Single URL
        const normalized = normalizeImageUrl(input)
        if (normalized) {
          urls = [normalized]
        }
      }
    }
  }

  // Remove duplicates
  return [...new Set(urls)]
}

/**
 * Prepares image URLs for storage in the database
 * Always returns a JSON string array
 */
export function prepareImageUrlsForStorage(urls: string | string[] | null | undefined): string[] {
  const extractedUrls = extractImageUrls(urls)
  return extractedUrls
}

/**
 * Gets the first valid image URL from an array or returns a placeholder
 */
export function getFirstImageUrl(
  urls: unknown,
  placeholder = "/placeholder.svg?height=300&width=300&text=No+Image",
): string {
  const extractedUrls = extractImageUrls(urls)
  return extractedUrls.length > 0 ? extractedUrls[0] : placeholder
}
