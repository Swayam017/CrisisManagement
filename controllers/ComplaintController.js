const Complaint = require("../models/Complaint");

exports.createComplaint = async (req, res) => {
  try {
    const { bookingId, message } = req.body;

    const complaint = await Complaint.create({
      userId: req.user.id,
      bookingId,
      message
    });

    res.json({ message: "Complaint submitted", complaint });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};