const Event = require("../Modals/Event");
const User = require("../Modals/User");

// -------------------- Create Event --------------------
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      color,
      departmentId,
      employeeId,
    } = req.body;

    // Access control
    if (req.user.role === "employee" && req.user.id.toString() !== employeeId) {
      return res.status(403).json({ success: false, message: "You can only create your own events" });
    }

    const newEvent = new Event({
      title,
      description,
      startDate,
      endDate,
      color,
      departmentId,
      employeeId,
      companyId: req.user.companyId || req.user.id || null,
      createdBy: req.user.id,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json({ success: true, message: "Event created", data: savedEvent });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Get All Events (Admin/Employee) --------------------
const getAllEvents = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "admin") {
      filter.companyId = req.user.id;
    } else if (req.user.role === "employee") {
      const employee = await User.findById(req.user.id);
      const departmentIds = Array.isArray(employee.department) ? employee.department : [employee.department];
      filter = { $or: [{ employeeId: req.user.id }, { departmentId: { $in: departmentIds } }] };
    }

    const events = await Event.find(filter)
      .populate("createdBy", "name email")
      .populate("departmentId", "name")
      .populate("employeeId", "name email")
      .sort({ startDate: -1 });

    res.status(200).json({ success: true, data: events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Get Single Event --------------------
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("departmentId", "name")
      .populate("employeeId", "name email");

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // Access control
    if (req.user.role === "admin" && event.companyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (req.user.role === "employee" && event.employeeId.toString() !== req.user.id.toString() &&
        !(Array.isArray(event.departmentId) && event.departmentId.includes(req.user.department))) {
      return res.status(403).json({ success: false, message: "You can only view your own or your department events" });
    }

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Update Event --------------------
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // Access control
    if (req.user.role === "admin" && event.companyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (req.user.role === "employee" && event.employeeId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "You can only update your own events" });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: "Event updated", data: updated });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------------------- Delete Event --------------------
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // Access control
    if (req.user.role === "admin" && event.companyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (req.user.role === "employee" && event.employeeId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own events" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
