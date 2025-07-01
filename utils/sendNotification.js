const Notification = require("../Modals/Notification");

const sendNotification = async ({ title, message, recipient, type = "custom" }) => {
  const notif = new Notification({ title, message, recipient, type });
  await notif.save();
  return notif;
};

module.exports = sendNotification;
