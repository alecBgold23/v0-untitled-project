/**
 * Fetch with timeout
 * @param url URL to fetch
 * @param options Fetch options
 * @param timeout Timeout in milliseconds
 * @returns Fetch response
 */
export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  })

  clearTimeout(id)
  return response
}

/**
 * Retry a fetch request
 * @param url URL to fetch
 * @param options Fetch options
 * @param retries Number of retries
 * @param delay Delay between retries in milliseconds
 * @returns Fetch response
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000,
): Promise<Response> {
  try {
    return await fetch(url, options)
  } catch (error) {
    if (retries <= 1) throw error
    await new Promise((resolve) => setTimeout(resolve, delay))
    return fetchWithRetry(url, options, retries - 1, delay)
  }
}
