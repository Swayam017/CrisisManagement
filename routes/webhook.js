const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const bookingQueue = require("../queues/bookingQueue");

router.post("/webhook", async (req, res) => {
  const data = req.body;

  console.log("📩 Webhook received");

  if (data.type === "PAYMENT_SUCCESS_WEBHOOK") {
    const orderId = data.data.order.order_id;

    const booking = await Booking.findOne({ orderId });

    if (!booking) return res.sendStatus(200);

    if (booking.status === "CONFIRMED") {
      return res.sendStatus(200);
    }

    booking.status = "CONFIRMED";
    await booking.save();

    console.log("✅ Booking confirmed via webhook");

    await bookingQueue.add("processBooking", {
      bookingId: booking._id
    });
  }

  res.sendStatus(200);
});

module.exports = router;