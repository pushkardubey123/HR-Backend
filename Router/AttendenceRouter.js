const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const {
  markAttendance,
  markSession,
  getAllAttendance,
  getAttendanceByEmployee,
  updateAttendance,
  deleteAttendance,
  bulkMarkAttendance,
  getMonthlyAttendance,
} = require("../Controllers/AttendenceController");
const subscriptionMiddleware = require("../Middleware/subscriptionMiddleware");
const moduleAccess = require("../Middleware/moduleAccess");

router.post("/mark", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("attendence"), markAttendance);
router.post("/session", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("attendence"), markSession);
router.get("/", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("attendence"), getAllAttendance);
router.get("/employee/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("attendence"), getAttendanceByEmployee);
router.put("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("attendence"), updateAttendance);
router.delete("/:id", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("attendence"), deleteAttendance);
router.post("/bulk", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("attendence"), bulkMarkAttendance);
router.get("/monthly", auth, attachCompanyId,subscriptionMiddleware,moduleAccess("attendence"), getMonthlyAttendance);
module.exports = router;
