/**
 * Generate a cache key for eBay API requests
 */
export function generateCacheKey(query: string, filters?: Record<string, any>): string {
  const filterString = filters ? JSON.stringify(filters) : ""
  return `ebay_${query}_${filterString}`.replace(/\s+/g, "_").toLowerCase()
}

/**
 * Get cached data for eBay API requests
 */
export function getCachedData<T>(key: string): T | null {
  try {
    if (typeof window === "undefined") return null

    const cachedData = localStorage.getItem(key)
    if (!cachedData) return null

    const { data, expiry } = JSON.parse(cachedData)

    // Check if cache is expired
    if (expiry < Date.now()) {
      localStorage.removeItem(key)
      return null
    }

    return data as T
  } catch (error) {
    console.error("Error getting cached data:", error)
    return null
  }
}

/**
 * Cache data for eBay API requests
 */
export function cacheData<T>(key: string, data: T, ttlMinutes = 60): void {
  try {
    if (typeof window === "undefined") return

    const expiry = Date.now() + ttlMinutes * 60 * 1000
    localStorage.setItem(key, JSON.stringify({ data, expiry }))
  } catch (error) {
    console.error("Error caching data:", error)
  }
}
