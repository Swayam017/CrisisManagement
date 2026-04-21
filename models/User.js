const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Distributor",
    default: null
  },

  kyc: {
    phone: String,
    address: String,
    idType: String,
    idNumber: String,
    verified: {
      type: Boolean,
      default: false
    }
  }
});

module.exports = mongoose.model("User", userSchema);