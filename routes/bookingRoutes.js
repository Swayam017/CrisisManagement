const express = require("express");
const router = express.Router();
const { getPaymentStatusFromCF } = require("../services/cashfreeService");

const { createBooking, getMyBooking, verifyOTP,getBookingHistory} = require("../controllers/BookingController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createBooking);
router.get("/my-booking", authMiddleware, getMyBooking);
router.post("/verify-otp", authMiddleware, verifyOTP);
router.get("/history", authMiddleware, getBookingHistory);


router.get("/payment-status/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const status = await getPaymentStatusFromCF(orderId);

    // 🔥 UPDATE DB IF PAYMENT SUCCESS
    if (status === "SUCCESS") {
      const Booking = require("../models/Booking");
      const bookingQueue = require("../queues/bookingQueue");

      const booking = await Booking.findOne({ orderId });

      if (booking && booking.status !== "CONFIRMED") {
        booking.status = "CONFIRMED";
        await booking.save();

        console.log("✅ Booking updated from payment status API");

     console.log("🚀 Triggering worker for booking:", booking._id);

await bookingQueue.add("processBooking", {
  bookingId: booking._id
});

console.log("✅ Job added to queue");
      }
    }

    return res.json({ status });

  } catch (err) {
    console.error("❌ Payment status route error:", err);
    return res.status(500).json({
      message: "Failed to fetch payment status"
    });
  }
});
module.exports = router;