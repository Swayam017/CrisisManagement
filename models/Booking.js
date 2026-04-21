const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Distributor"
  },

  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    default: null
  },
amount: {
  type: Number,
  required: true
},
  address: String,

 status: {
  type: String,
  enum: [
    "BOOKED",
    "ASSIGNED",
    "OUT_FOR_DELIVERY",
    "OTP_SENT",
    "DELIVERED"
  ],
  default: "BOOKED"
},

  bookingDate: {
    type: Date,
    default: Date.now
  },

 aiFlag: {
  type: String,
  enum: ["PENDING", "NORMAL", "FRAUD"],
  default: "PENDING",
  required: true
},
  aiAnalysis: String,
    otp: String,
  otpExpires: Date,
  isVerified: {
    type: Boolean,
    default: false
  },
  priority: {
  type: Number,
  default: 0
},
scheduledDate: Date,
deliverySlot: String
});

module.exports = mongoose.model("Booking", bookingSchema);