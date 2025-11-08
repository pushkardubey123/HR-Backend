const cron = require("node-cron");
const Subscription = require("../Modals/Subscription");
const sendEmail = require("../utils/sendEmail"); // implement your mailing util

// Run daily at 00:05
cron.schedule("5 0 * * *", async () => {
  const now = new Date();

  // expire subscriptions which ended before now
  const expired = await Subscription.find({ status: "active", endDate: { $lt: now } });
  for (const s of expired) {
    s.status = "expired";
    await s.save();
    // notify admin via email
    try {
      await sendEmail(s.adminId, "Subscription expired", `Your subscription ended on ${s.endDate}`);
    } catch (e) { console.error(e); }
  }

  // 3-day reminder
  const threeDaysAhead = new Date(now.getTime() + 3*24*60*60*1000);
  const reminders = await Subscription.find({ status: "active", endDate: { $gte: now, $lte: threeDaysAhead } });
  for (const r of reminders) {
    try {
      await sendEmail(r.adminId, "Subscription expiring soon", `Your subscription will end on ${r.endDate}`);
    } catch (e) { console.error(e); }
  }
});
