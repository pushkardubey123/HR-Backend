const Department = require("../Modals/Department");

// -------------------- Add Department --------------------
const addDepartment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can add department" });
    }

    const { name, description } = req.body;

    const existing = await Department.findOne({ name, companyId: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: "Department already exists" });
    }

    const department = new Department({ name, description, companyId: req.user.id });
    const result = await department.save();

    res.status(201).json({ success: true, message: "Department created successfully", data: result });
  } catch (err) {
    console.error("Add Department Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Get Departments --------------------
const getDepartments = async (req, res) => {
  try {
    const data = await Department.find();
    res.json({
      success: true,
      error: false,
      message: "Departments fetched successfully",
      code: 200,
      data,
    });
  } catch {
    res.json({
      success: false,
      error: true,
      message: "Internal Server Error",
      code: 500,
    });
  }
};

// -------------------- Update Department --------------------
const updateDepartment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can update department" });
    }

    const { name, description } = req.body;
    const updated = await Department.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.id },
      { name, description },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.status(200).json({ success: true, message: "Department updated successfully", data: updated });
  } catch (err) {
    console.error("Update Department Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Delete Department --------------------
const deleteDepartment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can delete department" });
    }

    const deleted = await Department.findOneAndDelete({ _id: req.params.id, companyId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.status(200).json({ success: true, message: "Department deleted successfully" });
  } catch (err) {
    console.error("Delete Department Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  addDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
};
