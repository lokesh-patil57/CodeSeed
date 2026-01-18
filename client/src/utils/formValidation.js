import { FORM_VALIDATION_RULES } from "../constants/loginConfig";

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  return FORM_VALIDATION_RULES.EMAIL_REGEX.test(email.trim());
};

/**
 * Validate password length
 * @param {string} password - Password
 * @returns {boolean} Is valid password
 */
export const isValidPassword = (password) => {
  return password.length >= FORM_VALIDATION_RULES.PASSWORD_MIN_LENGTH;
};

/**
 * Validate username length
 * @param {string} username - Username
 * @returns {boolean} Is valid username
 */
export const isValidUsername = (username) => {
  return username && username.trim().length >= FORM_VALIDATION_RULES.USERNAME_MIN_LENGTH;
};

/**
 * Validate login form
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {string} Error message or empty string
 */
export const validateLoginForm = (email, password) => {
  if (!email || !password) {
    return "Email and password are required.";
  }

  if (!isValidEmail(email)) {
    return "Enter a valid email address.";
  }

  if (!isValidPassword(password)) {
    return `Password must be at least ${FORM_VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long.`;
  }

  return "";
};

/**
 * Validate signup form
 * @param {string} email - Email address
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirm password
 * @param {string} username - Username
 * @returns {string} Error message or empty string
 */
export const validateSignupForm = (email, password, confirmPassword, username) => {
  if (!email || !password || !confirmPassword || !username) {
    return "All fields are required.";
  }

  if (!isValidUsername(username)) {
    return `Username must be at least ${FORM_VALIDATION_RULES.USERNAME_MIN_LENGTH} characters long.`;
  }

  if (!isValidEmail(email)) {
    return "Enter a valid email address.";
  }

  if (!isValidPassword(password)) {
    return `Password must be at least ${FORM_VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long.`;
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
};
