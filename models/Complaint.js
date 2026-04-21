const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  },

  message: String,

  status: {
    type: String,
    enum: ["OPEN", "RESOLVED"],
    default: "OPEN"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Complaint", complaintSchema);