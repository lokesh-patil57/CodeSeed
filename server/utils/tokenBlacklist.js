// Token blacklist for managing revoked tokens
// In production, consider using Redis for distributed systems

class TokenBlacklist {
  constructor() {
    // Map of token -> expiry timestamp
    this.blacklist = new Map();
    // Clean up expired tokens every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Add a token to the blacklist
   * @param {string} token - JWT token to blacklist
   * @param {number} expiresAt - Token expiration timestamp (in milliseconds)
   */
  add(token, expiresAt) {
    this.blacklist.set(token, expiresAt);
  }

  /**
   * Check if a token is blacklisted
   * @param {string} token - JWT token to check
   * @returns {boolean} - True if token is blacklisted
   */
  has(token) {
    const expiry = this.blacklist.get(token);
    if (!expiry) return false;
    
    // If token has expired, remove it and return false
    if (Date.now() > expiry) {
      this.blacklist.delete(token);
      return false;
    }
    
    return true;
  }

  /**
   * Remove expired tokens from blacklist
   */
  cleanup() {
    const now = Date.now();
    for (const [token, expiry] of this.blacklist.entries()) {
      if (now > expiry) {
        this.blacklist.delete(token);
      }
    }
  }

  /**
   * Get blacklist size (for monitoring)
   */
  size() {
    return this.blacklist.size;
  }

  /**
   * Clear all tokens (for testing)
   */
  clear() {
    this.blacklist.clear();
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Export singleton instance
export default new TokenBlacklist();
