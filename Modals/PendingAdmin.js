const mongoose = require("mongoose");

const PendingAdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  password: String,
  companyName: { type: String, required: true },
  address: String,
  profilePic: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PendingAdmin", PendingAdminSchema);
