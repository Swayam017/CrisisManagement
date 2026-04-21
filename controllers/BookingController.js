const Booking = require("../models/Booking");
const User = require("../models/User");
const Agent = require("../models/Agent");
const bookingQueue = require("../queues/bookingQueue");

//  CREATE BOOKING (NO AGENT HERE)
exports.createBooking = async (req, res) => {
  try {
    const { address } = req.body;

    const user = await User.findById(req.user.id);

    // KYC check
    if (!user.kyc || !user.kyc.verified) {
      return res.status(400).json({ message: "Complete KYC first" });
    }

    // Distributor check
    if (!user.distributorId) {
      return res.status(400).json({
        message: "Distributor not selected"
      });
    }

    // Monthly limit
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

    // Fraud detection
    const totalBookings = await Booking.countDocuments({
      userId: user._id
    });

    let aiFlag = "NORMAL";
    let aiAnalysis = `User has booked ${totalBookings} times.`;

    if (totalBookings > 3) {
      aiFlag = "FRAUD";
      aiAnalysis = "Excessive bookings detected.";
    }

    let amount = 1100;
console.log("DEBUG AMOUNT:", amount);
      
    // ✅ Create booking (NO AGENT ASSIGNMENT)
    const booking = await Booking.create({
      userId: user._id,
      distributorId: user.distributorId,
      address,
      status: "BOOKED",
      aiFlag,
      aiAnalysis,
        amount
    });

        //  ADD TO QUEUE
    await bookingQueue.add("processBooking", {
      bookingId: booking._id
    });

    res.json({
      message: "Booking successful",
      booking
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


// 🔐 VERIFY OTP (ONLY USER CONFIRMS DELIVERY)
exports.verifyOTP = async (req, res) => {
  try {
    const { bookingId, otp } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > booking.otpExpires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    booking.status = "DELIVERED";
    console.log("✅ Booking delivered");
    booking.isVerified = true;
    booking.otp = null;
    booking.otpExpires = null;

    await booking.save();

    // Free agent
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