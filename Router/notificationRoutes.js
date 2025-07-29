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
  deleteNotification,
  getAllNotification,
  getEmployeeNotifications,
  removeFromBell,
  clearBellNotifications,
} = require("../Controllers/notificationController");

router.get("/", verifyToken, getMyNotifications);

router.put("/:id/read", verifyToken, markAsRead);

router.put("/clear-bell", verifyToken, clearBellNotifications); 
router.get("/employee/:employeeId",verifyToken, getEmployeeNotifications);

router.get("/admin-alerts", verifyToken, getAdminAlerts);
router.post("/send", sendCustomNotification);
router.get("/all", getAllNotification);
router.delete("/:id", verifyToken, deleteNotification);

module.exports = router;
