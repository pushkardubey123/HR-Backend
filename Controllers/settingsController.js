const Setting = require("../Modals/Setting");

const setOfficeTiming = async (req, res) => {
  try {
    const { officeStart, officeEnd } = req.body;

    let existing = await Setting.findOne();

    if (existing) {
      existing.officeStart = officeStart;
      existing.officeEnd = officeEnd;
      await existing.save();
    } else {
      await Setting.create({ officeStart, officeEnd });
    }

    res.status(200).json({ success: true, message: "Office timing saved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getOfficeTiming = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(404).json({ success: false, message: "Office timing not set yet" });
    }
    res.status(200).json({ success: true, data: setting });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { setOfficeTiming, getOfficeTiming };