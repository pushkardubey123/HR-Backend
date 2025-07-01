const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,      // smtp.gmail.com
      port: process.env.EMAIL_PORT,      // 587
      secure: false,                     // TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"HareeTech HRM" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
     res.json({ success: false, error: true, message: "Email send error", code: 500 });
  }
};

module.exports = sendEmail;
