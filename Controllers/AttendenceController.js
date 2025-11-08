const attendanceTbl = require("../Modals/Attendence");
const userTbl = require("../Modals/User");
const { getDistance } = require("geolib");
const moment = require("moment");

const officeLocation = {
  latitude: 26.88925,
  longitude: 80.99116,
};

// Utility for current time
const getCurrentTime = () => {
  const now = new Date();
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

const markAttendance = async (req, res) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    if (req.user.role === "superadmin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied for SuperAdmin" });
    }

    const { employeeId, latitude, longitude, inTime } = req.body;
    if (!employeeId || !latitude || !longitude || !inTime) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const employee = await userTbl.findById(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // ✅ Safe access control with null checks
    if (
      req.user.role === "admin" &&
      employee.companyId &&
      req.user._id &&
      employee.companyId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied for this employee" });
    }

    if (
      req.user.role === "employee" &&
      req.user._id &&
      req.user._id.toString() !== employeeId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only mark your own attendance",
      });
    }

    const distance = getDistance({ latitude, longitude }, officeLocation);
    if (distance > 200) {
      return res.status(403).json({
        success: false,
        message: "You are outside the allowed office location",
        distance,
      });
    }

    const today = new Date().toDateString();
    const alreadyMarked = await attendanceTbl.findOne({
      employeeId,
      date: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 86400000),
      },
    });

    if (alreadyMarked) {
      return res
        .status(400)
        .json({ success: false, message: "Attendance already marked for today" });
    }

    const hour = parseInt(inTime.split(":")[0]);
    let status = hour > 10 ? "Late" : "Present";

    const attendance = new attendanceTbl({
      employeeId,
      companyId: employee.companyId || req.user.companyId || null,
      date: new Date(),
      inTime,
      location: { latitude, longitude },
      status,
      statusType: "Auto",
      inOutLogs: [{ inTime, outTime: null }],
    });

    const result = await attendance.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Attendance marked successfully",
        data: result,
      });
  } catch (err) {
    console.error("Error in markAttendance:", err);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: err.message });
  }
};


// -------------------- Mark In/Out Session --------------------
const markSession = async (req, res) => {
  try {
    console.log("📦 markSession req.body:", req.body);

    const employeeId = req.user?._id || req.user?.id || req.body.employeeId;
    const actionType = req.body.actionType;
    const { latitude, longitude } = req.body;

    console.log(`👤 Authenticated user: ${employeeId} ${req.user?.role}`);

    if (!employeeId || !latitude || !longitude || !actionType) {
      console.log("⚠️ Missing fields:", req.body);
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const employee = await userTbl.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // ✅ Safe access control
    const userId = req.user._id || req.user.id;

    if (req.user.role === "admin") {
      if (
        !employee.companyId ||
        !userId ||
        employee.companyId?.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied for this employee",
        });
      }
    } else if (req.user.role === "employee") {
      if (userId?.toString() !== employeeId?.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only mark your own attendance",
        });
      }
    }

    // ✅ Distance check (within 200 meters)
    const distance = getDistance({ latitude, longitude }, officeLocation);
    if (distance > 200) {
      return res.status(403).json({
        success: false,
        message: "You are outside the allowed office location",
        distance,
      });
    }

    // ✅ Find today's attendance
    const today = new Date().toDateString();
    let attendance = await attendanceTbl.findOne({
      employeeId,
      date: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 86400000),
      },
    });

    // ✅ Create or update attendance
    if (!attendance && actionType === "in") {
      attendance = new attendanceTbl({
        employeeId,
        companyId: employee.companyId || req.user.companyId || null,
        date: new Date(),
        inTime: getCurrentTime(),
        location: { latitude, longitude },
        status: "Present",
        statusType: "Auto",
        inOutLogs: [{ inTime: getCurrentTime(), outTime: null }],
      });
    } else if (attendance) {
      const last = attendance.inOutLogs[attendance.inOutLogs.length - 1];
      if (actionType === "in") {
        if (!last || last.outTime) {
          attendance.inOutLogs.push({ inTime: getCurrentTime(), outTime: null });
        } else {
          return res.status(400).json({ success: false, message: "Already checked in" });
        }
      } else if (actionType === "out") {
        if (last && !last.outTime) {
          last.outTime = getCurrentTime();
        } else {
          return res.status(400).json({
            success: false,
            message: "Already checked out or no session started",
          });
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "No attendance record for today",
      });
    }

    const saved = await attendance.save();
    res.status(200).json({ success: true, message: "Session updated", data: saved });
  } catch (err) {
    console.error("❌ Error in markSession:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};





// -------------------- Get Monthly Attendance --------------------
const getMonthlyAttendance = async (req, res) => {
  try {
    if (req.user.role === "superadmin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied for SuperAdmin" });
    }

    const { month } = req.query;
    if (!month)
      return res
        .status(400)
        .json({ success: false, message: "Month is required" });

    const startOfMonth = moment(month, "YYYY-MM").startOf("month").toDate();
    const endOfMonth = moment(month, "YYYY-MM").endOf("month").toDate();

    const filter = {
      date: { $gte: startOfMonth, $lte: endOfMonth },
    };

    if (req.user.role === "admin") filter.companyId = req.user._id;
    else if (req.user.role === "employee") filter.employeeId = req.user._id;

    const attendanceRecords = await attendanceTbl
      .find(filter)
      .populate("employeeId", "name email");

    res.status(200).json({ success: true, data: attendanceRecords });
  } catch (err) {
    console.error("Error fetching monthly attendance:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------------- Get All Attendance (Admin Only) --------------------
const getAllAttendance = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can access this" });
    }

    const all = await attendanceTbl
      .find({ companyId: req.user.id })
      .populate("employeeId", "name email")
      .sort({ date: -1 });

    const grouped = {};
    all.forEach((record) => {
      const dateKey = new Date(record.date).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(record);
    });

    res.status(200).json({
      success: true,
      message: "Grouped attendance fetched",
      data: grouped,
    });
  } catch (err) {
    console.error("Error in getAllAttendance:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Get Attendance by Employee --------------------
const getAttendanceByEmployee = async (req, res) => {
  try {
    const empId = req.params.id;

    // Ensure req.user is defined
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access: user not found in request",
      });
    }

    if (req.user.role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied for SuperAdmin",
      });
    }

    // Fix: Check safely before using .toString()
    if (
      req.user.role === "employee" &&
      req.user._id &&
      req.user._id.toString() !== empId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own attendance",
      });
    }

    const filter =
      req.user.role === "admin"
        ? { employeeId: empId, companyId: req.user._id } // use _id consistently
        : { employeeId: empId };

    const data = await attendanceTbl.find(filter).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      message: "Attendance fetched",
      code: 200,
      data,
    });
  } catch (err) {
    console.error("Error in getAttendanceByEmployee:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      code: 500,
    });
  }
};


// -------------------- Update / Delete / Bulk --------------------
const updateAttendance = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can update attendance" });
    }

    const { status, statusType } = req.body;
    const updated = await attendanceTbl.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.id },
      { status, statusType: statusType || "Manual" },
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    res.status(200).json({
      success: true,
      message: "Attendance updated",
      data: updated,
    });
  } catch (err) {
    console.error("Error in updateAttendance:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can delete attendance" });
    }

    const deleted = await attendanceTbl.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.id,
    });
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });

    res.status(200).json({ success: true, message: "Attendance deleted" });
  } catch (err) {
    console.error("Error in deleteAttendance:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const bulkMarkAttendance = async (req, res) => {
  try {
    // ✅ Only admin can perform bulk marking
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can bulk mark attendance",
      });
    }

    const { employeeIds, date } = req.body;
    if (!employeeIds || !date) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const newAttendances = [];
    const userId = req.user._id || req.user.id; // ✅ Safe fallback

    for (const empId of employeeIds) {
      const employee = await userTbl.findById(empId);
      if (
        !employee ||
        !employee.companyId ||
        !userId ||
        employee.companyId.toString() !== userId.toString()
      ) {
        continue; // skip invalid employees
      }

      const exists = await attendanceTbl.findOne({
        employeeId: empId,
        date: {
          $gte: new Date(date),
          $lt: new Date(new Date(date).getTime() + 86400000),
        },
      });

      if (!exists) {
        const newAtt = new attendanceTbl({
          employeeId: empId,
          companyId: employee.companyId || req.user.companyId || null,
          date,
          inTime: "09:00",
          status: "Present",
          statusType: "Manual",
          inOutLogs: [{ inTime: "09:00", outTime: null }],
        });
        await newAtt.save();
        newAttendances.push(newAtt);
      }
    }

    return res.status(200).json({
      success: true,
      message: `${newAttendances.length} attendance records added.`,
      data: newAttendances,
    });
  } catch (err) {
    console.error("❌ Bulk mark error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};


module.exports = {
  markAttendance,
  markSession,
  getAllAttendance,
  getAttendanceByEmployee,
  updateAttendance,
  deleteAttendance,
  bulkMarkAttendance,
  getMonthlyAttendance,
};
