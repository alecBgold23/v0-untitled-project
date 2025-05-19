/**
 * Simple in-memory circuit breaker to prevent repeated calls to failing services
 */

// Track failures for different services
const failures: Record<string, { count: number; lastFailure: number }> = {}

// Circuit breaker settings
const MAX_FAILURES = 3 // Number of failures before opening the circuit
const RESET_TIMEOUT = 5 * 60 * 1000 // 5 minutes before resetting the circuit

/**
 * Check if a service is available or if the circuit is open
 * @param service The service identifier
 * @returns Boolean indicating if the service should be used
 */
export function isServiceAvailable(service: string): boolean {
  const serviceFailures = failures[service]

  // If no failures recorded, service is available
  if (!serviceFailures) {
    return true
  }

  // Check if enough time has passed to reset the circuit
  const timeSinceLastFailure = Date.now() - serviceFailures.lastFailure
  if (timeSinceLastFailure > RESET_TIMEOUT) {
    // Reset the circuit
    delete failures[service]
    return true
  }

  // If we've had too many failures, circuit is open
  return serviceFailures.count < MAX_FAILURES
}

/**
 * Record a service failure
 * @param service The service identifier
 */
export function recordFailure(service: string): void {
  if (!failures[service]) {
    failures[service] = { count: 0, lastFailure: 0 }
  }

  failures[service].count++
  failures[service].lastFailure = Date.now()

  console.warn(`Service ${service} failure recorded. Count: ${failures[service].count}`)
}

/**
 * Record a service success
 * @param service The service identifier
 */
export function recordSuccess(service: string): void {
  // If we have a success, reduce the failure count
  if (failures[service]) {
    failures[service].count = Math.max(0, failures[service].count - 1)

    // If no more failures, remove the entry
    if (failures[service].count === 0) {
      delete failures[service]
    }
  }
}

/**
 * Get the current status of a service
 * @param service The service identifier
 * @returns Object with service status information
 */
export function getServiceStatus(service: string): {
  available: boolean
  failureCount: number
  timeSinceLastFailure: number | null
} {
  const serviceFailures = failures[service]

  if (!serviceFailures) {
    return {
      available: true,
      failureCount: 0,
      timeSinceLastFailure: null,
    }
  }

  const timeSinceLastFailure = Date.now() - serviceFailures.lastFailure

  return {
    available: serviceFailures.count < MAX_FAILURES || timeSinceLastFailure > RESET_TIMEOUT,
    failureCount: serviceFailures.count,
    timeSinceLastFailure,
  }
}
