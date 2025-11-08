const Notification = require("../Modals/Notification");
const User = require("../Modals/User");
const sendNotification = require("../utils/sendNotification");
const pendingEmployee = require("../Modals/PendingUser");
const Leave = require("../Modals/Leave");
const Exit = require("../Modals/ExitRequest");
const mongoose = require("mongoose");

// Admin alerts
exports.getAdminAlerts = async (req, res) => {
  try {
    const companyId = req.companyId;

    const pendingEmployees = await pendingEmployee.countDocuments({ companyId });
    const pendingLeaves = await Leave.countDocuments({ status: "Pending", companyId });
    const pendingExits = await Exit.countDocuments({ clearanceStatus: "pending", companyId });

    res.json({
      success: true,
      data: [
        { title: "Pending Employee Approvals", count: pendingEmployees },
        { title: "Pending Leave Requests", count: pendingLeaves },
        { title: "Pending Exit Requests", count: pendingExits },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch admin alerts" });
  }
};

// Employee notifications
exports.getEmployeeNotifications = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const companyId = req.companyId;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const notifications = await Notification.find({
      recipient: employeeId,
      companyId,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all notifications (Admin)
exports.getAllNotification = async (req, res) => {
  try {
    const companyId = req.companyId;

    const allNotifications = await Notification.find({ companyId })
      .populate("recipient", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(allNotifications);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Send custom notification
exports.sendCustomNotification = async (req, res) => {
  try {
    const companyId = req.companyId;
    const { title, message, recipient, type } = req.body;

    let imageUrl = "";
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      const fileName = `${Date.now()}_${imageFile.name}`;
      const savePath = `./uploads/notifications/${fileName}`;
      await imageFile.mv(savePath);
      imageUrl = `notifications/${fileName}`;
    }

    if (recipient === "all") {
      const allEmployees = await User.find({ role: "employee", companyId }, "_id");
      if (!allEmployees.length) {
        return res.status(404).json({ success: false, message: "No employees found" });
      }

      const notifications = allEmployees.map((emp) => ({
        title,
        message,
        recipient: emp._id,
        type: type || "custom",
        image: imageUrl || null,
        companyId,
        createdAt: new Date(),
      }));

      await Notification.insertMany(notifications);

      return res.status(200).json({
        success: true,
        message: "Notification sent to all employees",
      });
    }

    const notification = new Notification({
      title,
      message,
      recipient,
      type: type || "custom",
      image: imageUrl || null,
      companyId,
      createdAt: new Date(),
    });

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification sent",
      notification,
    });
  } catch (err) {
    console.error("Send Notification Error:", err);
    return res.status(500).json({ success: false, message: "Failed to send notification" });
  }
};

// My notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const companyId = req.companyId;

    const notifs = await Notification.find({
      recipient: req.user.id,
      removedFromBell: false,
      companyId,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const companyId = req.companyId;

    await Notification.findOneAndUpdate(
      { _id: req.params.id, companyId },
      { read: true }
    );

    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

// Clear bell notifications
exports.clearBellNotifications = async (req, res) => {
  try {
    const companyId = req.companyId;

    await Notification.updateMany(
      { recipient: req.user.id, companyId },
      { $set: { removedFromBell: true } }
    );

    res.json({ success: true, message: "Cleared from bell" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const companyId = req.companyId;

    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
      companyId,
    });

    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
};
