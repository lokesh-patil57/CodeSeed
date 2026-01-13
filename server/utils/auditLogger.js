// Audit logging for authentication and security events

/**
 * Log authentication and security events
 */
class AuditLogger {
  /**
   * Log an authentication event
   * @param {string} event - Event type (login, logout, register, etc.)
   * @param {string} userId - User ID
   * @param {string} email - User email
   * @param {object} metadata - Additional metadata
   */
  logAuthEvent(event, userId, email, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      email: email || 'unknown',
      ip: metadata.ip || 'unknown',
      userAgent: metadata.userAgent || 'unknown',
      success: metadata.success !== false,
      ...metadata,
    };

    // In production, you might want to:
    // - Store in database
    // - Send to logging service (e.g., Winston, Pino, CloudWatch)
    // - Write to file
    console.log(`[AUDIT] ${event.toUpperCase()}:`, JSON.stringify(logEntry, null, 2));
    
    // TODO: Implement persistent storage
    // Example: await AuditLog.create(logEntry);
  }

  /**
   * Log login attempt
   */
  logLogin(userId, email, success, metadata = {}) {
    this.logAuthEvent('login', userId, email, { success, ...metadata });
  }

  /**
   * Log logout
   */
  logLogout(userId, email, metadata = {}) {
    this.logAuthEvent('logout', userId, email, metadata);
  }

  /**
   * Log registration
   */
  logRegister(userId, email, metadata = {}) {
    this.logAuthEvent('register', userId, email, metadata);
  }

  /**
   * Log password reset request
   */
  logPasswordResetRequest(userId, email, metadata = {}) {
    this.logAuthEvent('password_reset_request', userId, email, metadata);
  }

  /**
   * Log password reset completion
   */
  logPasswordReset(userId, email, metadata = {}) {
    this.logAuthEvent('password_reset', userId, email, metadata);
  }

  /**
   * Log email verification
   */
  logEmailVerification(userId, email, metadata = {}) {
    this.logAuthEvent('email_verification', userId, email, metadata);
  }

  /**
   * Log OTP request
   */
  logOtpRequest(userId, email, otpType, metadata = {}) {
    this.logAuthEvent('otp_request', userId, email, { otpType, ...metadata });
  }

  /**
   * Log failed authentication attempt
   */
  logFailedAuth(email, reason, metadata = {}) {
    this.logAuthEvent('failed_auth', null, email, { 
      success: false, 
      reason, 
      ...metadata 
    });
  }

  /**
   * Log security event (suspicious activity, etc.)
   */
  logSecurityEvent(event, userId, email, severity = 'medium', metadata = {}) {
    this.logAuthEvent('security_event', userId, email, {
      securityEvent: event,
      severity,
      ...metadata,
    });
  }
}

export default new AuditLogger();
