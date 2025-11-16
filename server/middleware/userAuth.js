import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No authentication token, access denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.body = req.body || {};   // <---- FIX
    req.body.userId = decoded.id;

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

export default userAuth;
