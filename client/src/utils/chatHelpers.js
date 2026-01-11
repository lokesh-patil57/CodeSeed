import { FRAMEWORK_MAP, LANGUAGE_MAP } from "../constants/chatConfig";

/**
 * Get framework label from framework value
 * @param {string} value - Framework key
 * @returns {string} Framework label
 */
export const getFrameworkLabel = (value) => {
  return FRAMEWORK_MAP[value] || "HTML + CSS";
};

/**
 * Get language from framework value
 * @param {string} value - Framework key
 * @returns {string} Language identifier
 */
export const getLanguageFromFramework = (value) => {
  return LANGUAGE_MAP[value] || "html";
};

/**
 * Extract code blocks from message content using regex
 * @param {string} content - Message content
 * @returns {Array} Array of code blocks with language and code
 */
export const extractCodeBlocks = (content) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks = [];
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || "text",
      code: match[2].trim(),
      description: "",
    });
  }

  return codeBlocks;
};

/**
 * Get greeting based on current hour
 * @returns {string} Greeting message
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/**
 * Extract user display name from user object
 * @param {Object} user - User object
 * @returns {string} User display name
 */
export const getUserDisplayName = (user) => {
  return (
    user?.username ||
    user?.email?.split("@")[0] ||
    "there"
  );
};
