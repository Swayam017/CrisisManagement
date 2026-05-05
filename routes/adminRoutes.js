const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const auth = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const User = require("../models/User"); 

// 📊 ADMIN STATS
router.get("/stats", auth, authorize("ADMIN"), async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();

    const fraudBookings = await Booking.countDocuments({
      aiFlag: "FRAUD"
    });

    const delivered = await Booking.countDocuments({
      status: "DELIVERED"
    });

    const revenue = await Booking.aggregate([
      { $match: { status: "DELIVERED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      totalBookings,
      fraudBookings,
      delivered,
      revenue: revenue[0]?.total || 0
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👤 ALL USERS
router.get("/users", auth, authorize("ADMIN"), async (req, res) => {
  try {
    const users = await User.find().select("name email role");

    res.json({ users });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📦 ALL BOOKINGS
router.get("/bookings", auth, authorize("ADMIN"), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email");

    res.json({ bookings });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;