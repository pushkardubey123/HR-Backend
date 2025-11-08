const Designation = require("../Modals/Designation");

// -------------------- Add Designation --------------------
const addDesignation = async (req, res) => {
  try {
    const { name, departmentId } = req.body;
    if (!name || !departmentId) {
      return res.status(400).json({ success: false, message: "Name and departmentId are required" });
    }

    const existing = await Designation.findOne({ name, departmentId,companyId: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: "Designation already exists in this department" });
    }

    const designation = new Designation({ name, departmentId,companyId: req.user.id });
    const result = await designation.save();

    res.status(201).json({ success: true, message: "Designation created successfully", data: result });
  } catch (err) {
    console.error("Error in addDesignation:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Get Designations --------------------
const getDesignations = async (req, res) => {
  try {
    const data = await Designation.find().populate("departmentId", "name");
    res.json({
      success: true,
      error: false,
      message: "Designations fetched successfully",
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
// -------------------- Update Designation --------------------
const updateDesignation = async (req, res) => {
  try {
    if (req.user.role === "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied for SuperAdmin" });
    }

    const { name, departmentId } = req.body;

    const updated = await Designation.findByIdAndUpdate(
      req.params.id,
      { name, departmentId,companyId: req.user.id },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Designation not found" });

    res.status(200).json({ success: true, message: "Designation updated successfully", data: updated });
  } catch (err) {
    console.error("Error in updateDesignation:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Delete Designation --------------------
const deleteDesignation = async (req, res) => {
  try {
    if (req.user.role === "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied for SuperAdmin" });
    }

    const deleted = await Designation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Designation not found" });

    res.status(200).json({ success: true, message: "Designation deleted successfully" });
  } catch (err) {
    console.error("Error in deleteDesignation:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  addDesignation,
  getDesignations,
  updateDesignation,
  deleteDesignation,
};
