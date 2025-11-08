const Shift = require("../Modals/Shift");

// ✅ Add Shift
const addShift = async (req, res) => {
  try {
    const { name, startTime, endTime } = req.body;

    // ✅ Company context
    const companyId = req.companyId;

    const existing = await Shift.findOne({ name, companyId });
    if (existing) {
      return res.json({ success: false, message: "Shift already exists" });
    }

    const shift = new Shift({
      name,
      startTime,
      endTime,
      companyId, // ✅ added
    });

    const result = await shift.save();
    res.json({ success: true, message: "Shift created", data: result });
  } catch (err) {
    console.error("Add Shift Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get all shifts (filtered by company, or all if no companyId)
const getShifts = async (req, res) => {
  try {
    const companyId = req.companyId;

    let filter = {};
    if (companyId) {
      // If logged in company
      filter.companyId = companyId;
    }

    const data = await Shift.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    console.error("Get Shifts Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ✅ Update shift (only within same company)
const updateShift = async (req, res) => {
  try {
    const companyId = req.companyId;
    const { name, startTime, endTime } = req.body;

    const updated = await Shift.findOneAndUpdate(
      { _id: req.params.id, companyId },
      { name, startTime, endTime },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }

    res.json({ success: true, message: "Shift updated", data: updated });
  } catch (err) {
    console.error("Update Shift Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Delete shift (only within same company)
const deleteShift = async (req, res) => {
  try {
    const companyId = req.companyId;

    const deleted = await Shift.findOneAndDelete({
      _id: req.params.id,
      companyId,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }

    res.json({ success: true, message: "Shift deleted" });
  } catch (err) {
    console.error("Delete Shift Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { addShift, getShifts, updateShift, deleteShift };
