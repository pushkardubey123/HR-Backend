const leaveTbl = require("../Modals/Leave");
const moment = require("moment");

// -------------------- Create Leave --------------------
const createLeave = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const companyId = req.user.companyId; // assuming attachCompanyId middleware sets this
    const leave = new leaveTbl({ ...req.body, employeeId, companyId });
    const result = await leave.save();

    res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      data: result,
    });
  } catch (err) {
    console.error("Create Leave Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// -------------------- Get All Leaves --------------------
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await leaveTbl
      .find({ companyId: req.user.companyId })
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    console.error("Get All Leaves Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Get Leave By ID --------------------
const getLeaveById = async (req, res) => {
  try {
    const leave = await leaveTbl
      .findOne({ _id: req.params.id, companyId: req.user.companyId })
      .populate("employeeId", "name email");

    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    res.status(200).json({ success: true, data: leave });
  } catch (err) {
    console.error("Get Leave By ID Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Get Leaves By Employee --------------------
const getLeavesByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const leaves = await leaveTbl
      .find({ employeeId, companyId: req.user.companyId })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    console.error("Get Leaves By Employee Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Update Leave Status --------------------
const updateLeaveStatus = async (req, res) => {
  try {
    const updated = await leaveTbl.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { status: req.body.status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Leave not found" });

    res.status(200).json({ success: true, message: "Leave status updated", data: updated });
  } catch (err) {
    console.error("Update Leave Status Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Delete Leave --------------------
const deleteLeave = async (req, res) => {
  try {
    const deleted = await leaveTbl.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    if (!deleted) return res.status(404).json({ success: false, message: "Leave not found" });

    res.status(200).json({ success: true, message: "Leave deleted successfully" });
  } catch (err) {
    console.error("Delete Leave Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Leave Report --------------------
const getLeaveReport = async (req, res) => {
  try {
    const { type, month, year } = req.query;

    let start, end;
    if (type === "Monthly") {
      if (!month) return res.status(400).json({ success: false, message: "Month is required" });
      start = moment(month, "YYYY-MM").startOf("month").toDate();
      end = moment(month, "YYYY-MM").endOf("month").toDate();
    } else if (type === "Yearly") {
      if (!year) return res.status(400).json({ success: false, message: "Year is required" });
      start = moment(year, "YYYY").startOf("year").toDate();
      end = moment(year, "YYYY").endOf("year").toDate();
    } else {
      return res.status(400).json({ success: false, message: "Invalid type. Must be Monthly or Yearly" });
    }

    const leaves = await leaveTbl
      .find({ companyId: req.user.companyId, startDate: { $gte: start, $lte: end } })
      .populate("employeeId", "name email");

    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    console.error("Leave Report Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  createLeave,
  getAllLeaves,
  getLeaveById,
  getLeavesByEmployee,
  updateLeaveStatus,
  deleteLeave,
  getLeaveReport,
};
