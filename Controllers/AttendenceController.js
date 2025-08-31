const attendanceTbl = require("../Modals/Attendence");
const { getDistance } = require("geolib");
const moment = require("moment");

const officeLocation = {
  latitude: 26.889,
  longitude: 80.991,
};

const getCurrentTime = () => {
  const now = new Date();
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

const markAttendance = async (req, res) => {
  try {
    const { employeeId, latitude, longitude, inTime } = req.body;
    if (!employeeId || !latitude || !longitude || !inTime) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const distance = getDistance({ latitude, longitude }, officeLocation);
    if (distance > 200) {
      return res
        .status(403)
        .json({
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
        .json({
          success: false,
          message: "Attendance already marked for today",
        });
    }

    const hour = parseInt(inTime.split(":")[0]);
    let status = "Present";
    if (hour > 10) status = "Late";

    const attendance = new attendanceTbl({
      employeeId,
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
  } catch {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getMonthlyAttendance = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res
        .status(400)
        .json({ success: false, message: "Month is required" });
    }

    const startOfMonth = moment(month, "YYYY-MM").startOf("month").toDate();
    const endOfMonth = moment(month, "YYYY-MM").endOf("month").toDate();

    const attendanceRecords = await attendanceTbl
      .find({
        date: { $gte: startOfMonth, $lte: endOfMonth },
      })
      .populate("employeeId", "name email");
    res.status(200).json({
      success: true,
      data: attendanceRecords,
    });
  } catch (error) {
    console.error("Error fetching monthly attendance:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const markSession = async (req, res) => {
  try {
    const { employeeId, latitude, longitude, actionType } = req.body;

    if (!employeeId || !latitude || !longitude || !actionType) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const distance = getDistance({ latitude, longitude }, officeLocation);
    if (distance > 200) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are outside the allowed office location",
          distance,
        });
    }

    const today = new Date().toDateString();

    let attendance = await attendanceTbl.findOne({
      employeeId,
      date: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 86400000),
      },
    });

    if (!attendance && actionType === "in") {
      attendance = new attendanceTbl({
        employeeId,
        date: new Date(),
        inTime: getCurrentTime(),
        location: { latitude, longitude },
        status: "Present",
        statusType: "Auto",
        inOutLogs: [{ inTime: getCurrentTime(), outTime: null }],
      });
    } else if (attendance) {
      if (actionType === "in") {
        const last = attendance.inOutLogs[attendance.inOutLogs.length - 1];
        if (!last || last.outTime) {
          attendance.inOutLogs.push({
            inTime: getCurrentTime(),
            outTime: null,
          });
        } else {
          return res
            .status(400)
            .json({ success: false, message: "Already checked in" });
        }
      } else if (actionType === "out") {
        const last = attendance.inOutLogs[attendance.inOutLogs.length - 1];
        if (last && !last.outTime) {
          last.outTime = getCurrentTime();
        } else {
          return res
            .status(400)
            .json({
              success: false,
              message: "Already checked out or no session started",
            });
        }
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No attendance record for today" });
    }

    const saved = await attendance.save();
    res
      .status(200)
      .json({ success: true, message: "Session updated", data: saved });
  } catch {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    const all = await attendanceTbl
      .find()
      .populate("employeeId", "name email")
      .sort({ date: -1 });

    const grouped = {};

    all.forEach((record) => {
      const dateKey = new Date(record.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(record);
    });

    res.status(200).json({
      success: true,
      message: "Grouped attendance fetched",
      data: grouped,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getAttendanceByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const data = await attendanceTbl.find({ employeeId }).sort({ date: -1 });

    res
      .status(200)
      .json({ success: true, message: "Attendance fetched", code: 200, data });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", code: 500 });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { status, statusType } = req.body;

    const updated = await attendanceTbl.findByIdAndUpdate(
      req.params.id,
      { status, statusType: statusType || "Manual" },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Attendance updated",
        code: 200,
        data: updated,
      });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", code: 500 });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const deleted = await attendanceTbl.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Attendance deleted", code: 200 });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", code: 500 });
  }
};

const bulkMarkAttendance = async (req, res) => {
  try {
    const { employeeIds, date } = req.body;

    if (!employeeIds || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    const newAttendances = [];

    for (const empId of employeeIds) {
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

    res.status(200).json({
      success: true,
      message: `Success: ${newAttendances.length} attendance records added.`,
      data: newAttendances,
    });
  } catch (err) {
    console.error("Bulk mark error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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
