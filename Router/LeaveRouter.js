const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");

const {
  createLeave,
  getAllLeaves,
  getLeaveById,
  updateLeaveStatus,
  deleteLeave,
  getLeavesByEmployee,
  getLeaveReport,
} = require("../Controllers/LeaveController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

// -------------------- Routes --------------------

// Apply leave (employee)
router.post("/", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("leaves"),  createLeave);

// Get all leaves (admin only)
router.get("/", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("leaves"),  getAllLeaves);

// Get leaves by employee
router.get("/employee/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("leaves"),  getLeavesByEmployee);

// Leave report (monthly/yearly)
router.get("/report", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("leaves"),  getLeaveReport);

// Get leave by ID
router.get("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("leaves"),  getLeaveById);

// Update leave status (admin only)
router.put("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("leaves"),  updateLeaveStatus);

// Delete leave (admin only)
router.delete("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("leaves"),  deleteLeave);

module.exports = router;
