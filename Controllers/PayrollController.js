const Payroll = require("../Modals/Payroll");
const User = require("../Modals/User");

// ✅ Create Payroll
const createPayroll = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      basicSalary,
      allowances = [],
      deductions = [],
      workingDays = 0,
      paidDays = 0,
    } = req.body;

    if (!employeeId || !month) {
      return res.status(400).json({
        success: false,
        message: "Employee and Month are required",
      });
    }

    const companyId = req.companyId; // ✅ company context

    let finalBasicSalary = basicSalary;
    if (!finalBasicSalary) {
      const employee = await User.findOne({ _id: employeeId, companyId });
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found in this company",
        });
      }
      finalBasicSalary = employee.basicSalary || 0;
    }

    const totalAllowances = allowances.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
    const totalDeductions = deductions.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
    const netSalary = finalBasicSalary + totalAllowances - totalDeductions;

    const payroll = new Payroll({
      employeeId,
      month,
      basicSalary: finalBasicSalary,
      allowances,
      deductions,
      workingDays,
      paidDays,
      netSalary,
      companyId, // ✅ added company ownership
      generatedBy: req.user.id,
    });

    const saved = await payroll.save();

    res.status(201).json({
      success: true,
      message: "Payroll created successfully",
      data: saved,
    });
  } catch (err) {
    console.error("Payroll Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ Get All Payrolls (company-based)
const getAllPayrolls = async (req, res) => {
  try {
    const companyId = req.companyId;

    const payrolls = await Payroll.find({ companyId })
      .populate({
        path: "employeeId",
        select: "name email pan bankAccount departmentId designationId",
        populate: [
          { path: "departmentId", select: "name" },
          { path: "designationId", select: "name" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Payrolls fetched successfully",
      data: payrolls,
    });
  } catch (err) {
    console.error("Get Payrolls Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ Get Payroll by ID (within same company)
const getPayrollById = async (req, res) => {
  try {
    const companyId = req.companyId;
    const payroll = await Payroll.findOne({
      _id: req.params.id,
      companyId,
    }).populate("employeeId", "name email");

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
    console.error("Get Payroll By ID Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ Get Payrolls by Employee ID (within same company)
const getPayrollByEmployeeId = async (req, res) => {
  try {
    const companyId = req.companyId;
    const employeeId = req.params.id;

    const payrolls = await Payroll.find({ employeeId, companyId }).populate(
      "employeeId",
      "name email phone"
    );

    res.status(200).json({
      success: true,
      message: "Payrolls fetched for employee",
      data: payrolls,
    });
  } catch (err) {
    console.error("Get Payroll by Employee Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ Update Payroll (only within same company)
const updatePayroll = async (req, res) => {
  try {
    const companyId = req.companyId;
    const {
      employeeId,
      month,
      basicSalary,
      allowances = [],
      deductions = [],
      workingDays = 0,
      paidDays = 0,
    } = req.body;

    const totalAllowances = allowances.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
    const totalDeductions = deductions.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
    const netSalary = basicSalary + totalAllowances - totalDeductions;

    const updated = await Payroll.findOneAndUpdate(
      { _id: req.params.id, companyId },
      {
        employeeId,
        month,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        workingDays,
        paidDays,
      },
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
    console.error("Update Payroll Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ Delete Payroll (only within same company)
const deletePayroll = async (req, res) => {
  try {
    const companyId = req.companyId;

    const deleted = await Payroll.findOneAndDelete({
      _id: req.params.id,
      companyId,
    });

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
    console.error("Delete Payroll Error:", err);
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
  getPayrollByEmployeeId,
};
