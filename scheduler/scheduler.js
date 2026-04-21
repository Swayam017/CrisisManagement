const cron = require("node-cron");
const Booking = require("../models/Booking");
const Agent = require("../models/Agent");
const User = require("../models/User");
const generateInvoice = require("../utils/generateInvoice");
const sendInvoiceEmail = require("../utils/sendEmail");

// 🔥 RUN EVERY MINUTE
cron.schedule("*/1 * * * *", async () => {
  console.log("🚀 Scheduler running...");

  try {

    // ============================
    // 1️⃣ CALCULATE PRIORITY
    // ============================

    const pendingBookings = await Booking.find({ status: "BOOKED" });

    for (let booking of pendingBookings) {

      const waitingTime = Math.floor(
        (Date.now() - booking.bookingDate) / (1000 * 60 * 60 * 24)
      );

      let priority = waitingTime;

      if (booking.aiFlag === "FRAUD") {
        priority -= 2;
      }

      if (waitingTime > 5) {
        priority += 5;
      }

      booking.priority = priority;
      await booking.save();
    }

    // ============================
    // 2️⃣ ASSIGN BOOKINGS (PRIORITY BASED)
    // ============================

    const sortedBookings = await Booking.find({ status: "BOOKED" })
      .sort({ priority: -1, bookingDate: 1 });

    for (let booking of sortedBookings) {

      const agent = await Agent.findOne({
        distributorId: booking.distributorId,
        available: true
      }).sort({ currentDeliveries: 1 });

      if (!agent) continue;

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 2);

      booking.agentId = agent._id;
      booking.status = "ASSIGNED";
      booking.scheduledDate = deliveryDate;
      booking.deliverySlot = "10AM - 2PM";

      await booking.save();

      agent.currentDeliveries += 1;

      if (agent.currentDeliveries >= agent.maxCapacity) {
        agent.available = false;
      }

      await agent.save();
    }

    // ============================
    // 3️⃣ MOVE TO OUT_FOR_DELIVERY + OTP + INVOICE
    // ============================

    const now = new Date();

    const deliveries = await Booking.find({
      status: "ASSIGNED",
      scheduledDate: { $lte: now }
    });

    for (let booking of deliveries) {

      // 🔒 Prevent duplicate OTP generation
      if (booking.status === "OTP_SENT") continue;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      booking.status = "OTP_SENT";
      booking.otp = otp;
      booking.otpExpires = Date.now() + 5 * 60 * 1000;

      await booking.save();

      console.log(`📦 OTP for booking ${booking._id}: ${otp}`);

      // ============================
      // 📧 EMAIL + INVOICE
      // ============================

      const user = await User.findById(booking.userId);

      if (user && user.email) {
        try {
          const filePath = await generateInvoice(booking, user);
          await sendInvoiceEmail(user, filePath);
          console.log(`📧 Invoice sent to ${user.email}`);
        } catch (emailErr) {
          console.error("❌ Email Error:", emailErr.message);
        }
      }
    }

  } catch (err) {
    console.error("❌ Scheduler Error:", err.message);
  }
});