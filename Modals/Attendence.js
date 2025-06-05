const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  inTime: {
    type: String, // Example: "09:25 AM"
    required: true,
  },
  outTime: {
    type: String, // Optional: "06:00 PM"
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "Late", "Half Day", "On Leave"],
    default: "Present",
  },
  statusType: {
    type: String,
    enum: ["Auto", "Manual"],
    default: "Auto",
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
}, { timestamps: true });

const attendanceTbl = mongoose.model("Attendance", attendanceSchema);

module.exports = attendanceTbl;
    