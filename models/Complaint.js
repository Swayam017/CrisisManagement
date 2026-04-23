const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true   // 🔥 important for linking
  },

  message: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
    default: "OPEN"
  }

}, { timestamps: true }); // ✅ this already creates createdAt + updatedAt

module.exports = mongoose.model("Complaint", complaintSchema);