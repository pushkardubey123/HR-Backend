const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // owner admin = company
  modules: [{ type: String }], // e.g. ['employee','payroll','attendance']
  startDate: Date,
  endDate: Date,
  isTrial: { type: Boolean, default: false },
  status: { type: String, enum: ["active","expired"], default: "active" },
  planType: { type: String, enum: ["trial","1month","6month","1year"], default: "trial" },
  amountPaid: { type: Number, default: 0 },
  paymentRef: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
