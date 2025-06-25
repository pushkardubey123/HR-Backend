const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const headingsMap = {
  attendance: ["#", "Name", "Email", "Date", "Status"],
  leaves: ["#", "Name", "Email", "Leave Type", "Start", "End", "Status"],
  users: ["#", "Name", "Email", "Phone", "Department"],
  exit: ["#", "Name", "Email", "Reason", "Date", "Status"],
  projects: ["#", "Name", "Status", "Start", "End", "Total Tasks"]
};

const generateReport = (type, data = [], filename) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30 });
    const filePath = path.join(__dirname, "../uploads/reports", filename);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text(`${type.toUpperCase()} Report`, { align: "center" }).moveDown();

    const headings = headingsMap[type];

    if (!headings) {
      doc.text("Unknown report type.");
      doc.end();
      return resolve(filePath);
    }

    // Header
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(headings.join(" | "));
    doc.moveDown();

    // Body
    doc.font("Helvetica");
    data.forEach((item, index) => {
      let line = "";

      if (type === "attendance") {
        line = `${index + 1} | ${item.name} | ${item.email} | ${item.date} | ${item.status}`;
      } else if (type === "leaves") {
        line = `${index + 1} | ${item.name} | ${item.email} | ${item.leaveType} | ${item.start} | ${item.end} | ${item.status}`;
      } else if (type === "users") {
        line = `${index + 1} | ${item.name} | ${item.email} | ${item.phone} | ${item.department}`;
      } else if (type === "exit") {
        line = `${index + 1} | ${item.name} | ${item.email} | ${item.reason} | ${item.date} | ${item.status}`;
      } else if (type === "projects") {
        line = `${index + 1} | ${item.name} | ${item.status} | ${item.start} | ${item.end} | ${item.tasks}`;
      }

      doc.text(line);
    });

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

module.exports = generateReport;
