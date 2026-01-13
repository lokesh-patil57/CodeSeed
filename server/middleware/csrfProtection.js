import csrf from "csurf";
import cookieParser from "cookie-parser";

// CSRF protection middleware
const csrfProtection = csrf({ cookie: false });

// Middleware to generate and return CSRF token
export const generateCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

export default csrfProtection;
