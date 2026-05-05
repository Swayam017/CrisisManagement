const express = require("express");
const router = express.Router();

const Distributor = require("../models/Distributor");
const Booking = require("../models/Booking");

const auth = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// 📦 GET STOCK
router.get("/stock", auth, authorize("DISTRIBUTOR"), async (req, res) => {
  const distributor = await Distributor.findById(req.user._id);
  res.json({ stock: distributor.stock });
});

// ✏ UPDATE STOCK
router.put("/stock", auth, authorize("DISTRIBUTOR"), async (req, res) => {
  const distributor = await Distributor.findById(req.user._id);

  distributor.stock = req.body.stock;
  await distributor.save();

  res.json({ message: "Stock updated" });
});

// 📥 BOOKINGS FOR DISTRIBUTOR
router.get("/bookings", auth, authorize("DISTRIBUTOR"), async (req, res) => {
  const bookings = await Booking.find({
    distributorId: req.user._id
  });

  res.json({ bookings });
});

module.exports = router;