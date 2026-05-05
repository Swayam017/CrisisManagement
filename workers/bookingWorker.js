const bookingQueue = require("../queues/bookingQueue");
const Booking = require("../models/Booking");
const Agent = require("../models/Agent");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const generateInvoice = require("../utils/generateInvoice");
const { sendOTPEmail, sendInvoiceEmail } = require("../utils/sendEmail");

console.log("🔥 Worker started...");

// ==============================
// 1️⃣ PROCESS BOOKING (AFTER PAYMENT)
// ==============================
bookingQueue.process("processBooking", async (job) => {
  console.log("📥 processBooking job received");

  const { bookingId } = job.data;

  const booking = await Booking.findById(bookingId);
  if (!booking) return;

  // ✅ Only process after payment confirmation
  if (booking.status !== "CONFIRMED") {
    console.log("⛔ Not CONFIRMED");
    return;
  }

  // ✅ Prevent duplicate processing
  if (booking.agentId) {
    console.log("⛔ Already assigned");
    return;
  }

  // 🔍 Find available agent
const agents = await Agent.find({
  distributorId: booking.distributorId,
  available: true
}).sort({ currentDeliveries: 1 });

const agent = agents.find(
  a =>
    (a.currentDeliveries || 0) < (a.maxCapacity || 3) &&
    a.available === true
);
console.log("Matching agents:", agents);

  if (!agent) {
    console.log("❌ No agent available");
    return;
  }

  // ✅ Assign agent
  booking.agentId = agent._id;
  booking.status = "ASSIGNED";

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);

  booking.scheduledDate = deliveryDate;
  booking.deliverySlot = "10AM - 2PM";

  await booking.save();

  agent.currentDeliveries = (agent.currentDeliveries || 0) + 1;
  await agent.save();

  console.log("✅ Booking assigned");

  // 👉 Next step
  await bookingQueue.add("outForDeliveryJob", { bookingId });

  console.log("➡️ outForDeliveryJob added");

  // 📄 Send invoice (non-blocking)
  try {
    const user = await User.findById(booking.userId);

    if (user?.email) {
      const filePath = await generateInvoice(booking, user);
      await sendInvoiceEmail(user.email, filePath);

      console.log("📧 Invoice sent");
    }
  } catch (err) {
    console.log("❌ Invoice email error:", err.message);
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
    console.log("⛔ Not ASSIGNED");
    return;
  }

  // ✅ Move to delivery stage
  booking.status = "OUT_FOR_DELIVERY";
  await booking.save();

  console.log("🚚 Moved to OUT_FOR_DELIVERY");

  // ✅ Update complaints
  await Complaint.updateMany(
    { bookingId: booking._id, status: "OPEN" },
    { status: "IN_PROGRESS" }
  );

  console.log("🛠 Complaints moved to IN_PROGRESS");

  // 👉 Next step
  await bookingQueue.add("deliveryJob", { bookingId });

  console.log("➡️ deliveryJob added");
});


// ==============================
// 3️⃣ DELIVERY (OTP GENERATION)
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

  // ✅ Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  booking.otp = otp;
  booking.otpExpires = Date.now() + 5 * 60 * 1000;

  await booking.save();

  console.log("🔐 OTP Generated:", otp);

  // 📧 Send OTP
  if (user?.email) {
    try {
      await sendOTPEmail(user.email, otp);
      console.log("📧 OTP email sent");
    } catch (err) {
      console.log("❌ OTP email error:", err.message);
    }
  }
});