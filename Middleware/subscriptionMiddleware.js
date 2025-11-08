const Subscription = require("../Modals/Subscription");
const User = require("../Modals/User");
const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        code: "no_token",
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    let adminId = null;

    if (req.user.role === "admin") {
      adminId = req.user.id;
    } else if (req.user.role === "employee") {
      // 🧩 Employee belongs to a companyId (admin)
      adminId = req.user.companyId;
    }

    // Superadmin bypass
    if (req.user.role === "superadmin") {
      return next();
    }

    if (!adminId) {
      return res.status(403).json({
        success: false,
        code: "no_admin",
        message: "No linked admin account found for this user.",
      });
    }

    // ✅ Find subscription of the admin (for both admin and employee)
    const subscription = await Subscription.findOne({ adminId }).sort({
      createdAt: -1,
    });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        code: "no_subscription",
        message: "No active subscription found.",
      });
    }

    // ✅ Check if expired
    const now = new Date();
    if (new Date(subscription.endDate) < now) {
      subscription.status = "expired";
      await subscription.save();

      return res.status(403).json({
        success: false,
        code: "subscription_expired",
        message: "Subscription expired. Please renew your plan.",
      });
    }

    // ✅ Attach subscription to request
    req.subscription = subscription;

    next();
  } catch (err) {
    console.error("Subscription middleware error:", err.message);

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        code: "invalid_token",
        message: "Invalid or expired token.",
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "token_expired",
        message: "Your session has expired. Please log in again.",
      });
    }

    res.status(500).json({
      success: false,
      code: "internal_error",
      message: "Internal server error in subscription middleware.",
      error: err.message,
    });
  }
};
