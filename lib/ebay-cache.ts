/**
 * Simple in-memory cache for eBay results
 * In a production environment, this should be replaced with Redis or another distributed cache
 */

interface CacheEntry {
  data: any
  timestamp: number
}

// Cache storage
const cache: Record<string, CacheEntry> = {}

// Cache TTL in milliseconds (6 hours)
const CACHE_TTL = 6 * 60 * 60 * 1000

/**
 * Generate a cache key from search parameters
 * @param params Search parameters
 * @returns Cache key
 */
export function generateCacheKey(type: string, params: Record<string, any>): string {
  const sortedParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")

  return `ebay:${type}:${sortedParams}`
}

/**
 * Get data from cache
 * @param key Cache key
 * @returns Cached data or null if not found or expired
 */
export function getCachedData(key: string): any | null {
  const entry = cache[key]

  if (!entry) {
    return null
  }

  // Check if entry is expired
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete cache[key]
    return null
  }

  return entry.data
}

/**
 * Store data in cache
 * @param key Cache key
 * @param data Data to cache
 */
export function cacheData(key: string, data: any): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  }
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  Object.keys(cache).forEach((key) => {
    delete cache[key]
  })
}
