const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/auth");
const companyMiddleware = require("../Middleware/companyMiddleware"); // ✅ added
const {
  getTimesheetReport,
  getEmployeeTimesheet,
} = require("../Controllers/timesheetController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

router.get("/all",verifyToken,companyMiddleware,subscriptionMiddleware,moduleAccess("attendence"),  getTimesheetReport);
router.get("/employee/:id", getEmployeeTimesheet);

module.exports = router;
