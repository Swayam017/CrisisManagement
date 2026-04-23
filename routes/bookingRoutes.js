const express = require("express");
const router = express.Router();

const { createBooking, getMyBooking, verifyOTP,getBookingHistory} = require("../controllers/BookingController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createBooking);
router.get("/my-booking", authMiddleware, getMyBooking);
router.post("/verify-otp", authMiddleware, verifyOTP);
router.get("/history", authMiddleware, getBookingHistory);
module.exports = router;