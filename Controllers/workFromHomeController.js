const WorkFromHome = require("../Modals/WFH");
const User = require("../Modals/User");

// Employee applies for WFH
const applyWFH = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;

    const newWFH = new WorkFromHome({
      userId: req.user.id,
      companyId: req.companyId, // ✅ company concept
      fromDate,
      toDate,
      reason,
    });

    await newWFH.save();
    res.json({ success: true, message: "WFH request submitted", data: newWFH });
  } catch (err) {
    console.error("Apply WFH error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get employee's own WFH requests
const getMyWFH = async (req, res) => {
  try {
    const data = await WorkFromHome.find({ userId: req.user.id, companyId: req.companyId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data });
  } catch (err) {
    console.error("Get My WFH error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin: Get all WFH requests
const getAllWFH = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const data = await WorkFromHome.find({ companyId: req.companyId })
      .populate("userId", "name email departmentId designationId")
      .sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    console.error("Get All WFH error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin: Update WFH status
const updateWFHStatus = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const { status, adminRemarks } = req.body;
    const updated = await WorkFromHome.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      { status, adminRemarks },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "WFH request not found" });
    }

    res.json({ success: true, message: "WFH status updated", data: updated });
  } catch (err) {
    console.error("Update WFH status error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin: Assign WFH directly to employee
const adminAssignWFH = async (req, res) => {
  try {
    const { employeeId, fromDate, toDate, remarks, reason } = req.body;

    const user = await User.findOne({ _id: employeeId, companyId: req.companyId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const newWFH = new WorkFromHome({
      userId: employeeId,
      companyId: req.companyId, // ✅ company
      fromDate,
      toDate,
      status: "approved",
      reason,
      adminRemarks: remarks || "Approved by admin",
    });

    await newWFH.save();
    res.json({ success: true, message: "WFH assigned successfully", data: newWFH });
  } catch (err) {
    console.error("Admin assign WFH error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  applyWFH,
  getMyWFH,
  getAllWFH,
  updateWFHStatus,
  adminAssignWFH,
};
