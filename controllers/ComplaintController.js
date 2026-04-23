const Complaint = require("../models/Complaint");
const Booking = require("../models/Booking");

exports.createComplaint = async (req, res) => {
  try {
    const { message } = req.body;

    const userId = req.user.id;

    // 🔥 GET USER'S CURRENT BOOKING
    const booking = await Booking.findOne({
      userId
    }).sort({ createdAt: -1 });

    if (!booking) {
      return res.status(400).json({
        message: "No booking found to raise complaint"
      });
    }

    const complaint = await Complaint.create({
      userId,
      bookingId: booking._id, // ✅ AUTO ATTACHED
      message
    });

    res.json({
      message: "Complaint submitted",
      complaint
    });

  } catch (err) {
    console.log("COMPLAINT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      userId: req.user.id
    })
      .populate("bookingId", "status address")
      .sort({ createdAt: -1 });

    res.json({ complaints });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};