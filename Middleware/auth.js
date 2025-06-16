// middleware/auth.js

const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Make sure this path is correct

// ✅ Token Verify Middleware
const authMiddleware = async (req, res, next) => {
  const rawHeader = req.header("Authorization");
  const token = rawHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: true,
      message: "Access denied. Token missing.",
      code: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // OPTIONAL: fetch full user info from DB (recommended)
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "User not found",
        code: 401,
      });
    }

    req.user = user; // for use in controllers
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.status(403).json({
      success: false,
      error: true,
      message: "Invalid token",
      code: 403,
    });
  }
};
// Allow only admins
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: true,
      message: "Access denied. Admin only.",
      code: 403,
    });
  }
  next();
};

// Allow only employees
const isEmployee = (req, res, next) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({
      success: false,
      error: true,
      message: "Access denied. Employee only.",
      code: 403,
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  isAdmin,
  isEmployee,
};
