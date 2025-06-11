 const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  await transporter.sendMail({
    from: `"HRMS App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password reset OTP",
    html: `<h3>Your OTP is: <b>${otp}</b></h3><p>Its is expire in 10 minutes/p>`,
  });
};

module.exports = sendOTP;
