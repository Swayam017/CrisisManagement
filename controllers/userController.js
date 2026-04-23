const User = require("../models/User");

exports.completeKYC = async (req, res) => {
  try {
    const { phone, address, idType, idNumber, distributorId } = req.body;

    const user = await User.findById(req.user.id);

    // ✅ Already KYC done
    if (user.kyc?.verified) {
      return res.status(400).json({
        message: "KYC already completed. You are already registered."
      });
    }

    // ❌ Distributor missing
    if (!distributorId) {
      return res.status(400).json({
        message: "Distributor not selected"
      });
    }

    // ✅ Bind distributor + KYC together (atomic logic)
    user.distributorId = distributorId;

    user.kyc = {
      phone,
      address,
      idType,
      idNumber,
      verified: true
    };

    await user.save();

    res.json({
      message: "KYC completed & distributor linked successfully ✅",
      distributorId: user.distributorId
    });

  } catch (err) {
    console.error("KYC ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
     .populate("distributorId", "name location");

    res.json({
      name: user.name,
      email: user.email,
      kyc: user.kyc,
      distributorId: user.distributorId
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};