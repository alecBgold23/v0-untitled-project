type RateLimiterOptions = {
  tokensPerInterval: number
  interval: number // milliseconds
}

export class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly tokensPerInterval: number
  private readonly interval: number

  constructor(options: RateLimiterOptions) {
    this.tokensPerInterval = options.tokensPerInterval
    this.interval = options.interval
    this.tokens = options.tokensPerInterval
    this.lastRefill = Date.now()
  }

  removeTokens(count: number) {
    this.refillTokens()
    if (this.tokens >= count) {
      this.tokens -= count
      return true
    }
    return false
  }

  private refillTokens() {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    if (elapsed > this.interval) {
      this.tokens = this.tokensPerInterval
      this.lastRefill = now
    }
  }
}
