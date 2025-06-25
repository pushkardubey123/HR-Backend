// /Controllers/reportController.js
const Report = require("../Modals/Reports");
const generateReport = require("../utils/generateReport");
const Attendance = require("../Modals/Attendence");
const Leave = require("../Modals/Leave");
const User = require("../Modals/User");
const Exit = require("../Modals/ExitRequest");
const Project = require("../Modals/Project");


const generateDynamicReport = async (req, res) => {
  try {
    const { type } = req.body;
    let data = [];

    if (type === "attendance") {
      const attendance = await Attendance.find().populate("employeeId", "name email");
      data = attendance.map((a) => ({
        name: a.employeeId.name,
        email: a.employeeId.email,
        date: new Date(a.date).toDateString(),
        status: a.status,
      }));
    } else if (type === "leaves") {
      const leaves = await Leave.find().populate("employeeId", "name email");
      data = leaves.map((l) => ({
        name: l.employeeId.name,
        email: l.employeeId.email,
        leaveType: l.leaveType,
        start: new Date(l.startDate).toDateString(),
        end: new Date(l.endDate).toDateString(),
        status: l.status,
      }));
    } else if (type === "users") {
      const users = await User.find({ role: "employee" }).populate("departmentId", "name");
      data = users.map((u) => ({
        name: u.name,
        email: u.email,
        phone: u.phone,
        department: u.departmentId?.name || "-",
      }));
    } else if (type === "exit") {
      const exits = await Exit.find().populate("employeeId", "name email");
      data = exits.map((e) => ({
        name: e.employeeId.name,
        email: e.employeeId.email,
        reason: e.reason,
        date: new Date(e.resignationDate).toDateString(),
        status: e.clearanceStatus || "Pending",
      }));
    } else if (type === "projects") {
      const projects = await Project.find();
      data = projects.map((p) => ({
        name: p.name,
        status: p.status,
        start: p.startDate?.toDateString() || "-",
        end: p.endDate?.toDateString() || "-",
        tasks: p.tasks.length,
      }));
    } else {
      return res.status(400).json({ success: false, message: "Invalid report type" });
    }

    const filename = `${type}_report_${Date.now()}.pdf`;
    const filePath = await generateReport(type, data, filename);
    const fileUrl = `${req.protocol}://${req.get("host")}/static/reports/${filename}`;

    res.json({ success: true, message: "Report generated", fileUrl });
  } catch (err) {
    console.error("Report Gen Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// 🔹 Get all Reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("generatedBy", "name email")
      .sort({ generatedAt: -1 });

    res.json({ success: true, data: reports });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch reports" });
  }
};

// 🔸 Dashboard Analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const [
      employeeCount,
      leaveCount,
      attendanceCount,
      exitCount,
      todayAttendance,
      projectCount,
    ] = await Promise.all([
      User.countDocuments({ role: "employee" }),
      Leave.countDocuments(),
      Attendance.countDocuments(),
      ExitRequest.countDocuments(),
      Attendance.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      Project.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        totalEmployees: employeeCount,
        totalLeaves: leaveCount,
        totalAttendance: attendanceCount,
        todayAttendance,
        totalProjects: projectCount,
        exitRequests: exitCount,
      },
    });
  } catch (err) {
    console.error("Dashboard Analytics Error:", err.message);
    res.status(500).json({ success: false, message: "Analytics error" });
  }
};

module.exports = {
  generateDynamicReport,
  getReports,
  getDashboardAnalytics,
};
