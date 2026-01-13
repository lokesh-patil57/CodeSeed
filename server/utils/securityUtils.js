import crypto from "crypto";

// Generate cryptographically secure OTP
export const generateSecureOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (password.length < minLength) {
    return "Password must be at least 8 characters long";
  }
  if (!hasUppercase) {
    return "Password must contain at least one uppercase letter";
  }
  if (!hasLowercase) {
    return "Password must contain at least one lowercase letter";
  }
  if (!hasNumbers) {
    return "Password must contain at least one number";
  }
  if (!hasSpecialChar) {
    return "Password must contain at least one special character";
  }

  return null; // Password is valid
};

// Sanitize error messages to prevent information leakage
export const getSafeErrorMessage = (error, context) => {
  const errorMap = {
    register: {
      userExists: "Registration failed. Please try again or contact support.",
      validationError: "Invalid input provided",
      serverError: "An error occurred during registration",
    },
    login: {
      invalidCredentials: "Invalid email or password",
      validationError: "Invalid input provided",
      serverError: "An error occurred during login",
    },
    passwordReset: {
      userNotFound: "If this email exists, you will receive a reset link",
      validationError: "Invalid input provided",
      serverError: "An error occurred. Please try again later",
    },
  };

  return errorMap[context]?.serverError || "An error occurred";
};
