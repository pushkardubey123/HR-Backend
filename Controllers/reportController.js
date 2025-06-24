const Report = require("../Modals/Reports");
const Attendance = require("../Modals/Attendence");
const Leave = require("../Modals/Leave");
const ExitRequest = require("../Modals/ExitRequest");
const User = require("../Modals/User");

// 🔸 1. Generate a new report entry
const generateReport = async (req, res) => {
  try {
    const { type, filterParams, fileUrl } = req.body;
    const generatedBy = req.user.id; // from token

    const report = new Report({
      type,
      filterParams,
      fileUrl,
      generatedBy,
    });

    await report.save();
    res.json({ success: true, message: "Report record created", data: report });
  } catch (err) {
    console.error("Generate Report Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate report" });
  }
};

// 🔸 2. Get all reports
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("generatedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch reports" });
  }
};

// 🔸 3. Dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const [employeeCount, leaveCount, attendanceCount, exitCount, todayAttendance] = await Promise.all([
      User.countDocuments({ role: "employee" }),
      Leave.countDocuments(),
      Attendance.countDocuments(),
      ExitRequest.countDocuments(),
      Attendance.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        }
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalEmployees: employeeCount,
        totalLeaves: leaveCount,
        totalAttendance: attendanceCount,
        todayAttendance,
        exitRequests: exitCount,
      }
    });
  } catch (err) {
    console.error("Analytics Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

module.exports = {
  generateReport,
  getAllReports,
  getDashboardAnalytics
};
