const Notification = require("../Modals/Notification");
const sendNotification = require("../utils/sendNotification");
const pendingEmployee = require("../Modals/PendingUser");
const Leave = require("../Modals/Leave");
const Exit = require("../Modals/ExitRequest");

exports.getAdminAlerts = async (req, res) => {
  try {
    const pendingEmployees = await pendingEmployee.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
    const pendingExits = await Exit.countDocuments({ clearanceStatus: "pending" });
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

exports.sendCustomNotification = async (req, res) => {
  try {
    const { recipient, title, message, sendEmailFlag = false } = req.body;

    if (!recipient || !title || !message) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const notif = await sendNotification({
      title,
      message,
      recipient,
      type: "custom",
      sendEmailFlag,
    });

    res.json({ success: true, message: "Notification sent", data: notif });
  } catch {
    res.status(500).json({ success: false, message: "Failed to send" });
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ success: true, message: "All notifications cleared" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to clear notifications" });
  }
};
