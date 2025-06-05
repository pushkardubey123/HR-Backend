const Payroll = require("../Modals/Payroll");
const User = require("../Modals/User");

// ➤ Create Payroll
const createPayroll = async (req, res) => {
  try {
    const { employeeId, month, basicSalary, allowances = [], deductions = [] } = req.body;

    if (!employeeId || !month || !basicSalary) {
      return res.status(400).json({
        success: false,
        message: "Employee, Month, and Basic Salary are required",
      });
    }

    const totalAllowances = allowances.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + (item.amount || 0), 0);
    const netSalary = basicSalary + totalAllowances - totalDeductions;

    const payroll = new Payroll({
      employeeId,
      month,
      basicSalary,
      allowances,
      deductions,
      netSalary,
    });

    const saved = await payroll.save();

    res.status(201).json({
      success: true,
      message: "Payroll created successfully",
      data: saved,
    });
  } catch (err) {
    console.error("Create Payroll Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ➤ Get All Payrolls
const getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate("employeeId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Payrolls fetched successfully",
      data: payrolls,
    });
  } catch (err) {
    console.error("Get All Payrolls Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ➤ Get Payroll by ID
const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate("employeeId", "name email");

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    res.json({
      success: true,
      message: "Payroll fetched successfully",
      data: payroll,
    });
  } catch (err) {
    console.error("Get Payroll Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getPayrollByEmployeeId = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const payrolls = await Payroll
      .find({ employeeId })
      .populate("employeeId", "name email phone");

    res.status(200).json({
      success: true,
      message: "Payrolls fetched for employee",
      data: payrolls,
    });
  } catch (error) {
    console.error("Get Employee Payroll Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ➤ Update Payroll
const updatePayroll = async (req, res) => {
  try {
    const { employeeId, month, basicSalary, allowances = [], deductions = [] } = req.body;

    const totalAllowances = allowances.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + (item.amount || 0), 0);
    const netSalary = basicSalary + totalAllowances - totalDeductions;

    const updated = await Payroll.findByIdAndUpdate(
      req.params.id,
      { employeeId, month, basicSalary, allowances, deductions, netSalary },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    res.json({
      success: true,
      message: "Payroll updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Update Payroll Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deletePayroll = async (req, res) => {
  try {
    const deleted = await Payroll.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    res.json({
      success: true,
      message: "Payroll deleted successfully",
    });
  } catch (err) {
    console.error("Delete Payroll Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createPayroll,
  getAllPayrolls,
  getPayrollById,
  updatePayroll,
  deletePayroll,
  getPayrollByEmployeeId
};
