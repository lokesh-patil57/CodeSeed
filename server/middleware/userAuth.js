import jwt from "jsonwebtoken";
import tokenBlacklist from "../utils/tokenBlacklist.js";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No authentication token, access denied",
    });
  }

  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({
      success: false,
      message: "Token has been revoked. Please log in again.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.body = req.body || {};
    req.body.userId = decoded.id;

    // also set a top-level property for easier access in controllers
    req.userId = decoded.id;
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

export default userAuth;
