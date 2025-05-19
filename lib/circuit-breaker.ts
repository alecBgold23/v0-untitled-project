// Simple in-memory circuit breaker implementation
// This is browser-compatible and doesn't use Node.js modules

// Circuit breaker state
type ServiceStatus = {
  available: boolean
  failureCount: number
  lastFailure: number
  successCount: number
}

// Configuration
const MAX_FAILURES = 5 // Number of failures before opening the circuit
const RESET_TIMEOUT = 60000 // 1 minute timeout before trying again
const SUCCESS_THRESHOLD = 3 // Number of successes needed to close the circuit

// Store service status
const serviceStatus: Record<string, ServiceStatus> = {}

/**
 * Check if a service is available
 * @param service Service name
 * @returns Boolean indicating if the service is available
 */
export function isServiceAvailable(service: string): boolean {
  if (!serviceStatus[service]) {
    // Initialize service status if it doesn't exist
    serviceStatus[service] = {
      available: true,
      failureCount: 0,
      lastFailure: 0,
      successCount: 0,
    }
    return true
  }

  const status = serviceStatus[service]

  // If the circuit is open, check if the reset timeout has passed
  if (!status.available) {
    const now = Date.now()
    if (now - status.lastFailure > RESET_TIMEOUT) {
      // Allow a single request through to test if the service is back
      console.log(`Circuit breaker for ${service} is half-open, allowing test request`)
      return true
    }
    return false
  }

  return true
}

/**
 * Record a service failure
 * @param service Service name
 */
export function recordFailure(service: string): void {
  if (!serviceStatus[service]) {
    serviceStatus[service] = {
      available: true,
      failureCount: 0,
      lastFailure: 0,
      successCount: 0,
    }
  }

  const status = serviceStatus[service]
  status.failureCount++
  status.lastFailure = Date.now()
  status.successCount = 0

  // Open the circuit if we've reached the failure threshold
  if (status.failureCount >= MAX_FAILURES) {
    status.available = false
    console.log(`Circuit breaker for ${service} is now open after ${status.failureCount} failures`)
  }
}

/**
 * Record a service success
 * @param service Service name
 */
export function recordSuccess(service: string): void {
  if (!serviceStatus[service]) {
    serviceStatus[service] = {
      available: true,
      failureCount: 0,
      lastFailure: 0,
      successCount: 0,
    }
    return
  }

  const status = serviceStatus[service]

  // If the circuit is open or half-open, increment success count
  if (!status.available) {
    status.successCount++

    // Close the circuit if we've reached the success threshold
    if (status.successCount >= SUCCESS_THRESHOLD) {
      status.available = true
      status.failureCount = 0
      console.log(`Circuit breaker for ${service} is now closed after ${status.successCount} successes`)
    }
  } else {
    // If the circuit is already closed, reset failure count
    status.failureCount = Math.max(0, status.failureCount - 1)
  }
}

/**
 * Get the current status of a service
 * @param service Service name
 * @returns Service status
 */
export function getServiceStatus(service: string): ServiceStatus {
  if (!serviceStatus[service]) {
    serviceStatus[service] = {
      available: true,
      failureCount: 0,
      lastFailure: 0,
      successCount: 0,
    }
  }

  return { ...serviceStatus[service] }
}

/**
 * Reset the circuit breaker for a service
 * @param service Service name
 */
export function resetCircuitBreaker(service: string): void {
  serviceStatus[service] = {
    available: true,
    failureCount: 0,
    lastFailure: 0,
    successCount: 0,
  }
  console.log(`Circuit breaker for ${service} has been manually reset`)
}
