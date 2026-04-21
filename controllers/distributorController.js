const Distributor = require("../models/Distributor");

exports.getDistributors = async (req, res) => {
  try {
    const { address } = req.query;

    // Simple logic (later you can use geo-location)
    const distributors = await Distributor.find();

    res.json(distributors);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};