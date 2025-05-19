/**
 * Safely parses JSON from a fetch response
 * @param response The fetch response
 * @returns The parsed JSON data
 * @throws Error if the response is not ok or if JSON parsing fails
 */
export async function safeJsonParse(response: Response) {
  if (!response.ok) {
    throw new Error(`API responded with status: ${response.status}`)
  }

  try {
    return await response.json()
  } catch (error) {
    console.error("Error parsing JSON response:", error)
    throw new Error("Failed to parse response as JSON")
  }
}

/**
 * Makes a fetch request and safely parses the JSON response
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns The parsed JSON data
 */
export async function fetchJson(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options)
    return await safeJsonParse(response)
  } catch (error) {
    console.error("Fetch error:", error)
    throw error
  }
}
