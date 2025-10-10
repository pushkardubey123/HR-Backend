const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  console.log("Trying to send OTP to:", email); // debug
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const result = await transporter.sendMail({
      from: `"HRMS App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password reset OTP",
      html: `<h3>Your OTP is: <b>${otp}</b></h3><p>It expires in 10 minutes.</p>`,
    });
    console.log("OTP sent:", result.response);
  } catch (error) {
    console.error("OTP send failed:", error.message);
    throw new Error("Email send failed");
  }
};


module.exports = sendOTP;
