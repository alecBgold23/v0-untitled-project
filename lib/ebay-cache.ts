/**
 * In-memory cache for eBay API responses
 * This helps reduce API calls and improve performance
 */
const cache: Record<string, { data: any; timestamp: number }> = {}

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000

/**
 * Generates a cache key from the request parameters
 * @param type Request type (e.g., 'search', 'item')
 * @param params Request parameters
 * @returns Cache key
 */
export function generateCacheKey(type: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join("|")

  return `${type}:${sortedParams}`
}

/**
 * Gets cached data if available and not expired
 * @param key Cache key
 * @returns Cached data or null if not found or expired
 */
export function getCachedData(key: string): any | null {
  const cachedItem = cache[key]

  if (!cachedItem) {
    return null
  }

  const now = Date.now()

  // Check if cache is expired
  if (now - cachedItem.timestamp > CACHE_EXPIRATION) {
    // Remove expired cache
    delete cache[key]
    return null
  }

  return cachedItem.data
}

/**
 * Caches data with the given key
 * @param key Cache key
 * @param data Data to cache
 */
export function cacheData(key: string, data: any): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  }

  // Clean up old cache entries periodically
  if (Object.keys(cache).length > 100) {
    cleanupCache()
  }
}

/**
 * Cleans up expired cache entries
 */
function cleanupCache(): void {
  const now = Date.now()

  Object.keys(cache).forEach((key) => {
    if (now - cache[key].timestamp > CACHE_EXPIRATION) {
      delete cache[key]
    }
  })
}
