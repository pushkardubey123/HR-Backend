const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Morning", "Evening"
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "17:00"
  },
  { timestamps: true }
);

const shiftTbl = mongoose.model("Shift", shiftSchema);
module.exports = shiftTbl;
