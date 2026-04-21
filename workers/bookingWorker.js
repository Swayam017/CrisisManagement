const bookingQueue = require("../queues/bookingQueue");
const Booking = require("../models/Booking");
const Agent = require("../models/Agent");
const User = require("../models/User");

const generateInvoice = require("../utils/generateInvoice");
const { sendOTPEmail, sendInvoiceEmail } = require("../utils/sendEmail");

console.log("🔥 Worker started...");


// ==============================
// 1️⃣ PROCESS BOOKING
// ==============================
bookingQueue.process("processBooking", async (job) => {
  console.log("📥 processBooking job received");

  const { bookingId } = job.data;

  const booking = await Booking.findById(bookingId);
  if (!booking) return;

  if (booking.status !== "BOOKED") return;

  const agents = await Agent.find({
    distributorId: booking.distributorId
  }).sort({ currentDeliveries: 1 });

  const agent = agents.find(
    a => (a.currentDeliveries || 0) < (a.maxCapacity || 3)
  );

  if (!agent) {
    console.log("❌ No agent available");
    return;
  }

  // ✅ Assign
  booking.agentId = agent._id;
  booking.status = "ASSIGNED";

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);

  booking.scheduledDate = deliveryDate;
  booking.deliverySlot = "10AM - 2PM";

  await booking.save();

  agent.currentDeliveries += 1;
  await agent.save();

  console.log("✅ Booking assigned");

  // 🚨 ADD NEXT JOB FIRST (IMPORTANT)
  await bookingQueue.add("outForDeliveryJob", { bookingId });

  console.log("➡️ outForDeliveryJob added");

  // 📄 EMAIL (NON-BLOCKING)
try {
  const user = await User.findById(booking.userId);

  if (user?.email) {
    const filePath = await generateInvoice(booking, user);

    console.log("📄 Invoice path:", filePath);

    const fs = require("fs");
    console.log("File exists:", fs.existsSync(filePath));

    await sendInvoiceEmail(user.email, filePath);

    console.log("📧 Invoice sent");
  }
} catch (err) {
  console.log("❌ FULL EMAIL ERROR:", err);
}
});


// ==============================
// 2️⃣ OUT FOR DELIVERY
// ==============================
bookingQueue.process("outForDeliveryJob", async (job) => {
  console.log("📥 outForDeliveryJob received");

  const { bookingId } = job.data;

  const booking = await Booking.findById(bookingId);
  if (!booking) return;

  if (booking.status !== "ASSIGNED") {
    console.log("⛔ Not eligible");
    return;
  }

  booking.status = "OUT_FOR_DELIVERY";
  await booking.save();

  console.log("🚚 Moved to OUT_FOR_DELIVERY");

  await bookingQueue.add("deliveryJob", {
    bookingId
  });

  console.log("➡️ deliveryJob added");
});


// ==============================
// 3️⃣ DELIVERY (OTP)
// ==============================
bookingQueue.process("deliveryJob", async (job) => {
  console.log("📥 deliveryJob received");

  const { bookingId } = job.data;

  const booking = await Booking.findById(bookingId);
  if (!booking) return;

  if (booking.status !== "OUT_FOR_DELIVERY") {
    console.log("⛔ Not eligible for OTP");
    return;
  }

  const user = await User.findById(booking.userId);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  booking.status = "OTP_SENT";
  booking.otp = otp;
  booking.otpExpires = Date.now() + 5 * 60 * 1000;

  await booking.save();

  if (user?.email) {
    try {
      await sendOTPEmail(user.email, otp);
      console.log("📧 OTP email sent");
    } catch (err) {
      console.log("❌ OTP email error:", err.message);
    }
  }

  console.log("🔐 OTP Generated:", otp);
});