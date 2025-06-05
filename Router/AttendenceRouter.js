const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  updateAttendance,
  deleteAttendance
} = require("../Controllers/AttendenceController");

const auth = require("../Middleware/auth"); // अगर token-based auth है

// 👨‍💼 Employee Attendance Mark (GPS-based)
router.post("/mark", auth, markAttendance);

// 📊 Admin: Get all attendance
router.get("/", auth, getAllAttendance);

// 👤 Get attendance by employeeId
router.get("/employee/:id", auth, getAttendanceByEmployee);


router.put("/:id", auth, updateAttendance);

router.delete("/:id", auth, deleteAttendance);

module.exports = router;
