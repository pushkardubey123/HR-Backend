const attendanceTbl = require("../Modals/Attendence");
const { getDistance } = require("geolib");
const User = require("../Modals/User");

const officeLocation = {
  latitude: 26.889,
  longitude: 80.991,
};

const markAttendance = async (req, res) => {
  try {
    const { employeeId, latitude, longitude, inTime } = req.body;

    if (!employeeId || !latitude || !longitude || !inTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const distance = getDistance({ latitude, longitude }, officeLocation);
    
    if (distance > 200) {
      return res.status(403).json({
        success: false,
        message: "You are outside the allowed office location",
        distance,
      });
    }

    const today = new Date().toDateString();

    const alreadyMarked = await attendanceTbl.findOne({
      employeeId,
      date: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 86400000),
      },
    });

    if (alreadyMarked) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for today",
      });
    }

    const hour = parseInt(inTime.split(":")[0]);
    let status = "Present";
    if (hour > 10) status = "Late";

    const attendance = new attendanceTbl({
      employeeId,
      date: new Date(),
      inTime,
      location: { latitude, longitude },
      status,
      statusType: "Auto",
    });

    const result = await attendance.save();

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: result,
    });
  } catch (err) {
    console.error("Mark Attendance Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    const data = await attendanceTbl
      .find()
      .populate("employeeId", "name email role")
      .sort({ date: -1 });  

    res.status(200).json({
      success: true,
      message: "All attendance fetched successfully",
      code: 200,
      data,
    });
  } catch (error) {
    console.error("Get All Attendance Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      code: 500,
    });
  }
};

const getAttendanceByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const data = await attendanceTbl.find({ employeeId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: "Employee attendance fetched",
      code: 200,
      data,
    });
  } catch (error) {
    console.error("Get Employee Attendance Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      code: 500,
    });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { status, statusType } = req.body;

    const updated = await attendanceTbl.findByIdAndUpdate(
      req.params.id,
      { status, statusType: statusType || "Manual" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated",
      code: 200,
      data: updated,
    });
  } catch (error) {
    console.error("Update Attendance Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      code: 500,
    });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const deleted = await attendanceTbl.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance deleted",
      code: 200,
    });
  } catch (error) {
    console.error("Delete Attendance Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      code: 500,
    });
  }
};

module.exports = {
  markAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  updateAttendance,
  deleteAttendance,
};
