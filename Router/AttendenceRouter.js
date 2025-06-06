const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");

const {
  markAttendance,
  markSession, 
  getAllAttendance,
  getAttendanceByEmployee,
  updateAttendance,
  deleteAttendance,
} = require("../Controllers/AttendenceController");


router.post("/mark", auth, markAttendance);
router.post("/session", auth, markSession); 
router.get("/", auth, getAllAttendance);
router.get("/employee/:id", auth, getAttendanceByEmployee);
router.put("/:id", auth, updateAttendance);
router.delete("/:id", auth, deleteAttendance);

module.exports = router;
