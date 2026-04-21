const mongoose = require("mongoose");

const distributorSchema = new mongoose.Schema({
  name: String,
  location: String,
  contact: String
});

module.exports = mongoose.model("Distributor", distributorSchema);