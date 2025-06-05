const leaveTbl = require("../Modals/Leave");

// ➤ Add Leave
const createLeave = async (req, res) => {
  try {
    const leave = new leaveTbl(req.body);
    const result = await leave.save();

    if (result) {
      res.json({
        success: true,
        error: false,
        message: "Leave applied successfully",
        code: 201,
        data: result
      });
    } else {
      res.json({
        success: false,
        error: true,
        message: "Leave application failed",
        code: 400
      });
    }
  } catch (error) {
    console.error("Create Leave Error:", error.message);
    res.json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500
    });
  }
};

// ➤ Get all Leaves
const getAllLeaves = async (req, res) => {
  try {
    const data = await leaveTbl.find().populate("employeeId", "name email");    
    res.json({
      success: true,
      error: false,
      message: "Leaves fetched successfully",
      code: 200,
      data
    });
  } catch (error) {
    console.error("Get All Leaves Error:", error.message);
    res.json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500
    });
  }
};

// ➤ Get Leaves by Employee ID
const getLeavesByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const leaves = await leaveTbl
      .find({ employeeId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      error: false,
      message: "Employee leaves fetched successfully",
      code: 200,
      data: leaves,
    });
  } catch (error) {
    console.error("Get Leaves By Employee Error:", error.message);
    res.json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500,
    });
  }
};


// ➤ Get Leave by ID
const getLeaveById = async (req, res) => {
  try {
    const data = await leaveTbl.findById(req.params.id).populate("employeeId", "name email");

    if (!data) {
      return res.json({
        success: false,
        error: true,
        message: "Leave not found",
        code: 404
      });
    }

    res.json({
      success: true,
      error: false,
      message: "Leave fetched successfully",
      code: 200,
      data
    });
  } catch (error) {
    console.error("Get Leave By ID Error:", error.message);
    res.json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500
    });
  }
};

// ➤ Update Leave Status
const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await leaveTbl.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.json({
        success: false,
        error: true,
        message: "Leave not found",
        code: 404
      });
    }

    res.json({
      success: true,
      error: false,
      message: "Leave status updated successfully",
      code: 200,
      data: updated
    });
  } catch (error) {
    console.error("Update Leave Error:", error.message);
    res.json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500
    });
  }
};

// ➤ Delete Leave
const deleteLeave = async (req, res) => {
  try {
    const deleted = await leaveTbl.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.json({
        success: false,
        error: true,
        message: "Leave not found",
        code: 404
      });
    }

    res.json({
      success: true,
      error: false,
      message: "Leave deleted successfully",
      code: 200
    });
  } catch (error) {
    console.error("Delete Leave Error:", error.message);
    res.json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500
    });
  }
};

module.exports = {
  createLeave,
  getAllLeaves,
  getLeaveById,
  updateLeaveStatus,
  deleteLeave,
  getLeavesByEmployee
};
