const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Distributor",
    required: true
  },

  available: {
    type: Boolean,
    default: true
  },

  currentDeliveries: {
    type: Number,
    default: 0
  },

  maxCapacity: {
    type: Number,
    default: 3
  }
});

module.exports = mongoose.model("Agent", agentSchema);