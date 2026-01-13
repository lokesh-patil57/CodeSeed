/**
 * Global error filter to suppress expected/configuration errors
 * This runs early in the app lifecycle to catch all console errors
 */

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Filter function for errors
const filterError = (...args) => {
  const message = args.join(' ').toLowerCase();
  
  // Suppress Google OAuth configuration errors
  if (
    message.includes('gsi_logger') ||
    message.includes('origin is not allowed') ||
    message.includes('the given origin is not allowed') ||
    message.includes('client id') ||
    message.includes('403') && message.includes('accounts.google.com')
  ) {
    // Silently ignore - this is a configuration issue, not a code error
    return;
  }
  
  // Suppress 401 errors from is-auth endpoint (expected when not logged in)
  if (
    message.includes('401') &&
    (message.includes('is-auth') || message.includes('unauthorized'))
  ) {
    // Silently ignore - expected behavior when user is not authenticated
    return;
  }
  
  // Call original console.error for all other errors
  originalConsoleError.apply(console, args);
};

// Filter function for warnings
const filterWarn = (...args) => {
  const message = args.join(' ').toLowerCase();
  
  // Suppress Google OAuth warnings
  if (
    message.includes('google client id') ||
    message.includes('gsi') ||
    message.includes('oauth')
  ) {
    // Silently ignore configuration warnings
    return;
  }
  
  // Call original console.warn for all other warnings
  originalConsoleWarn.apply(console, args);
};

/**
 * Initialize error filtering
 * Call this early in your app (e.g., in main.jsx before React renders)
 */
export const initErrorFilter = () => {
  console.error = filterError;
  console.warn = filterWarn;
  
  // Also filter unhandled errors
  window.addEventListener('error', (event) => {
    const message = event.message?.toLowerCase() || '';
    if (
      message.includes('gsi_logger') ||
      message.includes('origin is not allowed') ||
      message.includes('403') && message.includes('accounts.google.com')
    ) {
      event.preventDefault();
      return false;
    }
  });
  
  // Filter unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const message = String(event.reason || '').toLowerCase();
    if (
      message.includes('401') && message.includes('is-auth') ||
      message.includes('gsi_logger') ||
      message.includes('origin is not allowed')
    ) {
      event.preventDefault();
      return false;
    }
  });
};

/**
 * Restore original console methods (for testing/debugging)
 */
export const restoreConsole = () => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
};
