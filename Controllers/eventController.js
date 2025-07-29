const Event = require("../Modals/Event");

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json({ success: true, message: "Event created", event: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create event", error: error.message });
  }
};

// Get All Events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("employeeId", "name email")
      .populate("departmentId", "name");
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch failed", error: error.message });
  }
};

// Update Event (reschedule or cancel)
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Event.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, message: "Event updated", updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed", error: error.message });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Deletion failed", error: error.message });
  }
};
