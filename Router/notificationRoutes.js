// routes/notificationRoutes.js

const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/auth");
const {
  getMyNotifications,
  markAsRead,
  clearAll,
  sendCustomNotification,
  getAdminAlerts,
} = require("../Controllers/notificationController");

// ✅ Get logged-in user's notifications
router.get("/", verifyToken, getMyNotifications);

// ✅ Mark a single notification as read
router.put("/:id/read", verifyToken, markAsRead);

// ✅ Clear all notifications
router.delete("/", verifyToken, clearAll);

router.get("/admin-alerts", verifyToken, getAdminAlerts);
router.post("/send", verifyToken, sendCustomNotification);

module.exports = router;
