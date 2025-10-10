const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // use 465 for SSL
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // your Gmail app password (16-digit)
      },
    });

    await transporter.sendMail({
      from: `"HRMS App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `<h3>Your OTP is: <b>${otp}</b></h3><p>This OTP will expire in 10 minutes.</p>`,
    });

    console.log("OTP Email sent successfully ✅");
  } catch (err) {
    console.error("Error sending OTP email ❌", err);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = sendOTP;
