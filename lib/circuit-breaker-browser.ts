// Browser-compatible circuit breaker implementation

// Service status tracking
interface ServiceStatus {
  available: boolean
  failureCount: number
  lastFailure: number
  successCount: number
}

// In-memory store for service status
const serviceStatus: Record<string, ServiceStatus> = {}

// Constants
const FAILURE_THRESHOLD = 5 // Number of failures before circuit opens
const RESET_TIMEOUT = 60000 // 1 minute timeout before trying again
const SUCCESS_THRESHOLD = 3 // Number of successes needed to close circuit

/**
 * Check if a service is available (circuit is closed)
 */
export function isServiceAvailable(serviceName: string): boolean {
  // Initialize service status if it doesn't exist
  if (!serviceStatus[serviceName]) {
    serviceStatus[serviceName] = {
      available: true,
      failureCount: 0,
      lastFailure: 0,
      successCount: 0,
    }
  }

  const status = serviceStatus[serviceName]

  // If circuit is open, check if reset timeout has elapsed
  if (!status.available) {
    const now = Date.now()
    const timeElapsed = now - status.lastFailure

    // Allow a single request through after timeout
    if (timeElapsed > RESET_TIMEOUT) {
      console.log(`Circuit for ${serviceName} is half-open, allowing test request`)
      return true
    }

    return false
  }

  return true
}

/**
 * Record a service failure
 */
export function recordFailure(serviceName: string): void {
  // Initialize service status if it doesn't exist
  if (!serviceStatus[serviceName]) {
    serviceStatus[serviceName] = {
      available: true,
      failureCount: 0,
      lastFailure: 0,
      successCount: 0,
    }
  }

  const status = serviceStatus[serviceName]
  status.failureCount++
  status.lastFailure = Date.now()
  status.successCount = 0

  // Open circuit if failure threshold is reached
  if (status.failureCount >= FAILURE_THRESHOLD) {
    status.available = false
    console.warn(`Circuit for ${serviceName} is now open after ${status.failureCount} failures`)
  }
}

/**
 * Record a service success
 */
export function recordSuccess(serviceName: string): void {
  // Initialize service status if it doesn't exist
  if (!serviceStatus[serviceName]) {
    serviceStatus[serviceName] = {
      available: true,
      failureCount: 0,
      lastFailure: 0,
      successCount: 0,
    }
  }

  const status = serviceStatus[serviceName]

  // If circuit is closed, just reset failure count
  if (status.available) {
    status.failureCount = 0
    return
  }

  // If circuit is open/half-open, increment success count
  status.successCount++

  // Close circuit if success threshold is reached
  if (status.successCount >= SUCCESS_THRESHOLD) {
    status.available = true
    status.failureCount = 0
    console.log(`Circuit for ${serviceName} is now closed after ${status.successCount} successes`)
  }
}

/**
 * Get the current status of a service
 */
export function getServiceStatus(serviceName: string): ServiceStatus {
  // Initialize service status if it doesn't exist
  if (!serviceStatus[serviceName]) {
    serviceStatus[serviceName] = {
      available: true,
      failureCount: 0,
      lastFailure: 0,
      successCount: 0,
    }
  }

  return { ...serviceStatus[serviceName] }
}

/**
 * Reset the circuit for a service
 */
export function resetCircuit(serviceName: string): void {
  serviceStatus[serviceName] = {
    available: true,
    failureCount: 0,
    lastFailure: 0,
    successCount: 0,
  }

  console.log(`Circuit for ${serviceName} has been manually reset`)
}
