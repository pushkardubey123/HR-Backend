const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  officeStart: { type: String, required: true }, 
  officeEnd: { type: String, required: true }, 
}, { timestamps: true });

module.exports = mongoose.model("Setting", settingSchema);