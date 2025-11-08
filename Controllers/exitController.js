const ExitRequest = require("../Modals/ExitRequest");

// -------------------- Create Exit Request --------------------
const createExitRequest = async (req, res) => {
  try {
    const { reason, resignationDate } = req.body;
    const employeeId = req.user.id;
    const companyId = req.user.companyId || null;

    const newRequest = new ExitRequest({
      employeeId,
      companyId,
      reason,
      resignationDate,
    });

    await newRequest.save();
    res.json({
      success: true,
      message: "Exit request submitted",
      data: newRequest,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Get All Exit Requests (Admin Only) --------------------
const getAllExitRequests = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied for non-admin users" });
    }

    const requests = await ExitRequest.find({ companyId: req.user.companyId })
      .populate("employeeId", "name email profilePic")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch requests" });
  }
};

// -------------------- Get Exit Requests by Employee --------------------
const getExitRequestsByEmployee = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const requests = await ExitRequest.find({ employeeId });
    res.json({ success: true, data: requests });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch" });
  }
};

// -------------------- Update Exit Request by Admin --------------------
const updateExitRequestByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied for non-admin users" });
    }

    const { id } = req.params;
    const { interviewFeedback, clearanceStatus, finalSettlement } = req.body;

    const updated = await ExitRequest.findOneAndUpdate(
      { _id: id, companyId: req.user.companyId },
      { interviewFeedback, clearanceStatus, finalSettlement },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Exit request not found" });
    }

    res.json({ success: true, message: "Exit request updated", data: updated });
  } catch {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// -------------------- Delete Exit Request --------------------
const deleteExitRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await ExitRequest.findOne({ _id: id, companyId: req.user.companyId });

    if (!request || request.clearanceStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be deleted",
      });
    }

    await ExitRequest.findByIdAndDelete(id);
    res.json({ success: true, message: "Exit request deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

module.exports = {
  createExitRequest,
  getAllExitRequests,
  getExitRequestsByEmployee,
  updateExitRequestByAdmin,
  deleteExitRequest,
};
