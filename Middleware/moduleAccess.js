module.exports = function (moduleKey) {
  return (req, res, next) => {
    try {
      // ✅ Superadmin always allowed
      if (req.user.role === "superadmin") {
        return next();
      }

      // ✅ Check if subscription object is attached
      const sub = req.subscription;
      if (!sub) {
        return res.status(403).json({
          success: false,
          code: "subscription_missing",
          message: "Subscription required. Please activate a plan.",
        });
      }

      // ✅ Check if subscription is active
      if (sub.status !== "active") {
        return res.status(403).json({
          success: false,
          code: "subscription_inactive",
          message: "Your subscription is inactive or expired.",
        });
      }

      // ✅ Check if module access exists
      if (!sub.modules || !sub.modules.includes(moduleKey)) {
        return res.status(403).json({
          success: false,
          code: "module_access_denied",
          message: `Your current plan does not include access to '${moduleKey}'.`,
        });
      }

      // ✅ Everything okay → continue
      next();
    } catch (err) {
      console.error("Module access error:", err.message);
      return res.status(500).json({
        success: false,
        code: "module_access_error",
        message: "Internal server error in module access middleware.",
      });
    }
  };
};
