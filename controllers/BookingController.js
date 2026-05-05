const Booking = require("../models/Booking");
const User = require("../models/User");
const Agent = require("../models/Agent");
const Complaint = require("../models/Complaint");
const { createOrder } = require("../services/cashfreeService");
const Distributor = require("../models/Distributor");

exports.createBooking = async (req, res) => {
  try {
    const { address } = req.body;

    const user = await User.findById(req.user.id);

    // ✅ KYC check
    if (!user.kyc || !user.kyc.verified) {
      return res.status(400).json({ message: "Complete KYC first" });
    }

    // ✅ Distributor check
    if (!user.distributorId) {
      return res.status(400).json({
        message: "Distributor not selected"
      });
    }

    // 🔥 STOCK CHECK (MOVE HERE)
    const distributor = await Distributor.findById(user.distributorId);

    if (!distributor || distributor.stock <= 0) {
      return res.status(400).json({
        message: "Out of stock"
      });
    }

    // ✅ Prevent duplicate pending payment
    const existingPending = await Booking.findOne({
      userId: user._id,
      status: "PENDING_PAYMENT"
    });

    if (existingPending) {
      return res.status(400).json({
        message: "Complete previous payment first"
      });
    }

    // ✅ Monthly limit
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const existing = await Booking.findOne({
      userId: user._id,
      bookingDate: { $gte: startOfMonth }
    });

    if (existing) {
      return res.status(400).json({
        message: "Already booked this month"
      });
    }

    // ✅ Fraud detection
    const totalBookings = await Booking.countDocuments({
      userId: user._id
    });

    let aiFlag = "NORMAL";
    let aiAnalysis = `User has booked ${totalBookings} times.`;

    if (totalBookings > 3) {
      aiFlag = "FRAUD";
      aiAnalysis = "Excessive bookings detected.";
    }

    const amount = 1100;

    // ✅ Create booking
    const booking = await Booking.create({
      userId: user._id,
      distributorId: user.distributorId,
      address,
      status: "PENDING_PAYMENT",
      aiFlag,
      aiAnalysis,
      amount
    });

    // ✅ Payment
    let paymentData;

    try {
      paymentData = await createOrder({ amount, user });
    } catch (err) {
      await Booking.findByIdAndDelete(booking._id);

      console.log("PAYMENT ERROR:", err);

      return res.status(500).json({
        message: "Payment initialization failed"
      });
    }

    booking.orderId = paymentData.orderId;
    booking.paymentExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await booking.save();

    res.json({
      message: "Booking created, proceed to payment",
      booking,
      payment_session_id: paymentData.paymentSessionId,
      order_id: paymentData.orderId
    });

  } catch (err) {
    console.log("BOOKING ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// 🔥 GET CURRENT BOOKING
exports.getMyBooking = async (req, res) => {
  try {
    const userId = req.user.id;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const booking = await Booking.findOne({
      userId,
      bookingDate: { $gte: startOfMonth }
    }).populate("agentId");

    res.json({ booking: booking || null });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 🔐 VERIFY OTP (FINAL DELIVERY STEP)
exports.verifyOTP = async (req, res) => {
  try {
    const { bookingId, otp } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "OUT_FOR_DELIVERY") {
      return res.status(400).json({
        message: "Delivery not in progress"
      });
    }

    if (booking.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > booking.otpExpires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // ✅ Mark delivered
    booking.status = "DELIVERED";
    booking.isVerified = true;
    booking.otp = null;
    booking.otpExpires = null;

    await booking.save();

    // ✅ Resolve complaints
    await Complaint.updateMany(
      { bookingId: booking._id, status: { $ne: "RESOLVED" } },
      { status: "RESOLVED" }
    );

    // ✅ Free agent
    if (booking.agentId) {
      const agent = await Agent.findById(booking.agentId);

      if (agent) {
        agent.currentDeliveries -= 1;

        if (agent.currentDeliveries < 3) {
          agent.available = true;
        }

        await agent.save();
      }
    }

    res.json({ message: "Delivery verified successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 📜 GET BOOKING HISTORY
exports.getBookingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId })
      .populate("agentId", "name phone")
      .sort({ createdAt: -1 });

    res.json({ bookings });

  } catch (err) {
    console.log("HISTORY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
