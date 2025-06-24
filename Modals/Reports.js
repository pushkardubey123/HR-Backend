const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Attendance", "Leave", "Exit", "Project", "Custom"],
    required: true
  },
  filterParams: {
    type: Object,
    default: {}
  },
  fileUrl: {
    type: String,
    default: null
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Report", ReportSchema);
