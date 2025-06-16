const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const rawHeader = req.header("Authorization");
  const token = rawHeader?.split(" ")[1];

  if (!token) {
    return res.json({
      success: false,
      error: true,
      message: "Access denied. Token missing.",
      code: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.json({
      success: false,
      error: true,
      message: "Invalid token",
      code: 401,
    });
  }
};

module.exports = authMiddleware;
