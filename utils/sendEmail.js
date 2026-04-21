const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🔐 SEND OTP
const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "LPG Delivery OTP",
    text: `Your OTP for LPG delivery is: ${otp}`
  });
};

// 📄 SEND INVOICE
const sendInvoiceEmail = async (to, filePath) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "LPG Booking Invoice",
    text: "Your LPG booking invoice is attached.",
    attachments: [
      {
        filename: "invoice.pdf",
        path: filePath
      }
    ]
  });
};

module.exports = { sendOTPEmail, sendInvoiceEmail };