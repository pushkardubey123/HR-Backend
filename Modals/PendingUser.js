const mongoose = require("mongoose");

const PendingUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  password: String,
  gender: String,
  dob: Date,
  address: String,
  departmentId: mongoose.Schema.Types.ObjectId,
  designationId: mongoose.Schema.Types.ObjectId,
  shiftId: mongoose.Schema.Types.ObjectId,
  doj: Date,
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  profilePic: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PendingUser", PendingUserSchema);
