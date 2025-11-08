const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/auth");
const companyMiddleware = require("../Middleware/companyMiddleware"); 
const {
  getMyNotifications,
  markAsRead,
  sendCustomNotification,
  getAdminAlerts,
  deleteNotification,
  getAllNotification,
  getEmployeeNotifications,
  clearBellNotifications,
} = require("../Controllers/notificationController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

// All routes will have auth + companyId attached
router.use(verifyToken, companyMiddleware,subscriptionMiddleware,moduleAccess("notification"));

// Employee notifications
router.get("/", getMyNotifications);
router.get("/employee/:employeeId", getEmployeeNotifications);

// Admin alerts
router.get("/admin-alerts", getAdminAlerts);
router.get("/all", getAllNotification);

// Notification actions
router.post("/send", sendCustomNotification);
router.put("/:id/read", markAsRead);
router.put("/clear-bell", clearBellNotifications);
router.delete("/:id", deleteNotification);

module.exports = router;
